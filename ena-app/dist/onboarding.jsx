/* ENA - first-run onboarding. Interactive click-through that introduces
   the app, sets the hotkey, connects a project (with the variant's own
   index animation), and lands on a ready screen. */

const { useState: useStateO, useEffect: useEffectO, useRef: useRefO } = React;
const { IndexBlock, IconFolder, IconCheck, IconPlus, Spark } = window;

function Onboarding({ variant = "native", onDone }) {
  // steps: 0 welcome · 1 hotkey · 2 project · 3 indexing · 4 ready
  const [step, setStep] = useStateO(0);
  const [pct, setPct] = useStateO(0);
  const [project, setProject] = useStateO(HONE.PROJECT);
  const [err, setErr] = useStateO("");
  const iref = useRefO(null);
  const idxRef = useRefO(0);

  useEffectO(() => () => clearInterval(iref.current), []);

  // Play the intro sound once when ENA is first met (with a gesture fallback
  // in case the webview blocks autoplay).
  useEffectO(() => {
    const a = new Audio("sounds/intro.mp3");
    a.volume = 0.45;                     // gentle warm intro
    let fadeT = 0, stopT = 0;
    function scheduleFade() {
      stopT = setTimeout(() => {
        fadeT = setInterval(() => {
          a.volume = Math.max(0, a.volume - 0.03);
          if (a.volume <= 0.02) { clearInterval(fadeT); try { a.pause(); } catch (e) {} }
        }, 60);
      }, 4800);                          // play most of it, then fade out
    }
    a.play().then(scheduleFade).catch(() => {
      const fire = () => { a.play().then(scheduleFade).catch(() => {}); window.removeEventListener("pointerdown", fire); window.removeEventListener("keydown", fire); };
      window.addEventListener("pointerdown", fire);
      window.addEventListener("keydown", fire);
    });
    return () => { clearTimeout(stopT); clearInterval(fadeT); try { a.pause(); } catch (e) {} };
  }, []);

  // Real pick + index: animate progress to ~90 while the on-device walk runs,
  // then complete when the backend returns, hand the project to the app, and
  // advance to "ready".
  function connect(path) {
    if (!path) return;                         // picker cancelled - stay put
    const name = path.split("/").filter(Boolean).pop() || "project";
    const my = ++idxRef.current;               // cancel token for this index run
    setErr("");
    setProject({ name: name, path: path, files: 0 });
    setStep(3); setPct(0);
    clearInterval(iref.current);
    iref.current = setInterval(() => {
      setPct((p) => (p < 92 ? p + (p < 60 ? 0.8 : 0.3) : p));
    }, 150);
    HONE.analyzeProject(path, null).then((proj) => {
      if (idxRef.current !== my) return;       // cancelled - drop the result
      clearInterval(iref.current);
      HONE.PROJECT = proj;
      setProject(proj);
      HONE.addRecent(proj, path);
      setPct(100);
      setTimeout(() => setStep(4), 600);
    }).catch((e) => {
      if (idxRef.current !== my) return;
      clearInterval(iref.current);
      setErr(typeof e === "string" ? e : "Indexing failed");
      setStep(2);                              // failed - back to the picker, with the reason
    });
  }
  function cancelIndex() { idxRef.current++; clearInterval(iref.current); setStep(2); }

  function browse() {
    HONE.pickFolder().then((path) => { if (path) connect(path); }).catch(() => {});
  }

  const dots = [0, 1, 2, 3]; // welcome, hotkey, project, ready
  const activeDot = step <= 2 ? step : step === 3 ? 2 : 3;
  const canBack = step > 0 && step !== 3;
  function back() { setStep(step === 4 ? 2 : Math.max(0, step - 1)); }

  return (
    <div className={"bar bar--" + variant + " onb"}>
      <div className="onb__top">
        <button className="onb__back" style={{ visibility: canBack ? "visible" : "hidden" }} onClick={back} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="onb__dots">{dots.map((d) => <span key={d} className={"onb__dot" + (d === activeDot ? " is-on" : "") + (d < activeDot ? " is-done" : "")} />)}</div>
        <button className="onb__skip" style={{ visibility: step < 3 ? "visible" : "hidden" }} onClick={() => setStep(4)}>Skip</button>
      </div>

      {/* ---- 0 · welcome ---- */}
      {step === 0 && (
        <div className="onb__body onb__body--welcome">
          <div className="onb__halo onb__halo--orb"><img className="onb__orb" src="ena-orb.png" alt="ENA" draggable={false} /></div>
          <h2 className="onb__title">Meet ENA</h2>
          <p className="onb__sub">Type what you want and ENA sharpens it into a precise, project-aware prompt, without leaving the app you're in.</p>
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
              <button key={i} className="onb__folder" onClick={() => connect(f.real || f.path)}>
                <span className="onb__foldericon"><IconFolder size={18} /></span>
                <span className="onb__folderbody"><span className="onb__foldername">{f.name}</span><span className="onb__folderpath">{f.path}</span></span>
                <span className="onb__foldermeta">{f.meta}</span>
              </button>
            ))}
          </div>
          <button className="onb__browse" onClick={browse}><IconPlus size={14} /> Browse for a folder…</button>
          {err && <p className="onb__err">{err}</p>}
          <button className="onb__ghost" onClick={() => setStep(4)}>I'll do this later</button>
        </div>
      )}

      {/* ---- 3 · indexing (variant-specific animation) ---- */}
      {step === 3 && project && (
        <div className="onb__body onb__body--left">
          <h2 className="onb__title onb__title--sm">Indexing {project.name}</h2>
          <p className="onb__sub onb__sub--sm">This stays on your Mac. ENA reads structure, dependencies, and conventions.</p>
          <div className="onb__index"><IndexBlock variant={variant} project={project} pct={pct} /></div>
          <button className="onb__ghost" onClick={cancelIndex}>Cancel</button>
        </div>
      )}

      {/* ---- 4 · ready (celebratory finale) ---- */}
      {step === 4 && (
        <div className="onb__body onb__body--done">
          <div className="onb__confetti">
            {Array.from({ length: 28 }).map((_, i) => {
              const colors = ["#5b54e8", "#7c6bff", "#a78bfa", "#c4b5fd", "#8b5cf6", "#ffffff"];
              const style = {
                left: (6 + Math.random() * 88) + "%",
                background: colors[i % colors.length],
                animationDelay: (Math.random() * 0.25) + "s",
                animationDuration: (1.1 + Math.random() * 0.7) + "s",
                ["--rot"]: (Math.random() * 540 - 270) + "deg"
              };
              return <span key={i} className="onb__confetto" style={style} />;
            })}
          </div>
          <div className="onb__halo onb__halo--orb"><img className="onb__orb" src="ena-orb.png" alt="ENA" draggable={false} /></div>
          <h2 className="onb__title">ENA is ready</h2>
          <p className="onb__sub">Press <kbd>⌥</kbd><kbd>Space</kbd> from any app, type what you want, and ENA sharpens it into a precise prompt. Hit <kbd>↩</kbd> to enhance.</p>
          <button className="onb__cta" onClick={() => { if (onDone) { onDone(); } else { setStep(0); setPct(0); } }}>Start using ENA</button>
        </div>
      )}
    </div>
  );
}

window.Onboarding = Onboarding;
