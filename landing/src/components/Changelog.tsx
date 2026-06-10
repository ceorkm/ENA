/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ClaudeLogo, OpenAILogo } from "./Logos";

/* Wherever "Claude" or "Codex" appears in a note, put the official mark
   right before the word. Applies to GitHub-fetched notes too. */
function withLogos(text: string): React.ReactNode {
  const parts = text.split(/\b(Claude|Codex)\b/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) => {
    if (p === "Claude")
      return (
        <span key={i} className="whitespace-nowrap">
          <ClaudeLogo /> Claude
        </span>
      );
    if (p === "Codex")
      return (
        <span key={i} className="whitespace-nowrap">
          <OpenAILogo /> Codex
        </span>
      );
    return p;
  });
}

/* Set this to "owner/repo" once the GitHub repo is public — releases are
   fetched live from the GitHub API. Until then the seed list below shows. */
const GITHUB_REPO = "ceorkm/ena";

interface Note {
  lead?: string;
  text: string;
  sub?: string;
}

interface Release {
  version: string;
  date: string;
  notes: Note[];
}

const SEED: Release[] = [
  {
    version: "0.1.0",
    date: "2026-06-09",
    notes: [
      {
        lead: "ENA is out",
        text: "a floating bar that rests on your screen as a small orb. Click it, type a rough idea, press Return.",
        sub: "The bar floats over every app and follows you across Spaces, so enhancing a prompt never means switching windows.",
      },
      {
        lead: "Enhance anything",
        text: "no setup needed — type any rough idea and get a structured prompt back.",
      },
      {
        lead: "Add a project when you want",
        text: "optional: point ENA at a folder and your agent studies the codebase, so prompts about it reference actual files and conventions.",
      },
      {
        lead: "Claude and Codex",
        text: "ENA rides the CLI tools you are already signed into. Your existing plan, no API key.",
      },
      {
        lead: "Three versions every time",
        text: "Concise, Balanced and Detailed, with edit in place and a before and after diff.",
      },
      {
        lead: "Images and instructions",
        text: "attach screenshots from Finder and set custom instructions that apply to every enhance.",
      },
      {
        lead: "Signed and notarized",
        text: "first macOS build, shipped as a DMG.",
      },
    ],
  },
];

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* "Lead — rest of sentence" / "Lead: rest" → {lead, text}; plain line → {text} */
function parseLine(line: string): Note {
  const m = line.match(/^(.{2,60}?)(?:\s+—\s+|\s+-\s+|:\s+)(.+)$/);
  if (m) return { lead: m[1], text: m[2] };
  return { text: line };
}

function bodyToNotes(body: string): Note[] {
  return body
    .split("\n")
    .map((l) => l.replace(/^[-*]\s+/, "").replace(/[#*`]/g, "").trim())
    .filter((l) => l.length > 0)
    .map(parseLine);
}

export default function Changelog({ theme }: { theme: "dark" | "light" }) {
  const dark = theme === "dark";
  const [releases, setReleases] = useState<Release[]>(SEED);

  useEffect(() => {
    if (!GITHUB_REPO) return;
    fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: any[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setReleases(
          data.map((r) => ({
            version: (r.tag_name || "").replace(/^v/, ""),
            date: r.published_at,
            notes: bodyToNotes(r.body || ""),
          }))
        );
      })
      .catch(() => {}); // keep the seed list on any failure
  }, []);

  const ink = dark ? "text-white" : "text-[#1a1a1a]";
  const body = dark ? "text-white/70" : "text-[#1a1a1a]/70";
  const dim = dark ? "text-white/45" : "text-[#1a1a1a]/45";
  const faint = dark ? "text-white/30" : "text-[#1a1a1a]/35";
  const rule = dark ? "border-white/10" : "border-[#1a1a1a]/10";

  const latest = releases[0];

  return (
    <main className="flex-shrink-0 min-h-screen px-6 pt-32 pb-24 relative z-10" id="changelog-page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto flex gap-14"
      >
        {/* Release rail */}
        <aside className="hidden md:block w-36 flex-none">
          <div className="sticky top-28">
            <div className={"text-[11px] uppercase tracking-widest font-semibold mb-4 select-none " + faint}>
              Releases
            </div>
            <div className={"border-l " + rule}>
              <ul className="max-h-[60vh] overflow-y-auto">
                {releases.map((r, i) => (
                  <li key={r.version}>
                    <button
                      onClick={() =>
                        document
                          .getElementById("rel-" + r.version)
                          ?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }
                      className={
                        "w-full flex items-baseline justify-between gap-3 pl-4 pr-1 py-[5px] text-[13px] cursor-pointer transition-colors " +
                        (i === 0 ? ink + " font-medium" : dim + (dark ? " hover:text-white" : " hover:text-[#1a1a1a]"))
                      }
                    >
                      <span className="tabular-nums">{r.version}</span>
                      <span className={"text-[12px] tabular-nums " + faint}>{fmtShort(r.date)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 max-w-2xl">
          <div className={"text-[11px] uppercase tracking-widest font-semibold select-none " + faint}>
            Changelog
          </div>
          <h1 className={"font-serif text-4xl md:text-5xl tracking-tight mt-4 " + ink}>
            What&rsquo;s new in ENA.
          </h1>
          <p className={"mt-4 text-[15px] leading-relaxed " + dim}>
            Every release is logged here, in plain words. New abilities, fixes, and the
            steady polish that makes the bar feel right.
          </p>
          {latest && (
            <p className={"mt-4 text-[13px] " + dim}>
              Latest release <span className={ink + " font-medium"}>{latest.version}</span>
              <span className={"mx-2 " + faint}>·</span>
              {fmtShort(latest.date)}
            </p>
          )}

          {releases.map((rel) => (
            <section key={rel.version} id={"rel-" + rel.version} className="mt-14 scroll-mt-28">
              <div className={"text-[12px] font-medium " + faint}>{fmtShort(rel.date)}</div>
              <h2 className={"mt-1.5 text-[17px] font-semibold " + ink}>
                ENA <span className={dim + " font-normal"}>{rel.version}</span>
              </h2>

              <ul className={"mt-5 space-y-5 border-b pb-10 " + rule}>
                {rel.notes.map((n, j) => (
                  <li key={j} className="flex gap-3">
                    <span className={"mt-[9px] w-[5px] h-[5px] rounded-full flex-none " + (dark ? "bg-white/45" : "bg-[#1a1a1a]/40")} />
                    <div>
                      <p className={"text-[14.5px] leading-relaxed " + body}>
                        {n.lead && <span className={"font-semibold " + ink}>{withLogos(n.lead)} — </span>}
                        {withLogos(n.text)}
                      </p>
                      {n.sub && (
                        <p className={"mt-1.5 text-[13px] leading-relaxed " + dim}>{withLogos(n.sub)}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
