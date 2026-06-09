// ENA engine: local folder indexing (the "context engine") + prompt enhancement
// via the user's Claude / Codex CLI.

use ignore::WalkBuilder;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command;

/* ----------------------------- indexing ----------------------------- */

#[derive(Serialize, Deserialize, Clone)]
pub struct Lang {
    pub name: String,
    pub pct: u32,
    pub color: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ProjectInfo {
    pub name: String,
    pub path: String,        // display path (~ collapsed)
    #[serde(default)]
    pub real_path: String,   // absolute path (for re-index / freshness)
    pub files: u64,
    pub loc: String,         // e.g. "84k"
    pub summary: String,
    pub langs: Vec<Lang>,
    pub stack: Vec<String>,
    pub structure: Vec<(String, String)>,
    pub conventions: Vec<String>,
    pub context: String,     // compact digest fed to the model (not shown in UI)
    #[serde(default)]
    pub freshness: String,   // git HEAD(+dirty) or "nogit" - cheap staleness signal
    #[serde(default)]
    pub engine: String,      // "agent" once the agent has actually read the repo; else "scan"
}

fn ext_lang(ext: &str) -> Option<(&'static str, &'static str)> {
    // returns (display language, color)
    let m: &[(&str, &str, &str)] = &[
        ("ts", "TypeScript", "#3178c6"),
        ("tsx", "TypeScript", "#3178c6"),
        ("js", "JavaScript", "#f1e05a"),
        ("jsx", "JavaScript", "#f1e05a"),
        ("mjs", "JavaScript", "#f1e05a"),
        ("cjs", "JavaScript", "#f1e05a"),
        ("py", "Python", "#3572A5"),
        ("rs", "Rust", "#dea584"),
        ("go", "Go", "#00ADD8"),
        ("java", "Java", "#b07219"),
        ("kt", "Kotlin", "#A97BFF"),
        ("rb", "Ruby", "#701516"),
        ("php", "PHP", "#4F5D95"),
        ("swift", "Swift", "#F05138"),
        ("c", "C", "#555555"),
        ("h", "C", "#555555"),
        ("cpp", "C++", "#f34b7d"),
        ("cc", "C++", "#f34b7d"),
        ("cs", "C#", "#178600"),
        ("css", "CSS", "#563d7c"),
        ("scss", "CSS", "#563d7c"),
        ("html", "HTML", "#e34c26"),
        ("vue", "Vue", "#41b883"),
        ("svelte", "Svelte", "#ff3e00"),
        ("json", "JSON", "#cbcb41"),
        ("yml", "YAML", "#cb171e"),
        ("yaml", "YAML", "#cb171e"),
        ("md", "Markdown", "#083fa1"),
        ("sql", "SQL", "#e38c00"),
        ("sh", "Shell", "#89e051"),
    ];
    for (e, name, color) in m {
        if *e == ext {
            return Some((name, color));
        }
    }
    None
}

fn is_source_ext(ext: &str) -> bool {
    ext_lang(ext).map(|(n, _)| n != "JSON" && n != "Markdown" && n != "YAML").unwrap_or(false)
}

fn fmt_loc(n: u64) -> String {
    if n >= 1_000_000 {
        format!("{:.1}M", n as f64 / 1_000_000.0)
    } else if n >= 1000 {
        format!("{}k", n / 1000)
    } else {
        n.to_string()
    }
}

fn display_path(p: &str) -> String {
    if let Some(home) = std::env::var_os("HOME") {
        let home = home.to_string_lossy().to_string();
        if let Some(stripped) = p.strip_prefix(&home) {
            return format!("~{}", stripped);
        }
    }
    p.to_string()
}

/* ---- symbol extraction (lightweight, dependency-free) ---- */

// First identifier in `s` (skips leading non-ident chars).
fn first_ident(s: &str) -> Option<String> {
    let start = s.find(|c: char| c.is_alphabetic() || c == '_')?;
    let rest = &s[start..];
    let end = rest.find(|c: char| !(c.is_alphanumeric() || c == '_')).unwrap_or(rest.len());
    let id = &rest[..end];
    if id.is_empty() { None } else { Some(id.to_string()) }
}

fn after_any<'a>(line: &'a str, kws: &[&str]) -> Option<&'a str> {
    for kw in kws {
        if let Some(rest) = line.strip_prefix(kw) {
            return Some(rest);
        }
    }
    None
}

// Extract up to 6 top-level / exported symbol names from a source file.
fn extract_symbols(text: &str, ext: &str) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for raw in text.lines() {
        if out.len() >= 6 {
            break;
        }
        let t = raw.trim_start();
        let top_level = raw.len() == t.len(); // no leading whitespace
        let name = match ext {
            "ts" | "tsx" | "js" | "jsx" | "mjs" | "cjs" => {
                let exp = after_any(t, &[
                    "export default function ", "export async function ", "export function ",
                    "export const ", "export let ", "export var ", "export class ",
                    "export interface ", "export type ", "export enum ", "export abstract class ",
                ]);
                if let Some(rest) = exp {
                    first_ident(rest)
                } else if top_level {
                    after_any(t, &["async function ", "function ", "class "]).and_then(first_ident)
                } else {
                    None
                }
            }
            "py" => {
                if top_level { after_any(t, &["async def ", "def ", "class "]).and_then(first_ident) } else { None }
            }
            "rs" => after_any(t, &[
                "pub async fn ", "pub fn ", "pub struct ", "pub enum ", "pub trait ", "pub const ", "pub type ",
            ]).and_then(first_ident),
            "go" => {
                if let Some(rest) = t.strip_prefix("func ") {
                    if rest.trim_start().starts_with('(') { None } else { first_ident(rest) }
                } else {
                    None
                }
            }
            "rb" => after_any(t, &["def ", "class ", "module "]).and_then(first_ident),
            "java" | "kt" | "cs" => after_any(t, &[
                "public class ", "public interface ", "public enum ", "public final class ",
            ]).and_then(first_ident),
            _ => None,
        };
        if let Some(n) = name {
            if n.len() > 1 && !out.contains(&n) {
                out.push(n);
            }
        }
    }
    out
}

// Last few commit subjects (git only) - grounds prompts in recent work.
fn recent_commits(abs_path: &str) -> Vec<String> {
    if !Path::new(abs_path).join(".git").exists() {
        return Vec::new();
    }
    Command::new("git")
        .args(["-C", abs_path, "log", "-n", "8", "--pretty=format:%s"])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| {
            String::from_utf8_lossy(&o.stdout)
                .lines()
                .map(|l| l.trim().to_string())
                .filter(|l| !l.is_empty())
                .take(8)
                .collect()
        })
        .unwrap_or_default()
}

// Recent merged PR titles (best-effort, via the `gh` CLI) - grounds prompts in
// what's shipping. Returns an empty Vec if gh is missing/unauthenticated, the
// folder isn't a git repo, the command fails, or there's no output. Never errors.
fn recent_prs(abs_path: &str) -> Vec<String> {
    if !Path::new(abs_path).join(".git").exists() {
        return Vec::new();
    }
    let bin = resolve_bin("gh");
    // resolve_bin falls back to the bare name when nothing is found; if it's not
    // a real file, treat gh as unavailable rather than spawning a missing binary.
    if bin == "gh" && !Path::new(&bin).is_file() {
        return Vec::new();
    }
    let mut cmd = Command::new(&bin);
    cmd.args([
        "pr", "list", "--state", "merged", "--limit", "5",
        "--json", "title", "--jq", ".[].title",
    ])
    .current_dir(abs_path);
    output_timeout(cmd, 12)        // gh hits the network - cap it so indexing can't hang
        .ok()
        .filter(|o| o.status.success())
        .map(|o| {
            String::from_utf8_lossy(&o.stdout)
                .lines()
                .map(|l| l.trim().to_string())
                .filter(|l| !l.is_empty())
                .take(5)
                .collect()
        })
        .unwrap_or_default()
}

pub fn index_folder(path: String, cache_dir: Option<PathBuf>) -> Result<ProjectInfo, String> {
    let root = Path::new(&path);
    if !root.is_dir() {
        return Err(format!("Not a folder: {}", path));
    }
    // Canonical absolute path - used for the cache key, freshness, and re-index.
    let abs = std::fs::canonicalize(root)
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|_| path.clone());
    let name = root
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| path.clone());

    let mut file_count: u64 = 0;
    let mut total_loc: u64 = 0;
    let mut lang_lines: HashMap<String, (u64, String)> = HashMap::new(); // lang -> (lines, color)
    let mut top_dirs: HashMap<String, u64> = HashMap::new();
    let mut sample_files: Vec<(String, Vec<String>)> = Vec::new(); // (rel path, top symbols)
    let mut root_files: Vec<String> = Vec::new();

    // Always skip dependency/build artifact dirs (even with no .gitignore), so the
    // index reflects real source - not tens of thousands of target/ & node_modules files.
    let mut ob = ignore::overrides::OverrideBuilder::new(root);
    for d in [
        "node_modules", "target", ".git", ".next", ".nuxt", ".svelte-kit",
        ".venv", "venv", "__pycache__", ".gradle", "Pods", "DerivedData",
        ".turbo", ".cache", ".parcel-cache", ".pytest_cache", ".mypy_cache",
        "vendor", "dist/build",
    ] {
        let _ = ob.add(&format!("!{}/", d));
    }
    let overrides = ob.build().map_err(|e| format!("overrides: {}", e))?;

    let walker = WalkBuilder::new(root)
        .hidden(false)        // include dotfiles, but .gitignore still applies
        .git_ignore(true)
        .git_exclude(true)
        .parents(true)
        .overrides(overrides)
        .max_depth(None)
        .build();

    const MAX_FILES: u64 = 40_000;
    for dent in walker.flatten() {
        if file_count >= MAX_FILES {
            break;
        }
        let p = dent.path();
        if p == root {
            continue;
        }
        let ft = match dent.file_type() {
            Some(ft) => ft,
            None => continue,
        };
        // top-level dir / file names (relative to root, first component)
        if let Ok(rel) = p.strip_prefix(root) {
            let mut comps = rel.components();
            if let Some(first) = comps.next() {
                let first = first.as_os_str().to_string_lossy().to_string();
                if ft.is_dir() && comps.clone().next().is_none() {
                    top_dirs.entry(first).or_insert(0);
                } else if ft.is_file() {
                    // count file under its top-level dir
                    if rel.components().count() > 1 {
                        *top_dirs.entry(first).or_insert(0) += 1;
                    } else {
                        root_files.push(first);
                    }
                }
            }
        }
        if !ft.is_file() {
            continue;
        }
        file_count += 1;

        let ext = p
            .extension()
            .map(|e| e.to_string_lossy().to_lowercase())
            .unwrap_or_default();

        if let Some((lang, color)) = ext_lang(&ext) {
            // read once: count lines + (for source files) extract top symbols
            if let Ok(bytes) = std::fs::read(p) {
                if !bytes.contains(&0) {
                    let lines = bytes.iter().filter(|&&b| b == b'\n').count() as u64 + 1;
                    total_loc += lines;
                    let e = lang_lines.entry(lang.to_string()).or_insert((0, color.to_string()));
                    e.0 += lines;
                    if is_source_ext(&ext) && sample_files.len() < 60 {
                        if let Ok(rel) = p.strip_prefix(root) {
                            let text = String::from_utf8_lossy(&bytes);
                            let syms = extract_symbols(&text, &ext);
                            sample_files.push((rel.to_string_lossy().to_string(), syms));
                        }
                    }
                }
            }
        }
    }

    // languages → top 4 by lines, with pct
    let mut langs_vec: Vec<(String, u64, String)> =
        lang_lines.into_iter().map(|(k, (l, c))| (k, l, c)).collect();
    langs_vec.sort_by(|a, b| b.1.cmp(&a.1));
    let lang_total: u64 = langs_vec.iter().map(|x| x.1).sum::<u64>().max(1);
    let mut langs: Vec<Lang> = Vec::new();
    let mut shown = 0u64;
    for (k, l, c) in langs_vec.iter().take(4) {
        let pct = ((*l as f64 / lang_total as f64) * 100.0).round() as u32;
        shown += pct as u64;
        langs.push(Lang { name: k.clone(), pct, color: c.clone() });
    }
    if langs_vec.len() > 4 && shown < 100 {
        langs.push(Lang { name: "Other".into(), pct: (100 - shown) as u32, color: "#9aa0a6".into() });
    }

    // stack detection from root files
    let rf: Vec<String> = root_files.iter().map(|s| s.to_lowercase()).collect();
    let has = |n: &str| rf.iter().any(|f| f == n);
    let has_pre = |p: &str| rf.iter().any(|f| f.starts_with(p));
    let mut stack: Vec<String> = Vec::new();
    if has("package.json") { stack.push("Node".into()); }
    if has("tsconfig.json") { stack.push("TypeScript".into()); }
    if has_pre("vite.config") { stack.push("Vite".into()); }
    if has_pre("next.config") { stack.push("Next.js".into()); }
    if has_pre("tailwind.config") { stack.push("Tailwind".into()); }
    if has("cargo.toml") { stack.push("Rust".into()); }
    if has("go.mod") { stack.push("Go".into()); }
    if has("requirements.txt") || has("pyproject.toml") || has("setup.py") { stack.push("Python".into()); }
    if has("gemfile") { stack.push("Ruby".into()); }
    if has("pom.xml") || has("build.gradle") { stack.push("Java".into()); }
    if has("dockerfile") { stack.push("Docker".into()); }
    if stack.is_empty() {
        if let Some(top) = langs.first() { stack.push(top.name.clone()); }
    }

    // structure: top dirs by file count
    let mut dirs_vec: Vec<(String, u64)> = top_dirs.into_iter().filter(|(_, c)| *c > 0).collect();
    dirs_vec.sort_by(|a, b| b.1.cmp(&a.1));
    let structure: Vec<(String, String)> = dirs_vec
        .iter()
        .take(6)
        .map(|(d, c)| (d.clone(), format!("{} files", c)))
        .collect();

    // conventions: honest, config-derived
    let mut conventions: Vec<String> = Vec::new();
    if has("tsconfig.json") { conventions.push("TypeScript".into()); }
    if has_pre("tailwind.config") { conventions.push("Tailwind tokens".into()); }
    if rf.iter().any(|f| f.starts_with(".eslintrc") || f == "eslint.config.js" || f == "eslint.config.mjs") {
        conventions.push("ESLint configured".into());
    }
    if rf.iter().any(|f| f.starts_with(".prettierrc") || f == "prettier.config.js") {
        conventions.push("Prettier formatting".into());
    }
    if dirs_vec.iter().any(|(d, _)| d == "tests" || d == "test" || d == "__tests__") {
        conventions.push("Has a test suite".into());
    }
    if conventions.is_empty() {
        conventions.push(format!("Primarily {}", langs.first().map(|l| l.name.clone()).unwrap_or_else(|| "code".into())));
    }

    let top_lang = langs.first().map(|l| l.name.clone()).unwrap_or_else(|| "code".into());
    let summary = format!(
        "A {} project - {} files, ~{} lines. Stack: {}.",
        top_lang,
        file_count,
        fmt_loc(total_loc),
        if stack.is_empty() { "n/a".into() } else { stack.join(", ") }
    );

    // context digest for the model
    let mut context = String::new();
    context.push_str(&format!("Project: {}\n", name));
    context.push_str(&format!("Languages: {}\n", langs.iter().map(|l| format!("{} {}%", l.name, l.pct)).collect::<Vec<_>>().join(", ")));
    context.push_str(&format!("Stack: {}\n", stack.join(", ")));
    context.push_str(&format!("Top-level structure: {}\n", structure.iter().map(|(d, c)| format!("{}/ ({})", d, c)).collect::<Vec<_>>().join(", ")));
    context.push_str("Representative files (with key symbols):\n");
    for (sp, syms) in sample_files.iter().take(50) {
        if syms.is_empty() {
            context.push_str(&format!("- {}\n", sp));
        } else {
            context.push_str(&format!("- {} \u{2014} {}\n", sp, syms.join(", ")));
        }
    }
    // Recent git history, when available - grounds prompts in what's changing.
    let commits = recent_commits(&abs);
    if !commits.is_empty() {
        context.push_str("Recent commits:\n");
        for c in commits.iter() {
            context.push_str(&format!("- {}\n", c));
        }
    }
    // Recent merged PRs, when the `gh` CLI is available - grounds prompts in what's shipping.
    let prs = recent_prs(&abs);
    if !prs.is_empty() {
        context.push_str("Recent merged PRs:\n");
        for p in prs.iter() {
            context.push_str(&format!("- {}\n", p));
        }
    }

    let info = ProjectInfo {
        name,
        path: display_path(&abs),
        real_path: abs.clone(),
        files: file_count,
        loc: fmt_loc(total_loc),
        summary,
        langs,
        stack,
        structure,
        conventions,
        context,
        freshness: freshness_token(&abs),
        engine: "scan".into(),
    };

    // Persist the digest so reopening this project is instant (stale-while-revalidate).
    if let Some(dir) = cache_dir.as_ref() {
        let _ = save_index(dir, &info);
    }

    Ok(info)
}

/* ----------------------- persistence + freshness ----------------------- */

/// Stable filename for a project's cached digest (non-cryptographic hash of abs path).
fn cache_file(dir: &Path, abs_path: &str) -> PathBuf {
    use std::hash::{Hash, Hasher};
    let mut h = std::collections::hash_map::DefaultHasher::new();
    abs_path.hash(&mut h);
    dir.join(format!("{:016x}.json", h.finish()))
}

fn save_index(dir: &Path, info: &ProjectInfo) -> Result<(), String> {
    std::fs::create_dir_all(dir).map_err(|e| format!("mkdir cache: {}", e))?;
    let json = serde_json::to_string(info).map_err(|e| format!("serialize index: {}", e))?;
    std::fs::write(cache_file(dir, &info.real_path), json).map_err(|e| format!("write index: {}", e))?;
    Ok(())
}

/// Load a previously-persisted digest for `path` (None if absent/unreadable).
pub fn load_cached(path: String, cache_dir: Option<PathBuf>) -> Option<ProjectInfo> {
    let dir = cache_dir?;
    let abs = std::fs::canonicalize(Path::new(&path))
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or(path);
    let raw = std::fs::read_to_string(cache_file(&dir, &abs)).ok()?;
    serde_json::from_str::<ProjectInfo>(&raw).ok()
}

/// Cheap staleness signal: git HEAD (+":dirty" when there are uncommitted changes),
/// or "nogit" for non-git folders (which are always treated as stale).
pub fn freshness_token(abs_path: &str) -> String {
    if !Path::new(abs_path).join(".git").exists() {
        return "nogit".to_string();
    }
    let head = Command::new("git")
        .args(["-C", abs_path, "rev-parse", "HEAD"])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default();
    if head.is_empty() {
        return "nogit".to_string();
    }
    let dirty = Command::new("git")
        .args(["-C", abs_path, "status", "--porcelain"])
        .output()
        .ok()
        .map(|o| !o.stdout.is_empty())
        .unwrap_or(false);
    if dirty { format!("{}:dirty", head) } else { head }
}

/* ----------------------------- enhancement ----------------------------- */

#[derive(Serialize, Deserialize, Default)]
pub struct EnhanceResult {
    pub concise: String,
    pub balanced: String,
    pub detailed: String,
    pub source: String, // "model" | "fallback"
}

fn system_prompt() -> String {
    // Encodes the structure ENA's research surfaced (goal → file-referencing
    // checklist → Context paragraph). Grounds output in the provided project context.
    r#"You are ENA, a prompt enhancer for AI coding agents. You receive a developer's rough prompt and (optionally) a digest of their indexed project (languages, stack, structure, real file paths).

Rewrite the rough prompt into a clear, structured prompt the coding agent can execute on the first try. Produce THREE versions of increasing detail: "concise", "balanced", and "detailed".

STEP 1 - Judge relevance to the project:
- PROJECT-RELATED: the request is about changing, adding, fixing, or understanding the user's own codebase.
- GENERAL: the request is a standalone task, question, or writing/coding ask NOT tied to this repo (e.g. "write a SQL query", "explain CRDTs", "draft a cold email", a generic algorithm). Even if a project is indexed, many prompts are GENERAL - judge honestly.

STEP 2 - Enhance accordingly:
- If PROJECT-RELATED and PROJECT CONTEXT is provided: ground every reference in it, cite real file paths/directories from it (NEVER invent paths), and for "balanced"/"detailed" include a numbered checklist of concrete steps referencing real files, ending with a "Context:" line telling the agent to match the project's existing patterns/conventions.
- If GENERAL (or no project context): write a clean, well-structured prompt that stands on its own. Do NOT mention the project, its files, frameworks, conventions, or add any project "Context:" line. Do not force codebase-grounding onto a request that doesn't need it.

You are running inside the user's project directory and CAN read files. For PROJECT-RELATED requests, open the few files actually relevant to the request to ground the prompt in real code (correct paths, function/types names, patterns). Prefer the PROJECT CONTEXT summary; only open files when you need exact details. Be efficient - don't crawl the whole repo.

Always:
- Restate the developer's intent as a specific, disambiguated objective.
- "concise" is one tight paragraph; "balanced" is a short structured prompt; "detailed" is a thorough spec (for project work, with files-to-touch and requirements).
- Output ONLY the enhanced prompt text for each field - no preamble, no meta-commentary.
- Use plain punctuation. Do NOT use em dashes or en dashes (the characters that look like long hyphens); use commas, periods, colons, or parentheses instead."#
        .to_string()
}

/// Prompt for the agent to actually explore the repo and write a real summary.
fn analysis_prompt() -> String {
    r#"Explore THIS codebase by reading the files you need (use your tools). Then return ONLY a JSON object - no prose, no markdown fences - with exactly this shape:
{"overview": "2-3 sentences: what this project is and its architecture", "stack": ["..."], "structure": [["dir/or/file","what it holds"]], "conventions": ["how this codebase does things - patterns to follow"], "key_files": ["path - purpose"]}
Be concrete and accurate to what you actually read in THIS repo. Keep each field focused. Output nothing outside the JSON object."#
        .to_string()
}

#[derive(serde::Deserialize, Default)]
struct AgentSummary {
    #[serde(default)] overview: String,
    #[serde(default)] stack: Vec<String>,
    #[serde(default)] structure: Vec<Vec<String>>,
    #[serde(default)] conventions: Vec<String>,
    #[serde(default)] key_files: Vec<String>,
}

/// Build the digest fed to the enhancer from the agent's real understanding.
fn build_agent_context(info: &ProjectInfo, key_files: &[String]) -> String {
    let mut s = String::new();
    s.push_str(&format!("Project: {} - {} files, {} lines\n", info.name, info.files, info.loc));
    if !info.summary.trim().is_empty() {
        s.push_str(&format!("Overview: {}\n", info.summary));
    }
    if !info.stack.is_empty() {
        s.push_str(&format!("Stack: {}\n", info.stack.join(", ")));
    }
    if !info.structure.is_empty() {
        s.push_str("Structure:\n");
        for (d, desc) in &info.structure {
            s.push_str(&format!("- {}: {}\n", d, desc));
        }
    }
    if !key_files.is_empty() {
        s.push_str("Key files:\n");
        for k in key_files {
            s.push_str(&format!("- {}\n", k));
        }
    }
    if !info.conventions.is_empty() {
        s.push_str("Conventions:\n");
        for c in &info.conventions {
            s.push_str(&format!("- {}\n", c));
        }
    }
    s
}

/// THE REAL INDEX: the agent reads the repo and writes the summary. A quick
/// mechanical pass supplies the factual file/loc/lang counts; the agent then
/// supplies the understanding. NO FALLBACK - if the agent can't actually read the
/// repo, this errors loudly rather than handing back a fake mechanical digest.
pub async fn analyze_project(
    path: String,
    cache_dir: Option<PathBuf>,
    provider: Option<String>,
) -> Result<ProjectInfo, String> {
    let provider = provider
        .filter(|p| !p.trim().is_empty())
        .unwrap_or_else(|| std::env::var("ENA_PROVIDER").unwrap_or_else(|_| "claude".into()))
        .to_lowercase();
    if provider != "claude" && provider != "codex" {
        return Err(format!("Unknown agent '{}'. Use Claude or Codex.", provider));
    }

    // factual mechanical pass - real counts + abs path + freshness (no cache write)
    let p2 = path.clone();
    let mut info = tokio::task::spawn_blocking(move || index_folder(p2, None))
        .await
        .map_err(|e| format!("scan task failed: {}", e))??;

    let abs = info.real_path.clone();
    if abs.is_empty() {
        return Err("Couldn't resolve the project path.".into());
    }

    // the agent actually reads the repo - any failure surfaces, no silent fallback
    let prov = provider.clone();
    let abs2 = abs.clone();
    let text = tokio::task::spawn_blocking(move || run_analysis_cli(&prov, &abs2))
        .await
        .map_err(|e| format!("analyze task failed: {}", e))?
        .map_err(|e| format!("{} couldn't read the project - {}", provider, e))?;

    let js = extract_json(&text)
        .ok_or_else(|| format!("{} returned no JSON summary.", provider))?;
    let sum = serde_json::from_str::<AgentSummary>(&js)
        .map_err(|e| format!("{} summary didn't parse - {}", provider, e))?;
    if sum.overview.trim().is_empty() {
        return Err(format!("{} returned an empty summary.", provider));
    }

    info.summary = sum.overview.clone();
    if !sum.stack.is_empty() { info.stack = sum.stack.clone(); }
    if !sum.structure.is_empty() {
        info.structure = sum.structure.iter()
            .map(|v| (v.get(0).cloned().unwrap_or_default(), v.get(1).cloned().unwrap_or_default()))
            .filter(|(d, _)| !d.is_empty())
            .collect();
    }
    if !sum.conventions.is_empty() { info.conventions = sum.conventions.clone(); }
    info.context = build_agent_context(&info, &sum.key_files);
    info.engine = "agent".into();   // the agent really read the repo

    if let Some(dir) = cache_dir.as_ref() {
        let _ = save_index(dir, &info);
    }
    Ok(info)
}

/// Run the agent (claude/codex) inside the repo to produce the analysis JSON text.
fn run_analysis_cli(provider: &str, abs: &str) -> Result<String, String> {
    let prompt = analysis_prompt();
    if provider == "codex" {
        let dir = std::env::temp_dir();
        let id = next_id();
        let schema_path = dir.join(format!("ena-asc-{}-{}.json", std::process::id(), id));
        let out_path = dir.join(format!("ena-aso-{}-{}.json", std::process::id(), id));
        // Codex uses OpenAI structured outputs: every object needs additionalProperties:false
        // AND every property listed in "required", or it 400s (invalid_json_schema) and we'd
        // silently fall back to the mechanical scan. Keep this strict.
        let schema = r#"{"type":"object","properties":{"overview":{"type":"string"},"stack":{"type":"array","items":{"type":"string"}},"structure":{"type":"array","items":{"type":"array","items":{"type":"string"}}},"conventions":{"type":"array","items":{"type":"string"}},"key_files":{"type":"array","items":{"type":"string"}}},"required":["overview","stack","structure","conventions","key_files"],"additionalProperties":false}"#;
        std::fs::write(&schema_path, schema).map_err(|e| format!("schema write: {}", e))?;
        let bin = resolve_bin("codex");
        let mut cmd = Command::new(&bin);
        cmd.arg("exec").arg("--skip-git-repo-check").arg("--sandbox").arg("read-only")
            .arg("--output-schema").arg(&schema_path).arg("-o").arg(&out_path)
            .arg(&prompt).current_dir(abs);
        let res = output_timeout(cmd, 240);
        let _ = std::fs::remove_file(&schema_path);
        let out = res.map_err(|e| format!("codex analyze: {}", e))?;
        if !out.status.success() {
            let _ = std::fs::remove_file(&out_path);
            return Err(format!("codex exited {}", out.status));
        }
        let content = std::fs::read_to_string(&out_path).map_err(|e| format!("codex out: {}", e))?;
        let _ = std::fs::remove_file(&out_path);
        Ok(content)
    } else {
        let bin = resolve_bin("claude");
        let mut cmd = Command::new(&bin);
        cmd.arg("-p").arg(&prompt).arg("--output-format").arg("json").current_dir(abs);
        let out = output_timeout(cmd, 240)?;
        if !out.status.success() {
            return Err(format!("claude exited {}", out.status));
        }
        let stdout = String::from_utf8_lossy(&out.stdout);
        let v: serde_json::Value = serde_json::from_str(stdout.trim()).map_err(|e| format!("claude json: {}", e))?;
        Ok(v.get("result").and_then(|x| x.as_str()).unwrap_or("").to_string())
    }
}

/// Provider dispatch: CLI (subscription, keyless) → API key (HTTP). No local fake.
/// `provider` (from the UI model picker) overrides the ENA_PROVIDER env default.
pub async fn enhance_prompt(
    draft: String,
    project_context: Option<String>,
    provider: Option<String>,
    api_key: Option<String>,
    images: Vec<String>,
    project_path: Option<String>,
    instructions: Option<String>,
) -> Result<EnhanceResult, String> {
    let draft = draft.trim().to_string();
    if draft.is_empty() {
        return Ok(EnhanceResult::default());
    }
    let instructions = instructions.filter(|s| !s.trim().is_empty());

    let provider = provider
        .filter(|p| !p.trim().is_empty())
        .unwrap_or_else(|| std::env::var("ENA_PROVIDER").unwrap_or_else(|_| "claude".into()))
        .to_lowercase();

    // CLI providers - ride the user's existing `claude` / `codex` login (no API key).
    // NO FALLBACK: if the selected agent fails, surface the error instead of faking it.
    if provider == "claude" || provider == "codex" {
        let d = draft.clone();
        let ctx = project_context.clone();
        let prov = provider.clone();
        let imgs = images.clone();
        let pp = project_path.clone();
        let ins = instructions.clone();
        return tokio::task::spawn_blocking(move || run_cli(&prov, &d, ctx.as_deref(), &imgs, pp.as_deref(), ins.as_deref()))
            .await
            .map_err(|e| format!("cli task failed: {}", e))?
            .map_err(|e| format!("{} couldn't enhance - {}", provider, e));
    }

    // Direct Anthropic API - only reached if an explicit key is set for a non-CLI provider.
    if let Some(k) = api_key.filter(|k| !k.trim().is_empty()) {
        return enhance_via_api(&draft, project_context.as_deref(), &k, instructions.as_deref()).await;
    }

    Err(format!("No enhancer available for '{}'.", provider))
}

fn build_prompt_text(draft: &str, ctx: Option<&str>, images: &[String], instructions: Option<&str>) -> String {
    let mut s = system_prompt();
    s.push_str("\n\n");
    if let Some(ins) = instructions {
        if !ins.trim().is_empty() {
            s.push_str("USER'S CUSTOM INSTRUCTIONS - apply these to the tone, style, and shape of the enhanced prompts. They take priority over the defaults above, EXCEPT they must not change the required JSON output format:\n");
            s.push_str(ins.trim());
            s.push_str("\n\n");
        }
    }
    if let Some(c) = ctx {
        if !c.trim().is_empty() {
            s.push_str("PROJECT CONTEXT:\n");
            s.push_str(c);
            s.push_str("\n\n");
        }
    }
    s.push_str("ROUGH PROMPT:\n");
    s.push_str(draft);
    if !images.is_empty() {
        s.push_str("\n\nATTACHED IMAGES - open and look at each file below, then factor what you see (UI, errors, designs, diagrams) into the enhanced prompts:\n");
        for p in images {
            s.push_str("- ");
            s.push_str(p);
            s.push('\n');
        }
    }
    s.push_str("\n\nReturn ONLY a single JSON object with string fields \"concise\", \"balanced\", and \"detailed\" - no markdown fences, no commentary.");
    s
}

fn run_cli(provider: &str, draft: &str, ctx: Option<&str>, images: &[String], cwd: Option<&str>, instructions: Option<&str>) -> Result<EnhanceResult, String> {
    let prompt = build_prompt_text(draft, ctx, images, instructions);
    match provider {
        "codex" => run_codex_cli(&prompt, images, cwd),
        _ => run_claude_cli(&prompt, cwd),
    }
}

/// Resolve a CLI by name via PATH, then known install locations (GUI apps get a
/// minimal PATH that often misses ~/.local/bin and /opt/homebrew/bin).
fn resolve_bin(name: &str) -> String {
    if let Some(p) = std::env::var_os("PATH") {
        for dir in std::env::split_paths(&p) {
            let c = dir.join(name);
            if c.is_file() {
                return c.to_string_lossy().to_string();
            }
        }
    }
    let home = std::env::var("HOME").unwrap_or_default();
    let candidates = [
        format!("{}/.local/bin/{}", home, name),
        format!("/opt/homebrew/bin/{}", name),
        format!("/usr/local/bin/{}", name),
    ];
    for c in candidates.iter() {
        if std::path::Path::new(c).is_file() {
            return c.clone();
        }
    }
    name.to_string()
}

/// Run a command with a hard wall-clock timeout; kills it if it overruns so a
/// hung CLI (auth stall, network) can't wedge the app forever.
fn output_timeout(mut cmd: Command, secs: u64) -> Result<std::process::Output, String> {
    use std::sync::atomic::{AtomicBool, Ordering};
    use std::sync::Arc;
    use std::time::Duration;
    cmd.stdout(std::process::Stdio::piped()).stderr(std::process::Stdio::piped());
    let child = cmd.spawn().map_err(|e| format!("spawn failed: {}", e))?;
    let pid = child.id();
    let done = Arc::new(AtomicBool::new(false));
    let d2 = done.clone();
    let wd = std::thread::spawn(move || {
        for _ in 0..(secs * 10) {
            std::thread::sleep(Duration::from_millis(100));
            if d2.load(Ordering::Relaxed) {
                return;
            }
        }
        let _ = std::process::Command::new("kill").arg("-9").arg(pid.to_string()).status();
    });
    let out = child.wait_with_output().map_err(|e| format!("wait failed: {}", e))?;
    done.store(true, Ordering::Relaxed);
    let _ = wd.join();
    Ok(out)
}

fn run_claude_cli(prompt: &str, cwd: Option<&str>) -> Result<EnhanceResult, String> {
    let bin = resolve_bin("claude");
    let mut cmd = Command::new(&bin);
    cmd.arg("-p").arg(prompt).arg("--output-format").arg("json");
    if let Some(d) = cwd { if !d.is_empty() { cmd.current_dir(d); } }   // run inside the repo so it can read files
    let out = output_timeout(cmd, 150)?;
    if !out.status.success() {
        return Err(format!("claude exited {}: {}", out.status, String::from_utf8_lossy(&out.stderr)));
    }
    let stdout = String::from_utf8_lossy(&out.stdout);
    let v: serde_json::Value = serde_json::from_str(stdout.trim()).map_err(|e| format!("claude json: {}", e))?;
    let result = v.get("result").and_then(|x| x.as_str()).ok_or("claude: no result field")?;
    let mut r = parse_three(result)?;
    r.source = "claude-cli".into();
    Ok(r)
}

fn run_codex_cli(prompt: &str, images: &[String], cwd: Option<&str>) -> Result<EnhanceResult, String> {
    let dir = std::env::temp_dir();
    let id = next_id();
    let schema_path = dir.join(format!("ena-schema-{}-{}.json", std::process::id(), id));
    let out_path = dir.join(format!("ena-out-{}-{}.json", std::process::id(), id));
    let schema = r#"{"type":"object","properties":{"concise":{"type":"string"},"balanced":{"type":"string"},"detailed":{"type":"string"}},"required":["concise","balanced","detailed"],"additionalProperties":false}"#;
    std::fs::write(&schema_path, schema).map_err(|e| format!("schema write: {}", e))?;

    let bin = resolve_bin("codex");
    let mut cmd = std::process::Command::new(&bin);
    cmd.arg("exec")
        .arg("--skip-git-repo-check")
        .arg("--sandbox")
        .arg("read-only")
        .arg("--output-schema")
        .arg(&schema_path)
        .arg("-o")
        .arg(&out_path);
    // Attach images so Codex actually *sees* them (vision), via its -i flag.
    for img in images {
        cmd.arg("-i").arg(img);
    }
    // `-i/--image` is VARIADIC - without this `--` it greedily swallows the prompt
    // as another image filename, leaving Codex waiting on stdin forever.
    if !images.is_empty() {
        cmd.arg("--");
    }
    cmd.arg(prompt);
    // Run inside the repo (read-only) so Codex can read real files; else temp dir.
    match cwd.filter(|d| !d.is_empty()) {
        Some(d) => { cmd.current_dir(d); }
        None => { cmd.current_dir(&dir); }
    }
    let res = output_timeout(cmd, 150);
    let _ = std::fs::remove_file(&schema_path);   // always clean the schema temp file
    let out = res.map_err(|e| format!("codex spawn failed: {}", e))?;
    if !out.status.success() {
        let _ = std::fs::remove_file(&out_path);
        return Err(format!("codex exited {}: {}", out.status, String::from_utf8_lossy(&out.stderr)));
    }
    let content = std::fs::read_to_string(&out_path).map_err(|e| format!("codex out read: {}", e))?;
    let _ = std::fs::remove_file(&out_path);
    let mut r = parse_three(&content)?;
    r.source = "codex-cli".into();
    Ok(r)
}

fn extract_json(text: &str) -> Option<String> {
    let t = text
        .trim()
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();
    let start = t.find('{')?;
    let end = t.rfind('}')?;
    if end > start { Some(t[start..=end].to_string()) } else { None }
}

fn parse_three(text: &str) -> Result<EnhanceResult, String> {
    let json = extract_json(text).ok_or("no JSON object in CLI output")?;
    let parsed: serde_json::Value = serde_json::from_str(&json).map_err(|e| format!("parse: {}", e))?;
    let g = |k: &str| parsed.get(k).and_then(|x| x.as_str()).unwrap_or("").to_string();
    let r = EnhanceResult { concise: g("concise"), balanced: g("balanced"), detailed: g("detailed"), source: "cli".into() };
    if r.concise.is_empty() && r.balanced.is_empty() && r.detailed.is_empty() {
        return Err("empty enhancement fields".into());
    }
    Ok(r)
}

fn next_id() -> u64 {
    use std::sync::atomic::{AtomicU64, Ordering};
    static C: AtomicU64 = AtomicU64::new(0);
    C.fetch_add(1, Ordering::Relaxed)
}

/// Direct Anthropic Messages API (used only when an API key is set).
async fn enhance_via_api(draft: &str, ctx: Option<&str>, api_key: &str, instructions: Option<&str>) -> Result<EnhanceResult, String> {
    let model = std::env::var("ENA_MODEL").unwrap_or_else(|_| "claude-opus-4-8".to_string());
    let base = std::env::var("ANTHROPIC_BASE_URL").unwrap_or_else(|_| "https://api.anthropic.com".to_string());
    let ins_block = match instructions {
        Some(i) if !i.trim().is_empty() => format!("USER'S CUSTOM INSTRUCTIONS (apply to tone/style/shape, but keep the JSON output format):\n{}\n\n", i.trim()),
        _ => String::new(),
    };
    let user_content = match ctx {
        Some(c) if !c.trim().is_empty() => format!("{}PROJECT CONTEXT:\n{}\n\nROUGH PROMPT:\n{}", ins_block, c, draft),
        _ => format!("{}ROUGH PROMPT:\n{}", ins_block, draft),
    };
    let body = serde_json::json!({
        "model": model,
        "max_tokens": 2000,
        "system": system_prompt(),
        "messages": [{ "role": "user", "content": user_content }],
        "output_config": { "format": { "type": "json_schema", "schema": {
            "type": "object",
            "properties": { "concise": {"type":"string"}, "balanced": {"type":"string"}, "detailed": {"type":"string"} },
            "required": ["concise", "balanced", "detailed"],
            "additionalProperties": false
        }}}
    });
    let client = reqwest::Client::new();
    let resp = client
        .post(format!("{}/v1/messages", base.trim_end_matches('/')))
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("request failed: {}", e))?;
    let status = resp.status();
    let text = resp.text().await.map_err(|e| format!("read failed: {}", e))?;
    if !status.is_success() {
        return Err(format!("api {}", status.as_u16()));
    }
    let v: serde_json::Value = serde_json::from_str(&text).map_err(|e| format!("bad response json: {}", e))?;
    let inner = v.get("content").and_then(|c| c.get(0)).and_then(|b| b.get("text")).and_then(|t| t.as_str())
        .ok_or("no text in response")?;
    let mut r = parse_three(inner)?;
    r.source = "model".into();
    Ok(r)
}
