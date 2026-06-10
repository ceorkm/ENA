<div align="center">

<img src="ena-app/dist/ena-orb.png" width="116" alt="ENA" />

# ENA

### A floating prompt enhancer that lives on your Mac.

Type a rough idea. ENA sharpens it into a precise, **codebase-aware** prompt - without leaving the app you're in.

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-5b54e8.svg?style=flat-square)](#license)
![Platform](https://img.shields.io/badge/macOS-12%2B-1c1c1f?style=flat-square&logo=apple)
![Built with Tauri](https://img.shields.io/badge/Tauri-1.5-ffc131?style=flat-square&logo=tauri&logoColor=black)
![Agents](https://img.shields.io/badge/Claude%20%C2%B7%20Codex-CLI-d97757?style=flat-square)
![On-device](https://img.shields.io/badge/index-on--device-17b26a?style=flat-square)

</div>

---

## Demo

[▶ Watch the 30-second demo](https://pub-d50b64b3cf024fb99056d2fda492c991.r2.dev/ena-demo.mp4) — type a rough idea, ENA enhances it, then flip between Concise · Balanced · Detailed.

---

## What is ENA?

ENA rests as a small **orb** on your screen. Tap it (or hit `⌥Space` from any app) and a clean command bar floats on top. Write what you want in plain words, press `↩`, and ENA returns **three sharpened prompts** - Concise, Balanced, and Detailed - grounded in your actual project. Pick one, and ENA pastes it straight into the app you were already in.

It's the layer between *"fix the login thing"* and a prompt your coding agent can actually execute.

> The defensible part isn't the rewrite - it's the **grounding**. ENA's selected agent genuinely *reads your repository* and writes its own understanding, so your prompts reference real files, real patterns, real conventions.

---

## Features

| | |
|---|---|
| **Orb-first** | Lives as a draggable orb; click or `⌥Space` to summon. Closes back to the orb - never quits. |
| **Real codebase index** | The agent (Claude or Codex) actually reads your repo and writes the summary - not a mechanical scan. |
| **3 variations** | Every enhance returns Concise · Balanced · Detailed. Edit in place, diff against your draft. |
| **Claude **or** Codex** | Rides your existing `claude` / `codex` CLI login. No API key required. |
| **Vision** | Attach images or drag from Finder - both Claude and Codex *see* them. |
| **Custom instructions** | Tell ENA how you like prompts written; applied to every enhance. |
| **Themes** | Light / Dark / Auto + an accent picker. |
| **Rebindable hotkey** | Summon ENA with any global shortcut you choose. |
| **Stats & levels** | Streaks, ranks, a gold award ladder, an activity heatmap, and a shareable card. |
| **On-device** | Index summaries and settings never leave your Mac. |

---

## Earn your rank

Every prompt you sharpen levels you up - twelve gold ranks from **Scribbler** to **Prompt Legend**, with streaks, an activity heatmap, and a share card you can post.

<div align="center">
<img src="ena-app/dist/awards/awards-contact-192.png" width="560" alt="ENA rank awards" />
</div>

---

## Getting started

### Prerequisites
- **macOS 12+**
- **Rust** (stable) + **Node 18+**
- At least one agent CLI installed and signed in:
  - [Claude Code](https://claude.com/claude-code) - `claude`
  - [Codex CLI](https://github.com/openai/codex) - `codex`

### Run it

```bash
git clone https://github.com/ceorkm/ena.git
cd ena/ena-app

# compile the JSX → plain JS (no bundler)
node build-jsx.js

# launch the app (Tauri dev)
cargo tauri dev
```

> ENA frontend is vendored React + hand-written JSX precompiled by `build-jsx.js` - **re-run it after editing any `.jsx`**. Everything runs fully offline.

### First run
ENA walks you through it: set your hotkey, point it at a project (the agent indexes it), grant **Accessibility** (so ENA can paste for you), and you're off.

---

## Usage

| Action | How |
|---|---|
| Summon / dismiss | `⌥Space` (rebindable in Settings) |
| Enhance | type → `↩` |
| Close to orb | the `×` in the bar, or `Esc` |
| Switch agent | the model menu in the bar |
| Attach an image | the paperclip, or drag a file from Finder |
| Insert result | **Insert** → pastes into your previous app |
| Stats | **Settings → Your stats** |

---

## Privacy

ENA is local-first by design:

- Project indexes are written to `~/Library/Application Support/com.ena.promptenhancer/index/` as small text summaries - **one file per project, on your Mac only**.
- Settings (hotkey, theme, avatar, stats) live in `localStorage` + a local config file.
- The **only** thing that leaves your machine is the prompt you choose to send - handled by *your* `claude` / `codex` CLI under *your* login, exactly as if you'd typed it yourself.

Need a clean slate? **Settings → Index cache → Clear**.

---

## How it works

```
  rough prompt ──▶ ENA bar
                     │
                     ├─▶ project context  ◀── agent reads your repo, writes a summary
                     │                        (cached per-project, on-device)
                     ├─▶ custom instructions
                     ├─▶ attached images (vision)
                     │
                     ▼
            claude / codex CLI  ──▶  { concise, balanced, detailed }
                     │
                     ▼
        review · diff · edit ──▶ Insert into your app
```

---

## Architecture

```
ena-app/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs      # window, tray, global shortcut, Tauri commands
│   │   └── engine.rs    # indexing, agent dispatch (Claude/Codex CLI), enhancement
│   └── tauri.conf.json  # frameless · transparent · always-on-top · accessory
└── dist/                # frontend (served as-is, no bundler)
    ├── bar.jsx          # the floating bar + all views (stats, settings, …)
    ├── app.jsx          # root: onboarding ↔ bar ↔ orb
    ├── onboarding.jsx   # first-run flow
    ├── enhance.js       # window.HONE - bridge to the Rust backend
    ├── styles.css       # design tokens, themes, accents
    ├── awards/ avatars/ brands/   # gold ranks · fun-emoji avatars · agent logos
    └── build/*.js       # compiled output of build-jsx.js
```

**Stack:** [Tauri 1.5](https://tauri.app) (Rust) · React 18 (UMD, no bundler) · the `claude` & `codex` CLIs · [DiceBear](https://dicebear.com) avatars · [Simple Icons](https://simpleicons.org).

---

## Contributing

PRs welcome. Keep ENA's spirit: **clean, intentional, no clutter.** Edit `.jsx`, run `node build-jsx.js`, then `cargo tauri dev`.

---

## License

[MIT](LICENSE) © 2026 ceorkm

