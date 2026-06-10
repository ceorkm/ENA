# The Landing Page Design System

A complete, product-agnostic method for designing landing pages that look expensive,
load fast, and never read as AI-generated. Given this file and a product to sell, an
agent should be able to deliver a full site that passes a demanding owner's review.

The core stance: **restraint is the aesthetic.** When in doubt, do less.

---

## 1. Before you design: extract the product truth

Do this first, in writing, or every section you build will be wrong:

1. **What is it, in one plain sentence?** Not the vision — the thing.
2. **What works with zero setup?** Lead with that. Features that require setup,
   accounts, or existing assets are *optional superpowers*, presented second.
3. **What's the one claim competitors can't copy?** That's your differentiator —
   it goes high on the page, but it does not get to redefine the product's identity.
4. **What does the user already have/pay for that this rides on?** Removing a cost or
   a signup objection is stronger than adding an adjective.
5. **What's true about privacy/data/ownership?** Say it plainly; for technical
   audiences it's a buying reason, not legal fluff.

The hierarchy you extract here dictates the order of headlines, feature cards, and FAQ
answers. Never let a flashy secondary capability hijack the identity of the product.

---

## 2. Design philosophy

- **Matte, not shiny.** Pick a near-black (e.g. `#0a0a0a`) or a warm paper
  (e.g. `#f5f5f3`) as the page. No gradients, no glow, no color washes.
- **The page background IS the fill.** The cardinal rule. Cards, bubbles, icon
  circles, keycaps, secondary buttons: `background: transparent` + a hairline border.
  Hover/active states brighten the **border**, never add a background. Allow at most
  two sanctioned "glass" fills per site (typically the fixed nav and the primary CTA),
  and even those should read as the page color at low alpha.
- **Hairlines do all the structural work.** 1px borders at ~10% alpha separate and
  group everything. Surface contrast is not how this system creates hierarchy.
- **Real content is the only art.** Card illustrations must be real artifacts of the
  product: an actual file tree, real keyboard shortcuts as keycaps, genuine
  input→output examples, official partner logos, a real screen recording. Never
  abstract blobs, stock metaphors, fake dashboards, or decorative icons.
- **At most one accent color, and prefer borrowing it** from an official partner/brand
  mark rather than inventing one. Default-AI accent colors (purple/violet especially)
  are forbidden — they instantly read as generated.
- **Two voices of type:** a serif for display headlines (the brand's voice), the system
  sans for everything else (the interface's voice).

---

## 3. Tokens

Define both themes up front, even if you ship dark-only first. All values are
alpha-on-ink so they work over any matte base.

| Token | Dark | Light |
|---|---|---|
| Page | `#0a0a0a` | `#f5f5f3` |
| Ink (headings) | `#fff` | `#1a1a1a` |
| Body | `ink/70` | `ink/70` |
| Secondary | `ink/55` | `ink/60` |
| Dim | `ink/45` | `ink/50` |
| Faint (eyebrows, meta, ©) | `ink/30` | `ink/35` |
| Hairline | `ink/10` | `ink/10` |
| Hairline hover/active | `ink/20–25` | `ink/20–25` |
| Sub-hairline | `ink/6` | `ink/6` |

- Theme = one state value (`"dark" | "light"`), persisted to localStorage, passed as a
  prop; components branch on a `dark` boolean. Root gets `transition-colors duration-500`
  so toggling crossfades.
- **Type**: system sans stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text",
  "Helvetica Neue", sans-serif`); serif = ui-serif/Georgia stack, weight 400 only.
  Zero webfonts — system fonts are a feature (speed) and a look (native).
- Scale: hero H1 `clamp ~36→64px+` (`text-4xl sm:text-5xl md:text-7xl`); section H2
  `~30→40px`; body 15px; card copy 13.5px; meta 12–12.5px; mono detail 12px.
- **Radius**: cards `rounded-2xl` mobile → `rounded-3xl` desktop; pills/buttons/nav
  `rounded-full`; inner insets one step smaller than their container.
- Section gaps `mt-24→36` by depth on the page; content columns `max-w-5xl` for wide
  sections, `max-w-2xl` for reading columns.

### The section heading pattern (mandatory, sitewide)

```
EYEBROW              ← 11px, uppercase, tracking-widest, semibold, faint
Serif headline.      ← serif 400, tracking tight, ends with a period
One plain sentence.  ← optional, dim
```

Headlines are calm statements ("What it does." / "What's new." / "Ask us.") — never
marketing phrases ("Built for how you already work" is the kind of line that gets cut).

---

## 4. Copy voice

- Plain English. Short flat sentences. Say the true thing, then stop.
- **Forbidden**: hype verbs ("unleash", "supercharge", "transform"), "seamlessly",
  "incredibly", stacked negation lists ("no setup, no account, no credit card —"
  pick the strongest one), em-dash chains, ellipsis-truncated examples (`…` reads as
  interruption — every example shown in UI must be a complete sentence), fake
  testimonials, invented metrics, and a Pricing section for a free product.
- Feature copy formula: **Bold lead phrase — one sentence that explains it.** The lead
  is 2–5 words; the explanation is concrete and complete.
- FAQ questions are written in the visitor's words ("Do I need an account?"); answers
  open with the direct answer ("No.") followed by at most two supporting sentences.
- Example inputs shown in UI should be casually lowercase and rough ("fix the login
  thing"); example outputs should be specific, complete, and name real things.
- One italicized serif word per hero headline, maximum. It's a signature, not a habit.

---

## 5. The glass recipes (the only fills allowed)

Fixed navbar pill, floating over content (`fixed top-0 z-50`, `max-w-5xl`, fully
rounded), per theme:

```js
// dark
{ backgroundColor: "rgba(0,0,0,0.18)", backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.35)",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.12)" }
// light
{ backgroundColor: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.06)" }
```

Primary CTA (dark): fill with the *page color* at low alpha (`bg-black/20`) + bright
hairline (`border-white/35`); hover lightens slightly and lifts (`-translate-y-0.5`,
deeper shadow). Light mode: solid ink button, white text. Secondary buttons are
transparent + hairline.

---

## 6. Motion system

**One easing curve everywhere**: `cubic-bezier(0.16, 1, 0.3, 1)` — a long-tail
ease-out. One curve is what makes a page feel art-directed instead of assembled.

### Page-load sequence (plays once)

The pattern: chrome first, then a shimmer signature, then content in deliberate steps.

| Order | Element | Animation |
|---|---|---|
| 1 | Navbar | fade + slide down (`y:-20→0`, ~1.2s), starts immediately |
| 2 | Nav sheen | one skewed light band sweeps across the pill (CSS keyframe, ~1.1s, delay ~0.9s, peak `rgba(255,255,255,.16)`) |
| 3 | Headline | fade + `y:20→0`, ~1.25s, delay ~0.5s |
| 4 | Sub-headline | same, ~+0.3s |
| 5 | CTA row | same, ~+0.25s |
| 6 | Media frame | same, ~+0.25s |

Steps must be spaced ~0.25–0.3s so the build reads 1-2-3, not as one blur.
Subpages: a single `y:16→0` fade of the whole column (~0.9s).

### Allowed continuous motion

- A showcase card may auto-cycle through real examples every ~4s
  (`AnimatePresence mode="wait"`, enter `y:8→0` 0.45s, exit upward).
- Accordions animate `height: 0 ↔ auto` + opacity, ~0.4s, one open at a time, first
  open by default.
- Toggle knobs use a spring (`duration ~0.45, bounce ~0.25`).

### Forbidden motion

Scroll hijacking, auto-scroll, fake cursors (those are promo-video tricks — never on a
live site), parallax, marquees, logo pulse/spin at rest, anything that moves without
the user or the load sequence causing it.

---

## 7. Component patterns

### Navbar
Glass pill. Left: logo + wordmark, clicks home. Center: **only links that go somewhere
real** — two or three, no more. If a page doesn't exist, its link doesn't exist (no
dead Product/Pricing/Docs/About handlers — instant tell of template slop). Right:
theme-switch pill (a ~52×28 track whose knob slides with a spring and carries the
moon/sun) + at most one icon button (e.g. GitHub). Mobile: switch + hamburger opening
a glass dropdown with the same items.

### Hero
Centered column: H1 (one italic serif word) → sub of ≤3 flat sentences → ONE primary
CTA (use the real brand mark if referencing a platform — the actual Apple/Google/etc.
SVG path, never an icon library's approximation). Below: the product, real — a screen
recording or live demo in a hairline-bordered rounded frame (`autoPlay loop muted
playsInline` for video). Optionally a faint radial darkening behind the text in dark
mode for contrast. No badge rows, no logo walls, no dual-CTA hedging unless the
secondary genuinely does something different.

### Features — bento grid
3 columns desktop (`grid-cols-1 md:grid-cols-3`, gap-4), wides via `md:col-span-2`,
packed so every row sums to 3 (2+1 / 2+1 / 1+2). Each cell: transparent, hairline,
~`p-6/7`, desktop `min-h ~230px`, an **art zone** (~120px) holding a real artifact,
then a 16px semibold title and 13.5px dim copy. The lead (wide) cell demonstrates the
core action with real input→output examples, auto-cycling. Order cells by the §1
hierarchy: the zero-setup core action first; optional capabilities mid-grid, explicitly
marked "optional"; trust/openness last as a wide anchor.

### FAQ — as a conversation
Reading-width column. Each item: a "?" in a transparent hairline circle + the question
in a transparent hairline bubble (this is the visitor speaking). On click, the answer
slides down as its own dimmer bubble, indented, with the **product's mascot/logo
asset** sitting beside it (the product is answering). One open at a time. 5–8 questions
max, only ones a real visitor would ask; answers start with the direct answer.

### Changelog — an editorial release journal
Two columns: a sticky left rail listing version + date (tabular numerals; latest in
full ink, others dim; click scrolls), and a reading column: eyebrow → "What's new
in [product]." → one intro sentence → "Latest release X · date" as plain text. Each
release: date, name, then bullets in the **bold lead — explanation** formula with
optional dimmer sub-notes, hairline rule between releases. Auto-source from the GitHub
releases API when available (parse `Lead — rest` / `Lead: rest` per bullet line), with
a seeded fallback. **No** version badges, timeline dots, "Latest" chips, or back
buttons — the nav handles navigation.

### Legal pages
Same editorial shell: eyebrow LEGAL → serif title → faint "Last updated" → sections of
16px semibold heads + 14px dim paragraphs. Write them in plain honest English; a
truthful privacy page is marketing for technical audiences. No cards, no glass.

### Footer — one quiet line
A hairline rule, then: logo + wordmark (links home) ←→ 4–6 inline links (primary
action, changelog, repo, privacy, terms). A fainter sub-rule, then: `© year name ·
license` ←→ a personal credit ("Made by @handle") with the maker's real avatar
(`https://unavatar.io/x/<handle>`, ~20px circle, `loading="lazy"`, hidden on error),
linking to their profile. No link columns unless the site genuinely has >8
destinations. No taglines, no newsletter box, no glass card.

---

## 8. Architecture & performance

- Either let the body scroll, or — if using an inner scroll container
  (`h-screen overflow-y-auto flex flex-col`) — every page-level `<main>` needs
  `flex-shrink-0`, or flex will squeeze it and content will overflow into the footer.
- Hash-based routing (`#/changelog`, `#/privacy`) is enough for a landing site — no
  router dependency. Scroll to top on route change.
- Code-split every page that isn't the homepage (`React.lazy` + a min-h-screen
  fallback so the footer doesn't jump).
- UI images ≤ ~30 KB: downscale source art to its largest rendered size ×3
  (`sips -Z 128 in.png --out small.png`). Never ship a megabyte logo into a 32px slot.
- `loading="lazy"` on below-fold and third-party images.
- Set the real `<title>` and check it — shipping the template's title is an
  embarrassment that actually happens.
- Verify mobile at 390px wide by *measuring* (`document.documentElement.scrollWidth`),
  not eyeballing: zero horizontal overflow, tap targets ≥40px, fixed min-heights and
  large radii relaxed on mobile, decorative indents collapsed, side rails hidden.

---

## 9. Anti-pattern checklist (any one = instant rejection)

- ❌ Any element with its own background fill outside the two glass recipes
- ❌ Invented accent colors, especially purple/violet
- ❌ Glass/blur on content sections
- ❌ Badge pills, timeline dots, "Latest" chips, back buttons
- ❌ `…` truncated examples; incomplete sentences in product demos
- ❌ Hype copy, stacked negation lists, em-dash chains
- ❌ A secondary feature presented as the product's identity
- ❌ Dead nav links / template leftovers (titles, favicons, lorem)
- ❌ Fake testimonials, invented metrics, logo walls
- ❌ Scroll hijacking, auto-scroll, decorative cursors, marquees, parallax
- ❌ Icon-library stand-ins for real brand marks
- ❌ Logo animation at rest

---

## 10. Working method (how to ship this with a demanding owner)

1. **Showcase first.** Build each new section as a standalone, self-contained HTML
   file with real copy and working interactions — 2–3 labeled variations — and open
   it in their browser. React/production code only after a variation is approved.
2. **References are structure, not skin.** When the owner shares a screenshot they
   love, adopt its *layout idea* and rebuild it entirely inside this system. Their
   colors, badges, and chrome never leak in.
3. **Apply feedback literally, then prove it.** "No fills" means grep for `bg-` and
   show zero. "It's broken" means screenshot the broken state, name the root cause,
   fix it, and screenshot the fix at the same viewport.
4. **Verify like a user**: load the page, click the things, resize to a phone,
   measure overflow, read every line of copy out loud once. Anything you wouldn't
   defend in review, delete.
