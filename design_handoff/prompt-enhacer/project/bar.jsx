/* ENA / Hone — FloatingBar with project-context engine.
   Flow: Add project → pick folder → live index (1–100%) → summary digest
   → file-aware enhancement. One component, 3 variants, fully interactive. */

const { useState, useRef, useEffect } = React;

/* ----------------------------- icons ----------------------------- */
function Spark({ size = 22, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 0.5C12.9 7 17 11.1 23.5 12C17 12.9 12.9 17 12 23.5C11.1 17 7 12.9 0.5 12C7 11.1 11.1 7 12 0.5Z" fill="currentColor"/>
      <path d="M19.5 1.5C19.8 3.6 21.4 5.2 23.5 5.5C21.4 5.8 19.8 7.4 19.5 9.5C19.2 7.4 17.6 5.8 15.5 5.5C17.6 5.2 19.2 3.6 19.5 1.5Z" fill="currentColor" opacity="0.55"/>
    </svg>
  );
}
const Chevron = ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconClock = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconGear = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8"/><path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5M18.4 18.4l-1.5-1.5M7.1 7.1L5.6 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconCopy = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="12" height="12" rx="2.4" stroke="currentColor" strokeWidth="1.8"/><path d="M5 16V6a2 2 0 0 1 2-2h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconInsert = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 20h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconRegen = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20 11a8 8 0 1 0-1.6 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M20 4v5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconCheck = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IconClose = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const IconFolder = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 7.5A2 2 0 0 1 5 5.5h3.6a2 2 0 0 1 1.5.7l.9 1.05a2 2 0 0 0 1.5.7H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.6"/></svg>;
const IconPlus = ({ size = 15 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>;
const IconFile = ({ size = 12 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 3h8l4 4v14H6V3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;

/* ----------------------------- primitives ----------------------------- */
function Segmented({ value, onChange, options, small }) {
  return (
    <div className={"hseg" + (small ? " hseg--sm" : "")}>
      {options.map((o) => (
        <button key={o.v} className={"hseg__opt" + (value === o.v ? " is-on" : "")} onClick={() => onChange(o.v)}>{o.label}</button>
      ))}
    </div>
  );
}
function Toggle({ on, onClick }) {
  return <button className={"htog" + (on ? " is-on" : "")} onClick={onClick} aria-pressed={on}><span className="htog__dot" /></button>;
}
function SettingToggle({ def }) {
  const [on, setOn] = useState(!!def);
  return <Toggle on={on} onClick={() => setOn(!on)} />;
}

/* renders inline `code` and `file/path` tokens inside a string */
function Inline({ text }) {
  const parts = text.split("`");
  return parts.map((p, i) => {
    if (i % 2 === 0) return <React.Fragment key={i}>{p}</React.Fragment>;
    const isFile = /[\/.]/.test(p) && !/\s/.test(p);
    return isFile
      ? <span key={i} className="tok tok--file"><IconFile size={11} />{p}</span>
      : <code key={i} className="tok tok--code">{p}</code>;
  });
}

/* renders an enhanced prompt with structure (labels / bullets / file refs) */
function RenderPrompt({ text }) {
  return (
    <div className="hprompt">
      {text.split("\n").map((ln, i) => {
        if (ln.trim() === "") return <div key={i} className="hprompt__gap" />;
        if (/^- /.test(ln)) return <div key={i} className="hprompt__li"><span className="hprompt__dot" /><span><Inline text={ln.slice(2)} /></span></div>;
        if (/:$/.test(ln.trim())) return <div key={i} className="hprompt__label">{ln}</div>;
        return <div key={i} className="hprompt__p"><Inline text={ln} /></div>;
      })}
    </div>
  );
}

const STYLE_OPTS = [
  { v: "concise", label: "Concise" },
  { v: "balanced", label: "Balanced" },
  { v: "detailed", label: "Detailed" }
];
const clean = (s) => (s || "").trim().replace(/\s+/g, " ");

/* ============================ context strip ============================ */
function ContextStrip({ project, onAdd, onClear, onToggleSummary, summaryOpen }) {
  if (!project) {
    return (
      <button className="bar__addproj" onClick={onAdd}>
        <span className="bar__addicon"><IconPlus size={14} /></span>
        <span className="bar__addmain">Add a project</span>
        <span className="bar__addsub">index a folder so ENA writes file-aware prompts</span>
      </button>
    );
  }
  const langs = project.langs.map((l) => l.name).slice(0, 2).join(", ");
  return (
    <div className="bar__ctx">
      <span className="bar__ctxfolder"><IconFolder size={15} /></span>
      <span className="bar__ctxname">{project.name}</span>
      <span className="bar__ctxdot" />
      <span className="bar__ctxmeta">{project.files.toLocaleString()} files · {langs}</span>
      <span className="bar__ctxsp" />
      <button className={"bar__ctxbtn" + (summaryOpen ? " is-on" : "")} onClick={onToggleSummary}>Summary <Chevron size={12} /></button>
      <button className="bar__ctxx" onClick={onClear} title="Clear project"><IconClose size={13} /></button>
    </div>
  );
}

/* ============================ indexing — 3 distinct looks ============================ */
function IndexBlock({ variant, project, pct }) {
  if (variant === "glass") return <IndexRing project={project} pct={pct} />;
  if (variant === "soft") return <IndexTiles project={project} pct={pct} />;
  return <IndexLinear project={project} pct={pct} />;
}

/* A · native — minimal linear track */
function IndexLinear({ project, pct }) {
  const act = HONE.indexActivity(pct);
  const done = Math.round((pct / 100) * project.files);
  return (
    <div className="bar__index">
      <div className="bar__indextop">
        <span className="bar__ctxfolder"><IconFolder size={15} /></span>
        <span className="bar__ctxname">{project.name}</span>
        <span className="bar__indexpath">{project.path}</span>
        <span className="bar__indexpct">{Math.floor(pct)}<small>%</small></span>
      </div>
      <div className="bar__track"><div className="bar__fill" style={{ width: pct + "%" }} /></div>
      <div className="bar__indexfoot">
        <span className="bar__indexact"><span className="bar__pulse" />{pct >= 100 ? "Index ready" : act}</span>
        <span className="bar__indexcount">{done.toLocaleString()} / {project.files.toLocaleString()} files</span>
      </div>
    </div>
  );
}

/* B · glass — glowing radial ring HUD */
function IndexRing({ project, pct }) {
  const act = HONE.indexActivity(pct);
  const done = Math.round((pct / 100) * project.files);
  return (
    <div className="bar__indexring">
      <div className="bar__ring" style={{ ["--p"]: pct }}>
        <span className="bar__ringpct">{Math.floor(pct)}<small>%</small></span>
      </div>
      <div className="bar__ringside">
        <div className="bar__ringhead"><span className="bar__ctxfolder"><IconFolder size={15} /></span><span className="bar__ctxname">{project.name}</span></div>
        <div className="bar__ringsub">Building semantic index · on-device</div>
        <div className="bar__ringact"><span className="bar__pulse" />{pct >= 100 ? "Index ready" : act}</div>
        <div className="bar__ringcount">{done.toLocaleString()} / {project.files.toLocaleString()} files embedded</div>
      </div>
    </div>
  );
}

/* C · soft — friendly tiles that fill in */
function IndexTiles({ project, pct }) {
  const N = 40, lit = Math.round((pct / 100) * N);
  const act = HONE.indexActivity(pct);
  const done = Math.round((pct / 100) * project.files);
  return (
    <div className="bar__index">
      <div className="bar__indextop">
        <span className="bar__ctxfolder"><IconFolder size={15} /></span>
        <span className="bar__ctxname">{project.name}</span>
        <span className="bar__indexpath">{project.path}</span>
        <span className="bar__indexpct bar__indexpct--soft">{Math.floor(pct)}<small>%</small></span>
      </div>
      <div className="bar__tiles">
        {Array.from({ length: N }).map((_, i) => <span key={i} className={"bar__tile" + (i < lit ? " is-on" : "")} style={{ transitionDelay: (i % 8) * 12 + "ms" }} />)}
      </div>
      <div className="bar__indexfoot">
        <span className="bar__indexact"><span className="bar__pulse" />{pct >= 100 ? "Index ready" : act}</span>
        <span className="bar__indexcount">{done.toLocaleString()} / {project.files.toLocaleString()} files</span>
      </div>
    </div>
  );
}

/* ============================ variations — 3 distinct layouts ============================ */
function Variations({ variant, sample, picked, onPick }) {
  const plain = (v) => sample(v).replace(/\n+/g, " · ").replace(/`/g, "");

  if (variant === "glass") {
    return (
      <div className="bar__varcols">
        {STYLE_OPTS.map((o) => (
          <button key={o.v} className={"bar__varcol" + (picked === o.v ? " is-on" : "")} onClick={() => onPick(o.v)}>
            <div className="bar__varhd"><span>{o.label}</span>{picked === o.v && <span className="bar__vartick"><IconCheck size={13} /></span>}</div>
            <div className="bar__varcolbody">{plain(o.v)}</div>
          </button>
        ))}
      </div>
    );
  }

  if (variant === "soft") {
    return (
      <div className="bar__varacc">
        {STYLE_OPTS.map((o) => {
          const open = picked === o.v;
          return (
            <div key={o.v} className={"bar__accrow" + (open ? " is-open" : "")} onClick={() => onPick(o.v)}>
              <div className="bar__acchd">
                <span className="bar__accname">{o.label}</span>
                <span className="bar__accmeta">{open ? <span className="bar__accsel"><IconCheck size={12} /> selected</span> : "tap to preview"}</span>
              </div>
              {open ? <div className="bar__accfull"><RenderPrompt text={sample(o.v)} /></div>
                    : <div className="bar__accprev">{plain(o.v)}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  /* native — stacked selectable cards */
  return (
    <div className="bar__vars">
      {STYLE_OPTS.map((o) => (
        <button key={o.v} className={"bar__var" + (picked === o.v ? " is-on" : "")} onClick={() => onPick(o.v)}>
          <div className="bar__varhd"><span>{o.label}</span>{picked === o.v && <span className="bar__vartick"><IconCheck size={13} /></span>}</div>
          <div className="bar__varbody">{plain(o.v)}</div>
        </button>
      ))}
    </div>
  );
}

/* ============================ folder picker ============================ */
function Picker({ onPick, onClose }) {
  return (
    <div className="bar__panel">
      <div className="bar__tabs">
        <div className="bar__paneltitle"><IconFolder size={15} /> Choose a project</div>
        <button className="bar__iconbtn" onClick={onClose}><IconClose /></button>
      </div>
      <div className="bar__picksub">ENA indexes the folder locally, then grounds every prompt in it.</div>
      <div className="bar__picklist">
        {HONE.RECENT_FOLDERS.map((f, i) => (
          <button key={i} className="bar__pickrow" onClick={() => onPick(f)}>
            <span className="bar__pickicon"><IconFolder size={17} /></span>
            <span className="bar__pickbody">
              <span className="bar__pickname">{f.name}</span>
              <span className="bar__pickpath">{f.path}</span>
            </span>
            <span className="bar__pickmeta">{f.meta}</span>
          </button>
        ))}
      </div>
      <button className="bar__browse" onClick={() => onPick(HONE.RECENT_FOLDERS[0])}>
        <span><IconPlus size={14} /> Browse for a folder…</span>
        <span className="bar__browsekey"><kbd>⌘</kbd><kbd>O</kbd></span>
      </button>
    </div>
  );
}

/* ============================ project summary ============================ */
function Summary({ project, onClose }) {
  return (
    <div className="bar__panel">
      <div className="bar__tabs">
        <div className="bar__paneltitle"><IconCheck size={15} /> Indexed · ready</div>
        <button className="bar__iconbtn" onClick={onClose}>Done</button>
      </div>
      <div className="bar__sumlede">{project.summary}</div>
      <div className="bar__sumstats">
        <div className="bar__stat"><b>{project.files.toLocaleString()}</b><span>files</span></div>
        <div className="bar__stat"><b>{project.loc}</b><span>lines</span></div>
        <div className="bar__stat"><b>just now</b><span>indexed</span></div>
        <div className="bar__stat"><b>{project.stack.length}</b><span>frameworks</span></div>
      </div>

      <div className="bar__sumblock">
        <div className="bar__sumlbl">Languages</div>
        <div className="bar__langbar">
          {project.langs.map((l) => <span key={l.name} style={{ width: l.pct + "%", background: l.color }} title={l.name + " " + l.pct + "%"} />)}
        </div>
        <div className="bar__langleg">
          {project.langs.map((l) => <span key={l.name} className="bar__legitem"><i style={{ background: l.color }} />{l.name} <em>{l.pct}%</em></span>)}
        </div>
      </div>

      <div className="bar__sumcols">
        <div className="bar__sumblock">
          <div className="bar__sumlbl">Structure</div>
          <div className="bar__struct">
            {project.structure.map((s) => (
              <div key={s[0]} className="bar__structrow"><span className="tok tok--file"><IconFile size={11} />{s[0]}</span><em>{s[1]}</em></div>
            ))}
          </div>
        </div>
        <div className="bar__sumblock">
          <div className="bar__sumlbl">Conventions ENA will follow</div>
          <div className="bar__chips">
            {project.conventions.map((c) => <span key={c} className="bar__chip"><IconCheck size={11} />{c}</span>)}
          </div>
          <div className="bar__sumlbl" style={{ marginTop: 12 }}>Stack</div>
          <div className="bar__chips">
            {project.stack.map((s) => <span key={s} className="bar__chip bar__chip--plain">{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ the bar ============================ */
function FloatingBar({ variant = "native", initialView = "resting", initialStyle = "balanced", loopIndex = false }) {
  const PROJECT = HONE.PROJECT;
  const projViews = ["result", "variations", "diff", "summary", "typing"];
  const startProject = (projViews.includes(initialView) || initialView === "indexing") ? PROJECT : null;
  const seeded = ["result", "variations", "diff"].includes(initialView);
  const startDraft = seeded ? HONE.PROJ_DRAFT : (initialView === "typing" ? HONE.PROJ_DRAFT : "");

  const [view, setView] = useState(initialView);
  const [project, setProject] = useState(startProject);
  const [draft, setDraft] = useState(startDraft);
  const [style, setStyle] = useState(initialStyle);
  const [result, setResult] = useState(seeded ? HONE.PROJ_SAMPLE[initialStyle] : "");
  const [tab, setTab] = useState(initialView === "variations" ? "variations" : initialView === "diff" ? "diff" : "enhanced");
  const [pickedVar, setPickedVar] = useState(initialStyle);
  const [summaryOpen, setSummaryOpen] = useState(initialView === "summary");
  const [pct, setPct] = useState(initialView === "indexing" ? 0 : 100);
  const [toast, setToast] = useState(null);
  const tRef = useRef(null), iRef = useRef(null), inputRef = useRef(null);

  useEffect(() => () => { clearTimeout(tRef.current); clearInterval(iRef.current); }, []);

  function flash(msg) { setToast(msg); clearTimeout(tRef.current); tRef.current = setTimeout(() => setToast(null), 1400); }

  /* ---- indexing animation ---- */
  function startIndex(folder) {
    setProject(PROJECT);
    setView("indexing");
    setPct(0);
    clearInterval(iRef.current);
    iRef.current = setInterval(() => {
      setPct((p) => {
        const np = p + (p < 70 ? 2.4 : 1.3);
        if (np >= 100) {
          clearInterval(iRef.current);
          if (loopIndex) { setTimeout(() => startIndex(), 900); return 100; }
          setTimeout(() => { setSummaryOpen(true); setView("summary"); }, 450);
          return 100;
        }
        return np;
      });
    }, 55);
  }
  useEffect(() => { if (initialView === "indexing") startIndex(); }, []);

  /* ---- enhance ---- */
  function sampleFor(s) {
    return (project && clean(draft).toLowerCase() === HONE.PROJ_DRAFT) ? HONE.PROJ_SAMPLE[s] : HONE.enhance(draft, s);
  }
  function runEnhance() {
    if (!clean(draft)) { inputRef.current && inputRef.current.focus(); return; }
    setView("enhancing");
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => { setResult(sampleFor(style)); setTab("enhanced"); setView("result"); }, 1150);
  }
  function onInput(e) { const v = e.target.value; setDraft(v); if (view === "resting" || view === "typing") setView(v.trim() ? "typing" : "resting"); }
  function onKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runEnhance(); } if (e.key === "Escape") reset(); }
  function reset() { setView("resting"); setDraft(""); setResult(""); }
  function clearProject() { setProject(null); setSummaryOpen(false); if (["summary", "indexing"].includes(view)) setView("resting"); }
  function pickStyle(s) { setStyle(s); if (result) setResult(sampleFor(s)); }

  const isWorking = ["resting", "typing", "enhancing", "result", "variations", "diff"].includes(view);
  const showCtx = isWorking && view !== "enhancing";
  const placeholder = project ? "Describe a change to " + project.name + "\u2026" : "Describe what you want, roughly\u2026";

  return (
    <div className={"bar bar--" + variant + (view !== "resting" && view !== "typing" ? " is-expanded" : "")}>
      {/* input row */}
      <div className="bar__row">
        <span className="bar__mark"><Spark size={22} /></span>
        <input ref={inputRef} className="bar__input" value={draft} placeholder={placeholder} onChange={onInput} onKeyDown={onKey} spellCheck={false} />
        <div className="bar__right">
          <button className="bar__pill" onClick={() => pickStyle(style === "concise" ? "balanced" : style === "balanced" ? "detailed" : "concise")}>
            <span>{STYLE_OPTS.find((o) => o.v === style).label}</span><Chevron />
          </button>
          <button className={"bar__go" + (clean(draft) ? " is-ready" : "")} onClick={runEnhance} title="Enhance  (↩)">
            {view === "enhancing" ? <span className="bar__spin" /> : <Spark size={18} />}
          </button>
        </div>
      </div>

      {/* context strip (Add project / chip) */}
      {showCtx && (
        <div className="bar__ctxwrap">
          <ContextStrip project={project} onAdd={() => setView("picker")} onClear={clearProject}
            summaryOpen={summaryOpen} onToggleSummary={() => { setSummaryOpen(!summaryOpen); setView(summaryOpen ? "resting" : "summary"); }} />
        </div>
      )}

      {/* footer hint */}
      {(view === "resting" || view === "typing") && (
        <div className="bar__foot">
          <div className="bar__hint">
            {view === "typing" ? <span><kbd>↩</kbd> to enhance{project ? " with " + project.name : ""}</span>
              : <span>{project ? "Grounded in " + project.name + " — press ↩ to enhance" : "Type a rough prompt — ENA sharpens it. ⌥Space anywhere."}</span>}
          </div>
          <div className="bar__footlinks">
            <button className="bar__link" onClick={() => setView("history")}><IconClock /> Recent</button>
            <button className="bar__link" onClick={() => setView("settings")}><IconGear /> Settings</button>
          </div>
        </div>
      )}

      {/* indexing */}
      {view === "indexing" && project && <div className="bar__panel"><IndexBlock variant={variant} project={project} pct={pct} /></div>}

      {/* picker */}
      {view === "picker" && <Picker onPick={(f) => startIndex(f)} onClose={() => setView("resting")} />}

      {/* summary */}
      {view === "summary" && project && <Summary project={project} onClose={() => { setSummaryOpen(false); setView("resting"); }} />}

      {/* enhancing */}
      {view === "enhancing" && (
        <div className="bar__panel">
          <div className="bar__loadhead"><Spark size={15} className="spin-spark" /> {project ? "Reading " + project.name + " · sharpening…" : "Sharpening your prompt…"}</div>
          <div className="shim shim--a" /><div className="shim shim--b" /><div className="shim shim--c" />
        </div>
      )}

      {/* results */}
      {["result", "variations", "diff"].includes(view) && (
        <div className="bar__panel">
          <div className="bar__tabs">
            <div className="bar__tabset">
              {[["enhanced", "Enhanced"], ["variations", "3 variations"], ["diff", "Before · After"]].map(([k, lbl]) => (
                <button key={k} className={"bar__tab" + (tab === k ? " is-on" : "")} onClick={() => setTab(k)}>{lbl}</button>
              ))}
            </div>
            <button className="bar__iconbtn" onClick={reset} title="New (Esc)"><IconClose /></button>
          </div>

          {tab === "enhanced" && <div className="bar__result"><div className="bar__card"><RenderPrompt text={result} /></div></div>}

          {tab === "variations" && (
            <Variations variant={variant} sample={sampleFor} picked={pickedVar} onPick={(v) => { setPickedVar(v); setStyle(v); }} />
          )}

          {tab === "diff" && (
            <div className="bar__result">
              <div className="bar__difflead">Your draft · <span>{HONE.PROJ_DRAFT}</span></div>
              <div className="bar__card bar__card--diff">
                {HONE.PROJ_DIFF.map((tk, i) => {
                  const inner = tk.file ? <span className="tok tok--file"><IconFile size={11} />{tk.t}</span> : tk.code ? <code className="tok tok--code">{tk.t.replace(/`/g, "")}</code> : tk.t;
                  return tk.add ? <mark key={i} className="diffadd">{inner}</mark> : <span key={i}>{inner}</span>;
                })}
              </div>
              <div className="bar__difflegend"><span className="diffadd diffadd--chip">Added</span> by ENA from {project ? project.name : "context"} · {HONE.PROJ_DIFF.filter(t => t.file).length} file refs</div>
            </div>
          )}

          <div className="bar__actions">
            <div className="bar__actstyle"><Segmented small value={style} onChange={pickStyle} options={STYLE_OPTS} /></div>
            <div className="bar__actbtns">
              <button className="bar__act" onClick={runEnhance}><IconRegen /> Regenerate</button>
              <button className="bar__act" onClick={() => flash("Copied to clipboard")}><IconCopy /> Copy</button>
              <button className="bar__act bar__act--primary" onClick={() => flash("Inserted into the front app")}><IconInsert /> Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* history */}
      {view === "history" && (
        <div className="bar__panel">
          <div className="bar__tabs">
            <div className="bar__paneltitle"><IconClock /> Recent</div>
            <div className="bar__tabsright">
              <button className="bar__link bar__link--mut" onClick={() => flash("History cleared")}>Clear</button>
              <button className="bar__iconbtn" onClick={() => setView("resting")}><IconClose /></button>
            </div>
          </div>
          <div className="bar__list">
            {HONE.HISTORY.map((h, i) => (
              <button key={i} className="bar__hrow" onClick={() => { setDraft(h.text); setStyle(h.style.toLowerCase()); setResult(sampleFor(h.style.toLowerCase())); setTab("enhanced"); setView("result"); }}>
                <span className="bar__htext">{h.text}</span>
                <span className="bar__hproj"><IconFolder size={12} /> {h.proj}</span>
                <span className="bar__hmeta">{h.when}</span>
                <span className="bar__hgo"><IconRegen size={14} /></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* settings */}
      {view === "settings" && (
        <div className="bar__panel">
          <div className="bar__tabs">
            <div className="bar__paneltitle"><IconGear /> Settings</div>
            <button className="bar__iconbtn" onClick={() => setView("resting")}><IconClose /></button>
          </div>
          <div className="bar__set">
            <div className="bar__setrow"><div className="bar__setlbl">Default style<small>Used when you press ↩</small></div><Segmented value={style} onChange={setStyle} options={STYLE_OPTS} small /></div>
            <div className="bar__setrow"><div className="bar__setlbl">Enhance hotkey<small>Summon ENA from any app</small></div><div className="bar__keys"><kbd>⌥</kbd><kbd>Space</kbd></div></div>
            <div className="bar__setrow"><div className="bar__setlbl">Re-index on file changes<small>Keep the project index live</small></div><SettingToggle def={true} /></div>
            <div className="bar__setrow"><div className="bar__setlbl">Always show before / after<small>Open the diff with each result</small></div><SettingToggle def={false} /></div>
            <div className="bar__setrow"><div className="bar__setlbl">Indexing<small>Local · nothing leaves your Mac</small></div><Segmented value={"local"} onChange={() => {}} options={[{ v: "local", label: "On-device" }, { v: "cloud", label: "Cloud" }]} small /></div>
          </div>
        </div>
      )}

      {toast && <div className="bar__toast"><IconCheck size={14} /> {toast}</div>}
    </div>
  );
}

Object.assign(window, { FloatingBar, Spark, IndexBlock, IconFolder, IconCheck, IconPlus, IconClose, IconFile });
