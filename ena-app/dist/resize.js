/* Make the transparent Tauri window hug ENA's content, so only the bar is
   interactive and clicks outside fall through to the app behind it.
   Watches the rendered .bar / .onb element and resizes + recenters the window
   to fit (plus padding for the drop shadow). Plain script, no build step. */
(function () {
  "use strict";
  var PAD = 46;            // room for the bar's soft shadow
  var t = window.__TAURI__;
  if (!t || !t.window) return;       // running outside Tauri (plain browser) - no-op
  var appWindow = t.window.appWindow;
  var LogicalSize = t.window.LogicalSize;
  var LogicalPosition = t.window.LogicalPosition;
  var PhysicalPosition = t.window.PhysicalPosition;

  var lastW = 0, lastH = 0, raf = 0;

  function current() {
    // pick the VISIBLE target - the bar is kept mounted but display:none while
    // collapsed, so skip any element with no layout box.
    var els = document.querySelectorAll(".ena-app .bar, .ena-app .onb, .ena-app .ena-collapsed");
    for (var i = 0; i < els.length; i++) {
      if (els[i].getClientRects().length) return els[i];
    }
    return els.length ? els[0] : null;
  }

  function clamp(v, lo, hi) { return hi < lo ? lo : Math.max(lo, Math.min(hi, v)); }

  function fit() {
    raf = 0;
    var el = current();
    if (!el) return;
    var r = el.getBoundingClientRect();
    // The collapsed orb has no shadow - hug it tightly so there's no invisible
    // dead-zone around it capturing clicks. The bar keeps room for its shadow.
    var isOrb = el.classList && el.classList.contains("ena-collapsed");
    var pad = isOrb ? 9 : PAD;   // room for the busy ring
    var w = Math.ceil(r.width) + pad * 2;
    var h = Math.ceil(r.height) + pad * 2;
    if (w === lastW && h === lastH) return;
    var firstTime = (lastH === 0);
    var oldH = lastH;
    lastW = w; lastH = h;

    // Screen work area + this window's size, in PHYSICAL px (outerPosition and
    // PhysicalPosition are physical). Used to keep the whole window on-screen so
    // the bar never opens off the top/side when the orb sits near an edge.
    var sf = window.devicePixelRatio || 1;
    var sc = window.screen;
    var areaL = (sc.availLeft || 0) * sf;
    var areaT = (sc.availTop || 0) * sf;
    var areaR = areaL + sc.availWidth * sf;
    var areaB = areaT + sc.availHeight * sf;
    var pw = w * sf, ph = h * sf;

    if (firstTime) {
      // first paint: park near the bottom-left of the screen (above the dock)
      var x0 = clamp(areaL + 16 * sf, areaL, areaR - pw);
      var y0 = clamp(areaB - ph - 16 * sf, areaT, areaB - ph);
      appWindow.setSize(new LogicalSize(w, h)).then(function () {
        return appWindow.setPosition(new PhysicalPosition(Math.round(x0), Math.round(y0)));
      }).catch(function () {});
      return;
    }
    // afterward: keep the bottom-left corner where the user left it so the bar
    // grows from the orb, but CLAMP the whole window inside the screen so it can
    // never open clipped off the top or the right edge.
    appWindow.outerPosition().then(function (pos) {
      return appWindow.setSize(new LogicalSize(w, h)).then(function () {
        var nx = clamp(pos.x, areaL, areaR - pw);
        var ny = clamp(Math.round(pos.y + (oldH - h) * sf), areaT, areaB - ph);
        return appWindow.setPosition(new PhysicalPosition(Math.round(nx), ny));
      });
    }).catch(function () {
      appWindow.setSize(new LogicalSize(w, h)).catch(function () {});
    });
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(fit);
  }

  var ro = new ResizeObserver(schedule);
  var observed = null;

  function rebind() {
    var el = current();
    if (el && el !== observed) {
      if (observed) ro.unobserve(observed);
      ro.observe(el);
      observed = el;
      schedule();
    }
  }

  // Re-bind when React swaps onboarding <-> bar, and on any subtree change.
  var mo = new MutationObserver(function () { rebind(); schedule(); });
  var root = document.getElementById("root");
  if (root) mo.observe(root, { childList: true, subtree: true });

  // Poll until the first render lands, then hand off to the observers.
  (function waitForRender() {
    if (current()) { rebind(); fit(); }
    else requestAnimationFrame(waitForRender);
  })();

  window.addEventListener("resize", schedule);

  // Drag the window from anywhere on the bar - except when the click lands on an
  // actual control (input, textarea, button, link, the model menu, etc.).
  var NO_DRAG = "input, textarea, button, select, a, kbd, [role='button'], [contenteditable='true'], .bar__provmenu";
  document.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;            // left button only
    var el = e.target;
    if (el && el.closest && el.closest(NO_DRAG)) return; // a real control - let it work
    if (appWindow && appWindow.startDragging) appWindow.startDragging().catch(function () {});
  }, false);
})();
