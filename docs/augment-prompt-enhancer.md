# The Augment Prompt Enhancer — A Complete Breakdown

> Research dossier compiled for the `prompt-enchancer` project.
> This is the feature this project is modeled on. It sits **on top of** the Context Engine — read [`augment-context-engine.md`](./augment-context-engine.md) first for the retrieval layer it depends on.
> Primary sources: Augment Code official blog, LukeW, and the Codacy "AI Giants" interview.
> Last updated: 2026-06-07

---

## Table of Contents

1. [What It Is, In One Sentence](#1-what-it-is-in-one-sentence)
2. [The Premise](#2-the-premise)
3. [Why Augment Built It](#3-why-augment-built-it)
4. [The User Flow](#4-the-user-flow)
5. [How It Works Under the Hood](#5-how-it-works-under-the-hood)
6. [Anatomy of an Enhanced Prompt](#6-anatomy-of-an-enhanced-prompt)
7. [The Four Design Pillars](#7-the-four-design-pillars)
8. [Why the Grounding Is the Moat](#8-why-the-grounding-is-the-moat)
9. [The Transparency / Edit Loop](#9-the-transparency--edit-loop)
10. [Economic & Pricing Consequences](#10-economic--pricing-consequences)
11. [The General Pattern](#11-the-general-pattern)
12. [Availability](#12-availability)
13. [Implementation Blueprint (Build Your Own)](#13-implementation-blueprint-build-your-own)
14. [A Reference Rewrite System Prompt](#14-a-reference-rewrite-system-prompt)
15. [Pitfalls & Anti-Patterns](#15-pitfalls--anti-patterns)
16. [Sources](#16-sources)

---

## 1. What It Is, In One Sentence

The Prompt Enhancer takes a developer's **rough, vague prompt**, **pulls relevant context from the codebase + current session**, and **rewrites it into a structured, codebase-aware prompt** — which the developer can **review and edit in-place** before sending to the model.

It is a **user-facing layer on top of the Context Engine**: the engine supplies the grounding, the enhancer does the rewrite and the UX.

---

## 2. The Premise

> **"You know what you want, but the model doesn't."**

The gap the feature closes:

- Developers using AI coding tools "write incomplete or vague prompts, which leads to incorrect or suboptimal outputs."
- The fix isn't a smarter model — it's a **clearer, fuller prompt** that's grounded in the actual codebase.

The core research finding that justifies the whole feature:

> **The clarity of your prompt directly drives the success of an agent run** — both in the quality of generated code *and* in actually accomplishing the task.

---

## 3. Why Augment Built It

From talking to their community, one insight stood out (paraphrased from the launch blog):

- **Prompt clarity is the highest-leverage variable.** A clear prompt is the difference between a one-shot success and a frustrating back-and-forth.
- **AI coding agents are new to most people.** Thousands of developers try them for the first time every day; many never hit the "magic moment" where the agent nails the task on the first try. The enhancer is designed to manufacture that moment.
- **Better prompts are cheaper.** Beyond delight, good prompts mean **fewer tool calls** and **less back-and-forth steering** → lower compute cost and faster turnaround.

So the motivations are three-fold: **success rate**, **accessibility/onboarding**, and **cost efficiency**.

---

## 4. The User Flow

The whole interaction is four steps:

1. **Type a rough prompt** in Chat or Agent (e.g. *"add logging to the payment api"*).
2. **Hit the ✨ button.**
3. **Review the enhanced prompt** — edit it as necessary.
4. **Send it** to the model.

```
  ┌────────────────────┐
  │  "add logging to    │   1. User types a vague prompt
  │   the payment api"  │
  └─────────┬──────────┘
            │  2. Click ✨
            ▼
  ┌──────────────────────────────────────────────┐
  │  CONTEXT ENGINE                               │
  │  • pull relevant context from codebase index  │
  │  • pull current coding-session context        │
  │  • resolve concrete files + symbols           │
  └─────────┬────────────────────────────────────┘
            │
            ▼
  ┌──────────────────────────────────────────────┐
  │  LLM REWRITE                                  │
  │  vague prompt + retrieved context             │
  │            ──►  structured, grounded prompt   │
  └─────────┬────────────────────────────────────┘
            │
            ▼
  ┌──────────────────────────────────────────────┐
  │  TRANSPARENT DIFF (3. review / edit in place) │
  │  "what you see is what gets sent"             │
  └─────────┬────────────────────────────────────┘
            │  4. Send
            ▼
        The model / agent runs
```

---

## 5. How It Works Under the Hood

Three things happen between the ✨ click and the rewritten prompt appearing:

### a) Contextual retrieval
The enhancer queries **two** sources via the Context Engine:

- **The codebase index** — Augment's real-time, per-developer semantic index (see the context-engine doc). This is what lets it reference **real files and symbols** that exist in *your* current branch state.
- **The current coding session** — what you're working on right now in the IDE (open files, recent edits, focus).

### b) Prompt rewrite
An LLM takes `vague prompt + retrieved context` and rewrites it into a structured prompt — crucially, **filling in missing details like specific file paths and symbol names** drawn from the codebase. Per LukeW:

> "Augment uses its codebase understanding to rewrite the initial prompt, incorporating the gathered context and filling in missing details like files and symbols from the codebase. In many cases, the system knows what's in a large codebase better than a developer simply because it can keep it all 'in its head' and track changes happening in real time."

### c) Surface for review
The rewritten prompt is shown back to the developer as an **editable diff** before anything is sent (see §9).

The key architectural point: **the enhancer is not a standalone "improve my prompt" LLM call.** Its quality comes almost entirely from step (a) — the grounding.

---

## 6. Anatomy of an Enhanced Prompt

### 6.1 The REAL example (from Augment's own docs) ⭐

This is the **canonical before/after published by Augment** (Auggie CLI docs). It is the
authoritative reference for what their output actually looks like — copy this structure.

**Before (what the user typed):**
```
fix the login bug
```

**After Enhancement (Augment's documented output):**
```
Fix the authentication bug in the login flow. Please:

1. Review the current login implementation in `src/auth/login.ts`
2. Check for issues with token validation and session management
3. Examine error handling in the authentication middleware
4. Look at recent changes to the user authentication flow
5. Test the fix with both valid and invalid credentials
6. Ensure the fix follows our existing error handling patterns

Context: This appears to be related to the recent changes in the
authentication system. Please maintain consistency with our existing
auth patterns and ensure proper error messages are returned to the user.
```
> Source: https://docs.augmentcode.com/cli/interactive/prompt-enhancer (§ Examples)

**The structural formula this reveals** — every enhanced prompt has three parts:

1. **Restated goal** — the vague verb becomes a specific, disambiguated objective
   (`fix the login bug` → "Fix the **authentication** bug in the login flow").
2. **A numbered checklist** of concrete steps that **reference real files** (`src/auth/login.ts`,
   the auth middleware), name subsystems (token validation, session management), and include
   **verification steps** ("test with valid and invalid credentials").
3. **A `Context:` paragraph** that tells the model to **stay consistent with existing patterns**
   and points at *why* (recent changes in the auth system).

Notice what it added beyond the four words: a precise goal, file paths, a step sequence,
test/verification requirements, and a "match our conventions" instruction. That's the entire
value of the feature in one diff.

### 6.2 Illustrative second example (reconstruction)

Not from Augment — written here to show the same formula applied to a different task.

**Before:**
```
add logging to the payment api
```

**After (same formula: goal → file-referencing checklist → Context):**
```
Add structured logging to the payment request path.

Context (from codebase):
- Entry point: api/payments.ts → processPayment(amount)
- Stripe call: utils/stripe-client.ts → stripe.charges.create()
- Existing logger: lib/telemetry.ts → logEvent(name, data)

Requirements:
- Use the existing logEvent() pattern from lib/telemetry.ts (do not
  introduce a new logging library).
- Log at each critical point: request received, before the Stripe
  charge, on success, on failure (with error detail).
- Match the naming conventions already used in telemetry.ts.
```

This mirrors the engine's own marketing example: when you ask *"add logging to payment
requests,"* it "maps the entire path: React app, Node API, payment service, database, webhook
handlers" and adds logging at every critical point **using your existing patterns**.

### 6.3 The CLI interaction (Auggie), for reference

Augment's CLI (`auggie`) exposes the same feature, and the docs spell out the exact interaction —
useful as a spec for ENA's own flow:

- Trigger: **Ctrl+P** (only when there's text in the input, in interactive/Normal mode).
- It **saves your input to history**, switches to **Enhancement mode** (input disabled), and shows
  the indicator **"Enhancing your prompt, press Esc to cancel."**
- It **replaces** your text in-place with the enhanced version; you review/edit, then Enter.
- **Cancel** with Esc or Ctrl+C → original prompt restored.
- **On failure** (network/service/too-short input) → original restored + a ~3s error notification.
- Enhancement uses **current workspace context + conversation history**.
- Docs note you can **enhance the same prompt multiple times** for different approaches, and that
  even minimal prompts ("add tests", "refactor this") work.

> Source: https://docs.augmentcode.com/cli/interactive/prompt-enhancer

### 6.4 Community usage notes

Full community *before/after outputs* are hard to capture (Reddit blocks scrapers/bots at the
network level, and the official docs example above is the only verbatim before/after Augment
publishes). What the community *does* describe about how they use it:

- **It's not just for vague prompts — it's a "reinterpret this mess" button.** From r/AugmentCodeAI
  ("How Are You Using the Enhanced Prompt Button?"): users paste **raw instructions, error
  messages, logs, or code fragments** and let the enhancer **reinterpret them** into a structured,
  actionable prompt. So the input is often *messy*, not just *short*.
  (Source: r/AugmentCodeAI thread `1p4qzfl` — paraphrased from the thread summary; full text
  unreachable via scraper.)
- **Conversation-aware, not one-shot.** Cursor-forum users praising it (May 2025) emphasize it
  "enhances prompts **dynamically based on the context and flow of the conversation** — which means
  you're always aligned with the intent and never off-track."
  (Source: https://forum.cursor.com/t/.../92328)
- **The "Question?" trick.** A widely-shared tip: append **`Question?`** to your prompt and, because
  the enhancer reflects the model's understanding back, it will **ask you clarifying questions**
  instead of guessing — turning the enhancer into a quick requirements interview.

> Note for ENA: these confirm three design bets — accept messy/multi-line input (logs, errors),
> use conversation/session context (not just the lone prompt), and support a clarifying-questions
> mode. The first two are already in ENA's flow; the "Question?" mode is an easy future add.

---

## 7. The Four Design Pillars

The launch blog lists four things the feature delivers:

1. **Cut down on typing** — type a generic prompt, click ✨, get back a structured one. You write less, the system fills in more.
2. **Pull in relevant context automatically** — no copy-pasting related code; it uses Augment's codebase understanding when crafting the prompt.
3. **Clarify the model's understanding** — it **exposes the model's interpretation of your prompt, surfacing its mistakes in the process** — and you can edit them in place.
4. **Improve answer quality** — more detailed, accurate prompts → better first responses and fewer corrections later.

Pillar #3 is the subtle, important one: the enhanced prompt is effectively **the model showing its work before doing the work.**

---

## 8. Why the Grounding Is the Moat

This is the single most important takeaway for building one.

> **Anyone can wrap an LLM with "make my prompt better." What's defensible is grounding the rewrite in the actual codebase.**

- A generic prompt-improver rewrites your text into nicer text — but it **doesn't know your files exist.**
- Augment's enhancer injects **real file paths and symbol names from your current branch**, because it queries the real-time index.
- Per LukeW, "the system knows what's in a large codebase better than a developer" — it holds the whole repo "in its head" and tracks changes in real time.

So the value is roughly:

```
enhancer value  ≈  quality of retrieval (grounding)  ×  quality of rewrite (LLM)
```

…and the retrieval term dominates. A great rewrite of context-free text is still context-free.

---

## 9. The Transparency / Edit Loop

A defining UX choice: **the enhanced prompt is always shown to the user, as a transparent diff, and is editable before sending.**

- **"Prompt diff is transparent — what you see is what gets sent."** Nothing hidden is injected.
- If the enhancer **gets something wrong, you correct it in-place before sending** to the model.
- This does double duty:
  - **Trust** — the user sees exactly what the model will receive.
  - **Error-catching** — misinterpretations are caught *before* a wasted agent run, not after.

It is also an **educational tool**: as developers use it, they "regularly learn what's possible with AI, what Augment understands and can do, and how to get the most out of both systems." Over time it makes developers **better prompters themselves.**

> Design rule worth stealing: **never auto-send an enhanced prompt.** The review step *is* the feature, not friction.

---

## 10. Economic & Pricing Consequences

The Prompt Enhancer had an outsized effect on Augment's unit economics — instructive for anyone shipping one:

- **Intended effect:** better prompts → **fewer tool calls, less back-and-forth** → lower compute cost, faster results, cheaper runs.
- **Unintended effect:** it made each user message do **exponentially more work.** From the Codacy interview:

  > "The agents started doing more and more work for one user message, and the pricing just didn't make sense... Their prompt enhancer feature, which automatically enriches simple prompts with codebase context, made the problem worse by making each message do exponentially more work."

- **Result:** it helped break Augment's original **per-message** pricing and pushed them to **transparent, usage-based pricing** aligned with actual compute.

Lesson: a good enhancer **shifts cost from many cheap messages to fewer expensive ones.** Price (and capacity-plan) accordingly.

---

## 11. The General Pattern

Augment's enhancer is one instance of a broader principle (per LukeW):

> **"AI models are much better at writing prompts for AI models than people are."**

Augment uses the same "rewrite the user's prompt" technique across its **image-generation** and **knowledge-agent** products too — but the code version is "significantly improved through its real-time codebase understanding."

The reusable template:

```
vague human input
      │
      ▼
contextual retrieval        ◄── the differentiator
      │
      ▼
structured optimized prompt (written by the system that knows what's possible)
      │
      ▼
human review / edit         ◄── trust + error-catching
      │
      ▼
execute
```

> "By transforming vague or incomplete instructions into detailed, optimized prompts written by the systems that understand what's possible, we can make powerful AI tools more accessible and more effective." — LukeW

---

## 12. Availability

- Shipped in **VS Code** and **JetBrains**.
- Lives in both **Chat** and **Agent** modes.
- Invoked via the **✨ button**.
- Launched May 2025.

---

## 13. Implementation Blueprint (Build Your Own)

A concrete three-layer design, mapped to Augment's choices.

### Layer 1 — Retrieval (the grounding)
**Goal:** given the vague prompt + session state, fetch the concrete files/symbols/patterns that should appear in the rewrite.

- Index the codebase semantically (embeddings), not just grep. *(If you can't build custom embedding models, start with a generic embedder — but know it's the weakest link; see context-engine doc §6.)*
- Pull from **two sources**: the **index** (whole-repo knowledge) and the **live session** (open files, recent edits, cursor focus).
- Rank for **helpfulness over similarity** — don't inject things the model already knows (stdlib, popular OSS).
- Resolve to **concrete artifacts**: file paths, function/class names, existing utility patterns to reuse.
- Respect **freshness** — the index must reflect the user's *current branch*, or you'll inject symbols that don't exist (hallucination risk).

### Layer 2 — Rewrite
**Goal:** turn `vague prompt + retrieved context` into a structured prompt.

- Single LLM call with a system prompt (see §14).
- Output should include: restated intent, the relevant files/symbols, requirements as an enumerated list, and constraints (reuse existing patterns, match conventions).
- **Do not invent** files/symbols that aren't in the retrieved context — only reference what retrieval surfaced.

### Layer 3 — Transparent edit loop
**Goal:** trust + error correction.

- **Always show** the rewritten prompt before sending. **Never auto-send.**
- Make it **editable in place**.
- Show it as a **diff / clearly distinct from the original** so the user sees what changed.
- "What you see is what gets sent" — inject nothing hidden.

### Cross-cutting decisions
| Decision | Recommended default (per Augment) |
|----------|-----------------------------------|
| Freshness of index | Seconds-fresh, branch-correct |
| Ranking objective | Helpfulness > textual similarity |
| Auto-send? | **Never** — review step is the feature |
| Transparency | Full diff; nothing hidden |
| Cost model | Expect fewer-but-heavier runs; meter usage |

---

## 14. A Reference Rewrite System Prompt

A starting point for Layer 2 (adapt to your stack). This is an illustrative reconstruction, not Augment's actual prompt:

```
You are a prompt enhancer for an AI coding agent. You receive:
  (1) a developer's rough prompt, and
  (2) retrieved context from their codebase (file paths, symbols,
      existing patterns) and current editor session.

Rewrite the rough prompt into a clear, structured prompt the agent
can execute on the first try. Follow these rules:

- Ground every reference in the RETRIEVED CONTEXT. Only mention files,
  functions, and symbols that appear there. Never invent paths or names.
- Restate the developer's intent in one sentence.
- List the specific files/symbols involved, with their roles.
- Express the work as an enumerated list of concrete requirements.
- Add constraints that prevent likely mistakes: reuse existing
  utilities/patterns instead of adding new dependencies, and match the
  codebase's naming and style conventions.
- If the rough prompt is ambiguous, make the most reasonable assumption
  given the context and state it explicitly, so the developer can correct it.
- Do NOT write the code. Produce only the enhanced prompt.
- Keep it tight — no filler, no restating these instructions.

Output the enhanced prompt only.
```

Key behaviors encoded: **ground-or-omit**, **expose assumptions** (so the human can correct them — pillar #3), and **never fabricate** symbols.

---

## 15. Pitfalls & Anti-Patterns

- ❌ **Treating it as a pure LLM "improve my prompt" call.** Without retrieval it's a thesaurus. The grounding is the product.
- ❌ **Auto-sending the enhanced prompt.** Removes trust and the error-catching step — the whole point of pillar #3.
- ❌ **Hallucinated files/symbols.** If retrieval is stale or the rewrite invents names, you inject confidently-wrong context — worse than no context. Enforce ground-or-omit.
- ❌ **Stale index / wrong branch.** Referencing a symbol that exists on `main` but not the user's branch causes the downstream agent to hallucinate. Freshness matters here too.
- ❌ **Over-stuffing.** Injecting everything "relevant" wastes prompt budget and degrades the run. Rank for helpfulness; compress.
- ❌ **Hidden injection.** If what's sent differs from what's shown, you break the trust contract. "What you see is what gets sent."
- ❌ **Ignoring the cost shift.** Each enhanced message does far more work; plan compute/pricing for fewer-but-heavier runs.

---

## 16. Sources

**Augment Code (official):**
- **Auggie CLI — Prompt Enhancer docs (the real before/after example)** — https://docs.augmentcode.com/cli/interactive/prompt-enhancer
- "Prompt Enhancer live in Augment Chat" (Molisha Shah, May 2025) — https://www.augmentcode.com/blog/prompt-enhancer-live-in-augment-chat
- Context Engine (the retrieval layer it builds on) — https://www.augmentcode.com/context-engine
- "Introducing Prompt Enhancer" (video) — https://www.youtube.com/watch?v=tJCilwS5GOo

**Third-party analysis:**
- LukeW, "Enhancing Prompts with Contextual Retrieval" — https://www.lukew.com/ff/entry.asp?2101
- LukeW, "Make the AI Models do the Prompting" (the general pattern) — https://www.lukew.com/ff/entry.asp?2097
- Codacy, "AI Giants: How Augment Code Solved the Large Codebase Problem" (pricing impact, VP Eng interview) — https://blog.codacy.com/ai-giants-how-augment-code-solved-the-large-codebase-problem

**Related internal doc:**
- [`augment-context-engine.md`](./augment-context-engine.md) — the retrieval system this feature depends on.
