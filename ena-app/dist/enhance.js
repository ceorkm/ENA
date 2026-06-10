/* ENA - data / engine bridge.
   Talks to the Rust backend (Tauri) for real folder indexing and prompt
   enhancement. Recents and history persist in localStorage. No demo data. */
(function () {
  "use strict";

  function invoke(cmd, args) {
    var t = window.__TAURI__;
    var fn = (t && t.tauri && t.tauri.invoke) || (t && t.invoke) || (t && t.core && t.core.invoke);
    if (!fn) return Promise.reject(new Error("Tauri invoke unavailable (running outside the app)"));
    return fn(cmd, args);
  }

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  var RECENT = load("ena.recents");   // [{name, path, meta}]
  var HIST = load("ena.history");     // [{text, when, style, proj}]

  /* ---- indexing status text (generic) ---- */
  var STEPS = [
    [0, "Scanning your codebase…"],
    [20, "Mapping the architecture…"],
    [45, "Tracing the key files…"],
    [68, "Learning your conventions…"],
    [88, "Finishing up…"]
  ];
  function indexActivity(pct) {
    var m = STEPS[0][1];
    for (var i = 0; i < STEPS.length; i++) if (pct >= STEPS[i][0]) m = STEPS[i][1];
    return m;
  }

  /* ---- real folder pick + index ---- */
  function pickFolder() {
    var t = window.__TAURI__;
    var open = t && t.dialog && t.dialog.open;
    if (!open) return Promise.reject(new Error("dialog unavailable"));
    return open({ directory: true, multiple: false, title: "Choose a project to index" });
  }

  function indexFolder(path) {
    return invoke("index_folder", { path: path });
  }

  // The REAL index: the agent reads the repo and writes the summary.
  function analyzeProject(path, provider) {
    return invoke("analyze_project", { path: path, provider: provider || null });
  }

  // Fast: load a persisted digest (or null) - used to show a project instantly on reopen.
  function loadCachedIndex(path) {
    return invoke("load_cached_index", { path: path }).catch(function () { return null; });
  }

  // Cheap staleness token (git HEAD/dirty or "nogit").
  function indexFreshness(path) {
    return invoke("index_freshness", { path: path }).catch(function () { return "nogit"; });
  }

  function addRecent(project, realPath) {
    if (!project || !project.path) return;
    var langs = (project.langs || []).slice(0, 2).map(function (l) { return l.name; }).join(", ");
    var entry = {
      name: project.name,
      path: project.path,            // display path (~ collapsed)
      real: realPath || project.path, // absolute path for re-indexing
      meta: (project.files ? project.files.toLocaleString() + " files" : "indexed") + (langs ? " · " + langs : "")
    };
    RECENT = RECENT.filter(function (f) { return f.real !== entry.real; });
    RECENT.unshift(entry);
    if (RECENT.length > 6) RECENT = RECENT.slice(0, 6);
    window.HONE.RECENT_FOLDERS = RECENT;
    save("ena.recents", RECENT);
  }
  function removeRecent(real) {
    RECENT = RECENT.filter(function (f) { return f.real !== real && f.path !== real; });
    window.HONE.RECENT_FOLDERS = RECENT;
    save("ena.recents", RECENT);
  }

  /* ---- enhancement (3 variations in one call) ---- */
  function enhanceAll(draft, context, provider, images, projectPath, instructions) {
    return invoke("enhance_prompt", { draft: draft, projectContext: context || null, provider: provider || null, images: images || [], projectPath: projectPath || null, instructions: instructions || null });
  }

  /* ---- images: attach + drag-drop ---- */
  var IMG_EXT = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "heic", "heif", "svg", "tiff"];
  function isImage(path) {
    var m = /\.([a-z0-9]+)$/i.exec(path || "");
    return !!m && IMG_EXT.indexOf(m[1].toLowerCase()) >= 0;
  }
  function pickImages() {
    var t = window.__TAURI__;
    var open = t && t.dialog && t.dialog.open;
    if (!open) return Promise.reject(new Error("dialog unavailable"));
    return open({ multiple: true, directory: false, title: "Attach images",
      filters: [{ name: "Images", extensions: IMG_EXT }] });
  }
  function assetUrl(path) {
    var t = window.__TAURI__;
    var conv = (t && t.tauri && t.tauri.convertFileSrc) || (t && t.convertFileSrc);
    try { return conv ? conv(path) : path; } catch (e) { return path; }
  }
  function baseName(path) { return (path || "").split("/").filter(Boolean).pop() || path; }
  // Register native (Finder) file-drop handlers. Returns an unsubscribe fn.
  function onFileDrop(h) {
    var t = window.__TAURI__;
    if (!t || !t.event || !t.event.listen) return function () {};
    var uns = [];
    t.event.listen("tauri://file-drop", function (e) { h.drop && h.drop(e.payload || []); }).then(function (u) { uns.push(u); });
    t.event.listen("tauri://file-drop-hover", function (e) { h.hover && h.hover(e.payload || []); }).then(function (u) { uns.push(u); });
    t.event.listen("tauri://file-drop-cancelled", function () { h.cancel && h.cancel(); }).then(function (u) { uns.push(u); });
    return function () { uns.forEach(function (u) { try { u(); } catch (e) {} }); };
  }


  /* ---- settings: API key (stored in app config, not env) ---- */
  function getSettings() {
    return invoke("get_settings").catch(function () { return { apiKey: "" }; });
  }
  function setApiKey(key) {
    return invoke("set_api_key", { key: key || "" }).catch(function () {});
  }

  /* ---- UI sound cues (respect the mute setting) ---- */
  function soundsOn() { try { return localStorage.getItem("ena.sounds") !== "0"; } catch (e) { return true; } }
  // Synthesized cues (Web Audio) - unique to ENA, no binary assets. Soft by design.
  var _actx = null;
  function audioCtx() {
    try {
      if (!_actx) { var AC = window.AudioContext || window.webkitAudioContext; _actx = AC ? new AC() : null; }
      if (_actx && _actx.state === "suspended") _actx.resume();
    } catch (e) { _actx = null; }
    return _actx;
  }
  // one soft voice: sine/triangle with a gentle attack + exponential decay
  function voice(ctx, dest, t0, freq, dur, peak, type) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest);
    o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function playCue(name, vol) {
    if (!soundsOn()) return;
    var ctx = audioCtx(); if (!ctx) return;
    var v = (vol == null ? 0.5 : vol);
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5400; lp.Q.value = 0.5;
    var master = ctx.createGain(); master.gain.value = v;
    lp.connect(master); master.connect(ctx.destination);
    var t = ctx.currentTime + 0.01;
    if (name === "ready") {
      // ENA's signature "bloom": a soft pentatonic rise (D5-A5-D6) with an octave
      // shimmer, capped by a gentle high sparkle. Says "polished & done", not "ding".
      var notes = [587.33, 880.0, 1174.66];
      notes.forEach(function (f, i) {
        var t0 = t + i * 0.072;
        voice(ctx, lp, t0, f, 0.34, 0.16, "sine");
        voice(ctx, lp, t0, f * 2, 0.24, 0.045, "triangle");
      });
      voice(ctx, lp, t + 0.216, 1567.98, 0.55, 0.07, "sine");   // G6 tail sparkle
    } else if (name === "insert") {
      voice(ctx, lp, t, 880.0, 0.07, 0.17, "sine");
      voice(ctx, lp, t + 0.05, 1318.5, 0.10, 0.12, "sine");     // quick up-tick
    } else if (name === "error") {
      voice(ctx, lp, t, 311.13, 0.18, 0.15, "sine");            // Eb4 → Bb3 (down)
      voice(ctx, lp, t + 0.09, 233.08, 0.26, 0.13, "sine");
    } else {
      voice(ctx, lp, t, 660.0, 0.15, 0.13, "sine");
    }
  }
  function setHotkey(accel) { return invoke("set_hotkey", { accel: accel }); }
  function clearIndexCache() { return invoke("clear_index_cache"); }
  function getProfile() { return invoke("get_profile").catch(function () { return { name: "you", device: "" }; }); }
  function saveImage(name, data) { return invoke("save_image", { name: name, data: data }); }
  function refloat() { return invoke("refloat").catch(function () {}); }

  /* ---- theme + accent (applied to <html>, persisted) ---- */
  function getTheme() { try { return localStorage.getItem("ena.theme") || "auto"; } catch (e) { return "auto"; } }
  function getAccent() { try { return localStorage.getItem("ena.accent") || "purple"; } catch (e) { return "purple"; } }
  function applyTheme() {
    try {
      document.documentElement.setAttribute("data-theme", getTheme());
      document.documentElement.setAttribute("data-accent", getAccent());
    } catch (e) {}
  }
  function setTheme(t) { try { localStorage.setItem("ena.theme", t); } catch (e) {} try { document.documentElement.setAttribute("data-theme", t); } catch (e) {} }
  function setAccent(a) { try { localStorage.setItem("ena.accent", a); } catch (e) {} try { document.documentElement.setAttribute("data-accent", a); } catch (e) {} }
  applyTheme();   // run immediately so there's no flash

  function addHistory(text, style, proj) {
    var entry = { text: text, when: "just now", style: cap(style || "balanced"), proj: proj || "" };
    HIST = HIST.filter(function (h) { return h.text !== entry.text; });
    HIST.unshift(entry);
    if (HIST.length > 12) HIST = HIST.slice(0, 12);
    window.HONE.HISTORY = HIST;
    save("ena.history", HIST);
  }
  function clearHistory() { HIST = []; window.HONE.HISTORY = HIST; save("ena.history", HIST); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ---- client-side before/after diff (draft -> enhanced) ---- */
  function makeDiff(draft, enhanced) {
    if (!enhanced) return [];
    var dwords = (draft || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    var dset = {};
    dwords.forEach(function (w) { dset[w] = 1; });
    var parts = enhanced.split(/(\s+)/); // keep whitespace tokens
    var toks = [];
    parts.forEach(function (w) {
      if (w === "" ) return;
      if (/^\s+$/.test(w)) { toks.push({ t: w }); return; }
      var isCode = /`/.test(w);
      var bare = w.replace(/`/g, "");
      var isFile = !/\s/.test(bare) && /[a-zA-Z]/.test(bare) && (/\.[a-z]{1,6}([:)\].,]|$)/.test(bare) || /\//.test(bare));
      var key = bare.toLowerCase().replace(/[^a-z0-9]/g, "");
      var add = key.length > 0 && !dset[key];
      toks.push({ t: bare, add: add, file: isFile, code: isCode && !isFile });
    });
    return toks;
  }

  /* legacy generic enhancer (used only if backend unreachable) */
  function enhance(draft) {
    var t = (draft || "").trim();
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1) +
      ". Be specific and concrete. State the files involved, the constraints, and the desired outcome. If anything is ambiguous, note your assumptions first.";
  }

  window.HONE = {
    // legacy shape (kept so components never crash)
    enhance: enhance,
    PROJECT: null,
    PROJ_DRAFT: "",
    PROJ_SAMPLE: { concise: "", balanced: "", detailed: "" },
    PROJ_DIFF: [],
    // live data
    RECENT_FOLDERS: RECENT,
    HISTORY: HIST,
    indexActivity: indexActivity,
    // real engine bridge
    pickFolder: pickFolder,
    indexFolder: indexFolder,
    analyzeProject: analyzeProject,
    loadCachedIndex: loadCachedIndex,
    indexFreshness: indexFreshness,
    addRecent: addRecent,
    removeRecent: removeRecent,
    enhanceAll: enhanceAll,
    getSettings: getSettings,
    setApiKey: setApiKey,
    playCue: playCue,
    soundsOn: soundsOn,
    setHotkey: setHotkey,
    clearIndexCache: clearIndexCache,
    getProfile: getProfile,
    saveImage: saveImage,
    refloat: refloat,
    getTheme: getTheme,
    getAccent: getAccent,
    setTheme: setTheme,
    setAccent: setAccent,
    pickImages: pickImages,
    assetUrl: assetUrl,
    isImage: isImage,
    baseName: baseName,
    onFileDrop: onFileDrop,
    addHistory: addHistory,
    clearHistory: clearHistory,
    makeDiff: makeDiff
  };
})();
