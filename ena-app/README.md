<div align="center">

<img src="dist/ena-orb.png" width="104" alt="ENA" />

# ENA

**A floating prompt enhancer for macOS.**

Type a rough idea, ENA sharpens it into a precise, codebase aware prompt, without leaving the app you are in.

![Platform](https://img.shields.io/badge/macOS-12%2B-1c1c1f?style=flat-square&logo=apple)
![Tauri](https://img.shields.io/badge/Tauri-1.5-ffc131?style=flat-square&logo=tauri&logoColor=black)
![Agents](https://img.shields.io/badge/Claude%20%C2%B7%20Codex-CLI-d97757?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-5b54e8?style=flat-square)

</div>

---

## What it does

ENA rests as a small orb on your screen. Press a global hotkey (default `Option+Space`) from any app and a clean command bar floats on top. Write what you want in plain words, press Return, and ENA returns three sharpened prompts (Concise, Balanced, Detailed), grounded in your actual project. Copy the one you want into your coding agent.

The grounding is the point: when you point ENA at a folder, your selected agent (Claude or Codex) actually reads the repository and writes its own summary, so prompts reference real files, real patterns, and real conventions instead of guesses.

Other things it does:

- **Two agents:** rides your existing `claude` or `codex` CLI login. No API key required.
- **Vision:** attach images or drag them from Finder; both agents see them.
- **Custom instructions:** tell ENA how you like prompts written, applied to every enhance.
- **Themes:** light, dark, or auto, plus an accent picker.
- **Rebindable hotkey:** summon ENA with any global shortcut.
- **Stats and levels:** streaks, ranks, an activity heatmap, and a shareable card.
- **On device:** index summaries and settings never leave your Mac.

---

## Requirements

- **macOS 12 or later**
- **Rust** (stable) and the **Tauri CLI**: `cargo install tauri-cli --version "^1.5"`
- **Node 18+** (only to run the JSX compile step; there is no bundler)
- At least one agent CLI installed and signed in:
  - [Claude Code](https://claude.com/claude-code) provides `claude`
  - [Codex CLI](https://github.com/openai/codex) provides `codex`

---

## Build and run

From this directory (`ena-app/`):

```bash
# 1. compile the JSX in dist/ to plain JS (dist/build/*.js)
node build-jsx.js

# 2a. run in development
cargo tauri dev

# 2b. or build a release bundle (.app and .dmg in src-tauri/target/release/bundle/)
cargo tauri build
```

Re-run `node build-jsx.js` after editing any `.jsx` file. The frontend is vendored React with hand written JSX; there is no webpack/vite step, so the compiled `dist/build/*.js` is what the app loads.

> Signing and notarization are handled outside this repo. `cargo tauri build` produces an unsigned bundle you can then sign and notarize for distribution.

---

## Usage

| Action | How |
| --- | --- |
| Summon or dismiss | `Option+Space` (rebindable in Settings) |
| Enhance | type, then Return |
| Close to orb | the close button in the bar, or Escape |
| Switch agent | the model menu in the bar |
| Attach an image | the attach button, or drag a file from Finder |
| Stats | Settings, then Your stats |

---

## Project layout

```
ena-app/
├── build-jsx.js          # compiles dist/*.jsx -> dist/build/*.js (IIFE wrapped)
├── scripts/              # one-off asset generators (e.g. rank awards)
├── src-tauri/
│   ├── src/
│   │   ├── main.rs       # window, tray, global shortcut, Tauri commands
│   │   └── engine.rs     # indexing, agent dispatch (Claude/Codex CLI), enhancement
│   └── tauri.conf.json   # frameless, transparent, always on top, accessory app
└── dist/                 # frontend, served as is
    ├── index.html
    ├── bar.jsx           # the floating bar and all views (stats, settings, ...)
    ├── app.jsx           # root: onboarding, bar, orb
    ├── onboarding.jsx    # first run flow
    ├── enhance.js        # window.HONE, the bridge to the Rust backend
    ├── resize.js         # auto fits the transparent window to the content
    ├── styles.css        # design tokens, themes, accents
    └── awards/ avatars/ brands/ sounds/ fonts/ build/
```

---

## Privacy

ENA is local first.

- Project indexes are written to `~/Library/Application Support/com.ena.promptenhancer/index/`, one small text summary per project.
- Settings (hotkey, theme, avatar, stats) live in `localStorage` plus a local config file.
- The only thing that leaves your machine is the prompt you choose to send, handled by your own `claude` or `codex` CLI under your own login.

Clear cached indexes any time from Settings, then Index cache, then Clear.

---

## License

[MIT](../LICENSE)
