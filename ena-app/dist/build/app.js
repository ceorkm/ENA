(function(){
/* ENA - app root.
   First run shows onboarding. After that ENA can rest as a small orb parked on
   screen (collapsed); clicking it blooms the full bar open. The "Rest as an orb"
   setting toggles this: when off, ENA behaves like a classic panel that hides.
   The bar/onboarding are the exact design-handoff components, unchanged. */

const {
  useState: useStateApp,
  useEffect: useEffectApp,
  useRef: useRefApp
} = React;
function readOrbMode() {
  try {
    return localStorage.getItem("ena.orbMode") !== "0";
  } catch (e) {
    return true;
  }
}
function appWin() {
  var t = window.__TAURI__;
  return t && t.window && t.window.appWindow;
}
function CollapsedOrb({
  onExpand,
  busy
}) {
  // Drag to move the window; a plain click (no movement) opens the bar.
  function onDown(e) {
    if (e.button !== 0) return;
    const aw = appWin();
    const sx = e.clientX,
      sy = e.clientY;
    let dragged = false;
    function move(ev) {
      if (dragged) return;
      if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 4) {
        dragged = true;
        if (aw && aw.startDragging) aw.startDragging().catch(() => {});
        cleanup();
      }
    }
    function up() {
      cleanup();
      if (!dragged) onExpand();
    }
    function cleanup() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }
  return /*#__PURE__*/React.createElement("button", {
    className: "ena-collapsed" + (busy ? " is-busy" : ""),
    onMouseDown: onDown,
    title: busy ? "Working… click to open" : "Drag to move · click to open"
  }, /*#__PURE__*/React.createElement("img", {
    src: "ena-orb.png",
    alt: "ENA",
    draggable: false
  }), busy && /*#__PURE__*/React.createElement("span", {
    className: "ena-collapsed__ring"
  }));
}
function AppRoot() {
  const [onboarded, setOnboarded] = useStateApp(() => {
    try {
      return localStorage.getItem("ena.onboarded") === "1";
    } catch (e) {
      return false;
    }
  });
  const [orbMode, setOrbMode] = useStateApp(readOrbMode);
  const [collapsed, setCollapsed] = useStateApp(readOrbMode); // rest as orb when orb-mode on
  const [busy, setBusy] = useStateApp(false); // indexing / enhancing in progress
  useEffectApp(() => {
    function onBusy(e) {
      setBusy(!!(e && e.detail));
    }
    window.addEventListener("ena-busy", onBusy);
    return () => window.removeEventListener("ena-busy", onBusy);
  }, []);
  // Re-assert float-over-everything once the webview is up (the bundled .app
  // realizes the window after Rust setup(), dropping the flags set there). A
  // couple of nudges covers any post-launch reset.
  useEffectApp(() => {
    if (!HONE.refloat) return;
    HONE.refloat();
    const a = setTimeout(() => HONE.refloat(), 400);
    const b = setTimeout(() => HONE.refloat(), 1500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);
  const orbModeRef = useRefApp(orbMode);
  orbModeRef.current = orbMode;
  function finishOnboarding() {
    try {
      localStorage.setItem("ena.onboarded", "1");
    } catch (e) {}
    setOnboarded(true);
  }

  // ⌥Space (global hotkey) → Rust emits "ena-toggle". It hides/shows the whole
  // window (orb and all) — it never expands the bar. Opening is the orb's job.
  // Whatever was on screen (orb or open bar) comes back exactly as it was.
  useEffectApp(() => {
    const t = window.__TAURI__;
    if (!t || !t.event || !t.event.listen) return;
    let un;
    t.event.listen("ena-toggle", () => {
      const aw = appWin();
      if (!aw || !aw.isVisible) return;
      aw.isVisible().then(v => {
        if (v) {
          aw.hide();
        } else {
          aw.show();
          aw.setFocus && aw.setFocus();
          HONE.refloat && HONE.refloat();
        }
      }).catch(() => {});
    }).then(f => {
      un = f;
    }).catch(() => {});
    return () => {
      if (un) un();
    };
  }, []);

  // Settings toggle for "Rest as an orb" dispatches this; reflect it live.
  useEffectApp(() => {
    function onMode(e) {
      const on = !!(e && e.detail);
      setOrbMode(on);
      setCollapsed(on); // on → show the orb; off → show the bar
    }
    window.addEventListener("ena-orbmode", onMode);
    return () => window.removeEventListener("ena-orbmode", onMode);
  }, []);

  // "Close" from the bar: collapse to orb, or (orb off) hide the window.
  function handleCollapse() {
    if (orbModeRef.current) setCollapsed(true);else {
      const aw = appWin();
      if (aw) aw.hide();
    }
  }
  const FloatingBar = window.FloatingBar;
  const Onboarding = window.Onboarding;

  // Keep the bar mounted even when collapsed (just hidden) so the draft, result,
  // and attached images survive close → reopen.
  let body;
  if (!onboarded) {
    body = /*#__PURE__*/React.createElement(Onboarding, {
      variant: "native",
      onDone: finishOnboarding
    });
  } else {
    const hidden = orbMode && collapsed;
    body = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "ena-barwrap",
      style: {
        display: hidden ? "none" : "block"
      }
    }, /*#__PURE__*/React.createElement(FloatingBar, {
      variant: "native",
      initialView: "resting",
      onCollapse: handleCollapse
    })), hidden && /*#__PURE__*/React.createElement(CollapsedOrb, {
      onExpand: () => setCollapsed(false),
      busy: busy
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "ena-app"
  }, body);
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(AppRoot, null));
})();
