/* Hone / ENA — prompt enhancement engine + project context data.
   Exposed on window.HONE. Deterministic, no network. */
(function () {
  "use strict";

  function clean(s) { return (s || "").trim().replace(/\s+/g, " "); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function taskPhrase(d) { return cap(d.replace(/[.!?]+$/, "")); }

  /* generic enhancer (no project attached) */
  function enhance(draft, style) {
    var d = clean(draft);
    if (!d) return "";
    var t = taskPhrase(d);
    if (style === "concise") {
      return t + ". Be specific and direct. State the key constraints, the desired format, and the audience in one tight paragraph. If anything is ambiguous, note your assumptions first.";
    }
    if (style === "detailed") {
      return [
        "Act as an expert practitioner in this domain.", t + ".", "",
        "Context to use:",
        "- Who the output is for and what they already know",
        "- The single outcome that defines success",
        "- Constraints on length, format, or tone", "",
        "Requirements:",
        "- Lead with the most important point; no preamble",
        "- Use clear structure (short sections or bullets)",
        "- Include 2\u20133 concrete, specific examples",
        "- Flag any assumptions before you begin", "",
        "Tone: clear, confident, free of filler."
      ].join("\n");
    }
    return [
      "Act as an expert in this area. " + t + ".", "",
      "Requirements:",
      "- Be specific and concrete \u2014 no vague advice",
      "- Structure the response with clear sections",
      "- Match the format to the audience and goal", "",
      "If anything is unclear, state your assumptions first."
    ].join("\n");
  }

  /* ---------------- Project context (the indexed sample repo) ---------------- */
  var PROJECT = {
    name: "acme-dashboard",
    path: "~/dev/acme-dashboard",
    files: 1284,
    loc: "84k",
    summary: "A TypeScript + React analytics dashboard \u2014 Vite build, Tailwind UI, Zustand state, and a thin Express API. Tested with Vitest.",
    langs: [
      { name: "TypeScript", pct: 64, color: "#3178c6" },
      { name: "CSS", pct: 16, color: "#7d5bbe" },
      { name: "JSON", pct: 11, color: "#c2b53a" },
      { name: "Other", pct: 9, color: "#9aa0a6" }
    ],
    stack: ["React 18", "Vite", "Tailwind", "Zustand", "Vitest", "Express"],
    structure: [
      ["src/components", "48 components"],
      ["src/stores", "Zustand state"],
      ["src/api", "Express routes"],
      ["src/routes", "page views"],
      ["tests", "Vitest specs"]
    ],
    conventions: [
      "Zustand + persist middleware",
      "Tailwind design tokens",
      "Functional components & hooks",
      "Vitest for unit tests"
    ]
  };

  /* folders shown in the picker */
  var RECENT_FOLDERS = [
    { name: "acme-dashboard", path: "~/dev/acme-dashboard", meta: "1,284 files \u00b7 indexed 2d ago", known: true },
    { name: "mobile-app", path: "~/dev/mobile-app", meta: "3,902 files \u00b7 React Native" },
    { name: "marketing-site", path: "~/sites/marketing-site", meta: "212 files \u00b7 Astro" },
    { name: "ena-core", path: "~/dev/ena-core", meta: "Not yet indexed" }
  ];

  /* activity lines streamed during indexing (by progress threshold) */
  var INDEX_STEPS = [
    [0, "Reading project structure\u2026"],
    [12, "Parsing package.json & tsconfig\u2026"],
    [26, "Embedding src/components/\u2026"],
    [44, "Mapping the import graph\u2026"],
    [60, "Indexing Zustand stores\u2026"],
    [74, "Scanning git history\u2026"],
    [86, "Detecting conventions\u2026"],
    [95, "Finalizing semantic index\u2026"]
  ];
  function indexActivity(pct) {
    var msg = INDEX_STEPS[0][1];
    for (var i = 0; i < INDEX_STEPS.length; i++) if (pct >= INDEX_STEPS[i][0]) msg = INDEX_STEPS[i][1];
    return msg;
  }

  /* ---------------- File-aware samples (project attached) ---------------- */
  var PROJ_DRAFT = "add a dark mode toggle";

  var PROJ_SAMPLE = {
    concise:
      "Add a persistent dark-mode toggle. Put a `theme` slice in `src/stores/ui.ts`, wire the control into `src/components/TopBar.tsx`, default to `prefers-color-scheme`, persist via `src/stores/persist.ts`, and enable Tailwind `dark:` in `tailwind.config.ts`. Match the existing store + token conventions.",
    balanced: [
      "Add a persistent dark-mode toggle to the dashboard.", "",
      "Steps:",
      "- Add a `theme` slice to the Zustand store in `src/stores/ui.ts`",
      "- Detect the system preference via `prefers-color-scheme` on first load",
      "- Add the toggle to `src/components/TopBar.tsx`",
      "- Persist the choice through the existing middleware in `src/stores/persist.ts`",
      "- Enable Tailwind `dark:` variants in `tailwind.config.ts`", "",
      "Context: follow the store + persist pattern already used for user settings, and reuse the color tokens in `src/styles/theme.css`. Keep the control accessible (`aria-pressed`)."
    ].join("\n"),
    detailed: [
      "Add a persistent, accessible dark-mode toggle to the dashboard, matching existing conventions.", "",
      "Files to touch:",
      "- `src/stores/ui.ts` \u2014 add a `theme: 'light' | 'dark' | 'system'` slice",
      "- `src/components/TopBar.tsx` \u2014 add the toggle control",
      "- `src/stores/persist.ts` \u2014 persist `theme` (mirror the `settings` slice)",
      "- `tailwind.config.ts` \u2014 set `darkMode: 'class'`",
      "- `src/styles/theme.css` \u2014 map the dark tokens", "",
      "Requirements:",
      "- Default to `prefers-color-scheme`; let the user override",
      "- Toggle the `dark` class on `<html>`, not per component",
      "- Add a Vitest spec alongside `tests/stores/ui.test.ts`", "",
      "Context: reuse the Zustand + persist pattern and the existing Tailwind tokens. Keep it accessible and keyboard-focusable."
    ].join("\n")
  };

  /* before/after tokens for the diff (file refs flagged) */
  var PROJ_DIFF = [
    { t: "Add a " },
    { t: "persistent, accessible ", add: true },
    { t: "dark-mode toggle " },
    { t: "to the dashboard. ", add: true },
    { t: "Add a ", add: true }, { t: "`theme`", add: true, code: true }, { t: " slice to ", add: true }, { t: "src/stores/ui.ts", add: true, file: true },
    { t: ", wire the control into ", add: true }, { t: "src/components/TopBar.tsx", add: true, file: true },
    { t: ", default to ", add: true }, { t: "`prefers-color-scheme`", add: true, code: true }, { t: ", and persist via ", add: true }, { t: "src/stores/persist.ts", add: true, file: true },
    { t: ". Follow the existing Zustand + Tailwind token conventions.", add: true }
  ];

  var HISTORY = [
    { text: "add a dark mode toggle", when: "2m ago", style: "Balanced", proj: "acme-dashboard" },
    { text: "fix the failing checkout e2e test", when: "1h ago", style: "Detailed", proj: "acme-dashboard" },
    { text: "explain the auth flow to a new hire", when: "Yesterday", style: "Concise", proj: "acme-dashboard" },
    { text: "add pagination to the users table", when: "Yesterday", style: "Balanced", proj: "mobile-app" },
    { text: "write release notes from the last 10 commits", when: "Mon", style: "Concise", proj: "acme-dashboard" }
  ];

  window.HONE = {
    enhance: enhance,
    PROJECT: PROJECT,
    RECENT_FOLDERS: RECENT_FOLDERS,
    indexActivity: indexActivity,
    PROJ_DRAFT: PROJ_DRAFT,
    PROJ_SAMPLE: PROJ_SAMPLE,
    PROJ_DIFF: PROJ_DIFF,
    HISTORY: HISTORY
  };
})();
