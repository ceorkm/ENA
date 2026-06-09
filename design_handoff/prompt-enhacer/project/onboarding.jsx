/* ENA — first-run onboarding. Interactive click-through that introduces
   the app, sets the hotkey, connects a project (with the variant's own
   index animation), and lands on a ready screen. */

const { useState: useStateO, useEffect: useEffectO, useRef: useRefO } = React;
const { IndexBlock, IconFolder, IconCheck, IconPlus, Spark } = window;

function Onboarding({ variant = "native" }) {
  const PROJECT = HONE.PROJECT;
  // steps: 0 welcome · 1 hotkey · 2 project · 3 indexing · 4 ready
  const [step, setStep] = useStateO(0);
  const [pct, setPct] = useStateO(0);
  const iref = useRefO(null);

  useEffectO(() => () => clearInterval(iref.current), []);

  function startIndex() {
    setStep(3); setPct(0);
    clearInterval(iref.current);
    iref.current = setInterval(() => {
      setPct((p) => {
        const np = p + (p < 70 ? 3 : 1.6);
        if (np >= 100) { clearInterval(iref.current); setTimeout(() => setStep(4), 500); return 100; }
        return np;
      });
    }, 55);
  }

  const dots = [0, 1, 2, 3]; // welcome, hotkey, project, ready
  const activeDot = step <= 2 ? step : step === 3 ? 2 : 3;
  const canBack = step > 0 && step !== 3;

  return (
    <div className={"bar bar--" + variant + " onb"}>
      <div className="onb__top">
        <button className="onb__back" style={{ visibility: canBack ? "visible" : "hidden" }} onClick={() => setStep(Math.max(0, step - 1))} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="onb__dots">{dots.map((d) => <span key={d} className={"onb__dot" + (d === activeDot ? " is-on" : "") + (d < activeDot ? " is-done" : "")} />)}</div>
        <button className="onb__skip" style={{ visibility: step < 3 ? "visible" : "hidden" }} onClick={() => setStep(4)}>Skip</button>
      </div>

      {/* ---- 0 · welcome ---- */}
      {step === 0 && (
        <div className="onb__body">
          <div className="onb__halo"><Spark size={34} /></div>
          <h2 className="onb__title">Meet ENA</h2>
          <p className="onb__sub">ENA turns rough thoughts into precise, project-aware prompts — without leaving the app you're working in.</p>
          <button className="onb__cta" onClick={() => setStep(1)}>Get started</button>
        </div>
      )}

      {/* ---- 1 · hotkey ---- */}
      {step === 1 && (
        <div className="onb__body">
          <div className="onb__keys"><kbd className="onb__key">⌥</kbd><span className="onb__plus">+</span><kbd className="onb__key onb__key--wide">Space</kbd></div>
          <h2 className="onb__title">Summon ENA anywhere</h2>
          <p className="onb__sub">Press it from your editor, browser, or Slack and ENA floats on top. Start typing right away.</p>
          <button className="onb__cta" onClick={() => setStep(2)}>Continue</button>
        </div>
      )}

      {/* ---- 2 · connect project ---- */}
      {step === 2 && (
        <div className="onb__body onb__body--left">
          <h2 className="onb__title">Ground ENA in your code</h2>
          <p className="onb__sub">Point ENA at a folder. It builds a local index of your files, so every prompt references your real paths and patterns.</p>
          <div className="onb__folders">
            {HONE.RECENT_FOLDERS.slice(0, 2).map((f, i) => (
              <button key={i} className="onb__folder" onClick={startIndex}>
                <span className="onb__foldericon"><IconFolder size={18} /></span>
                <span className="onb__folderbody"><span className="onb__foldername">{f.name}</span><span className="onb__folderpath">{f.path}</span></span>
                <span className="onb__foldermeta">{f.meta}</span>
              </button>
            ))}
          </div>
          <button className="onb__browse" onClick={startIndex}><IconPlus size={14} /> Browse for a folder…</button>
          <button className="onb__ghost" onClick={() => setStep(4)}>I'll do this later</button>
        </div>
      )}

      {/* ---- 3 · indexing (variant-specific animation) ---- */}
      {step === 3 && (
        <div className="onb__body onb__body--left">
          <h2 className="onb__title onb__title--sm">Indexing {PROJECT.name}</h2>
          <p className="onb__sub onb__sub--sm">This stays on your Mac. ENA reads structure, dependencies, and conventions.</p>
          <div className="onb__index"><IndexBlock variant={variant} project={PROJECT} pct={pct} /></div>
        </div>
      )}

      {/* ---- 4 · ready ---- */}
      {step === 4 && (
        <div className="onb__body">
          <div className="onb__halo onb__halo--ok"><IconCheck size={32} /></div>
          <h2 className="onb__title">You're all set</h2>
          <p className="onb__sub">Type a rough idea like <b>"add a dark mode toggle"</b> and press <kbd>↩</kbd>. ENA writes the full spec, grounded in your project.</p>
          <button className="onb__cta" onClick={() => { setStep(0); setPct(0); }}>Start using ENA</button>
        </div>
      )}
    </div>
  );
}

window.Onboarding = Onboarding;
