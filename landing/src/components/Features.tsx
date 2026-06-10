/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClaudeLogo, OpenAILogo } from "./Logos";

/* Rough → enhanced pairs the lead card cycles through. */
const PAIRS = [
  {
    rough: "i want a website for my activewear brand",
    sharp: "Build a responsive ecommerce site for an activewear brand: hero, filterable catalog, product pages, cart and checkout, with placeholder products so it is browsable end to end.",
  },
  {
    rough: "fix the login thing",
    sharp: "Debug the session expiry in src/auth/login.ts: users get logged out on refresh. Check token renewal and cookie flags, and keep the session alive across reloads.",
  },
  {
    rough: "make my app feel faster",
    sharp: "Profile first load and interaction latency, lazy-load below-the-fold routes, memoize the heavy list renders, and defer analytics until the page is idle.",
  },
  {
    rough: "write copy for my launch post",
    sharp: "Write five launch post drafts in a plain, direct tone: a one line hook, what it does, who it is for, and a link. No buzzwords.",
  },
];

export default function Features({ theme }: { theme: "dark" | "light" }) {
  const dark = theme === "dark";
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PAIRS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const ink = dark ? "text-white" : "text-[#1a1a1a]";
  const body = dark ? "text-white/50" : "text-[#1a1a1a]/55";
  const faint = dark ? "text-white/30" : "text-[#1a1a1a]/35";
  const cell =
    "rounded-2xl md:rounded-3xl p-6 md:p-7 flex flex-col md:min-h-[230px] border bg-transparent transition-colors duration-300 " +
    (dark
      ? "border-white/10 hover:border-white/20"
      : "border-[#1a1a1a]/10 hover:border-[#1a1a1a]/20");
  const mono = "font-mono text-[12px] leading-[1.8] " + (dark ? "text-white/45" : "text-[#1a1a1a]/45");

  return (
    <section className="w-full max-w-5xl mt-24 md:mt-32 mb-24 relative z-10 px-0" id="features">
      <div className={"text-[11px] uppercase tracking-widest font-semibold select-none " + faint}>
        Features
      </div>
      <h2 className={"font-serif text-3xl md:text-[40px] tracking-tight mt-3 " + ink}>
        What ENA does.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 text-left">
        {/* 1 — enhance any prompt (wide, auto-cycling) */}
        <div className={cell + " md:col-span-2"}>
          <div className="h-[230px] sm:h-[170px] md:h-[150px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col gap-2 text-[13.5px] leading-relaxed max-w-[440px]"
              >
                <span className={dark ? "text-white/40" : "text-[#1a1a1a]/40"}>{PAIRS[idx].rough}</span>
                <span className={faint}>→</span>
                <span className={dark ? "text-white/85" : "text-[#1a1a1a]/85"}>{PAIRS[idx].sharp}</span>
              </motion.div>
            </AnimatePresence>
          </div>
          <h3 className={"text-[16px] font-semibold mt-auto " + ink}>Enhance any prompt</h3>
          <p className={"mt-2 text-[13.5px] leading-relaxed " + body}>
            Type a rough idea, get a sharp, structured prompt back. That&rsquo;s the whole job.
          </p>
        </div>

        {/* 2 — your existing plan */}
        <div className={cell}>
          <div className="h-[120px] flex items-center gap-6">
            <ClaudeLogo size={30} />
            <span className={dark ? "text-white/85" : "text-[#1a1a1a]/85"}>
              <OpenAILogo size={30} />
            </span>
          </div>
          <h3 className={"text-[16px] font-semibold mt-auto " + ink}>Your existing plan</h3>
          <p className={"mt-2 text-[13.5px] leading-relaxed " + body}>
            Runs through the Claude Code or Codex CLI you&rsquo;re already signed into. No API key,
            nothing new to pay for.
          </p>
        </div>

        {/* 3 — add a project (wide) */}
        <div className={cell + " md:col-span-2"}>
          <div className="h-[120px] flex items-center">
            <div className={mono}>
              <span className={dark ? "text-white/80 font-medium" : "text-[#1a1a1a]/80 font-medium"}>mythos-store/</span>
              <span className={"ml-3 " + faint}>optional</span>
              <br />├ src/components/Cart.tsx
              <br />└ <span className={dark ? "text-white/80" : "text-[#1a1a1a]/80"}>ena read 214 files · 18,602 lines</span>
            </div>
          </div>
          <h3 className={"text-[16px] font-semibold mt-auto " + ink}>Add a project when you want</h3>
          <p className={"mt-2 text-[13.5px] leading-relaxed " + body}>
            Pick a folder and your agent studies the codebase. Prompts about that project then name
            your real files and follow your conventions.
          </p>
        </div>

        {/* 4 — three versions */}
        <div className={cell}>
          <div className="h-[120px] flex items-center">
            <div className="flex flex-col gap-2">
              {["Concise", "Balanced", "Detailed"].map((v) => (
                <span
                  key={v}
                  className={
                    "rounded-full px-3.5 py-1 text-[12px] w-max border " +
                    (v === "Balanced"
                      ? dark
                        ? "bg-white text-[#1a1a1a] border-white font-semibold"
                        : "bg-[#1a1a1a] text-white border-[#1a1a1a] font-semibold"
                      : dark
                      ? "text-white/65 border-white/20"
                      : "text-[#1a1a1a]/65 border-[#1a1a1a]/20")
                  }
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
          <h3 className={"text-[16px] font-semibold mt-auto " + ink}>Three versions, every time</h3>
          <p className={"mt-2 text-[13.5px] leading-relaxed " + body}>
            Pick the depth you need. Edit in place, diff against your draft.
          </p>
        </div>

        {/* 5 — hotkey */}
        <div className={cell}>
          <div className="h-[120px] flex items-center">
            <span
              className={
                "rounded-xl px-4 py-2.5 text-[15px] border border-b-[3px] bg-transparent " +
                (dark ? "border-white/25 text-white/85" : "border-[#1a1a1a]/25 text-[#1a1a1a]/85")
              }
            >
              ⌥ Space
            </span>
          </div>
          <h3 className={"text-[16px] font-semibold mt-auto " + ink}>There when you need it</h3>
          <p className={"mt-2 text-[13.5px] leading-relaxed " + body}>
            One hotkey from any app. ENA floats above your work and gets out of the way.
          </p>
        </div>

        {/* 6 — open source (wide) */}
        <div className={cell + " md:col-span-2"}>
          <div className="h-[120px] flex items-center">
            <div
              className={
                "font-mono text-[12px] rounded-xl border border-dashed px-4 py-2.5 " +
                (dark ? "border-white/20 text-white/45" : "border-[#1a1a1a]/25 text-[#1a1a1a]/45")
              }
            >
              git clone · MIT License · no telemetry · no servers
            </div>
          </div>
          <h3 className={"text-[16px] font-semibold mt-auto " + ink}>On your device, open source</h3>
          <p className={"mt-2 text-[13.5px] leading-relaxed " + body}>
            Your prompts and code never pass through our servers. There are none. The entire app is
            public code you can read.
          </p>
        </div>
      </div>
    </section>
  );
}
