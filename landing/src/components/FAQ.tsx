/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const QA = [
  {
    q: "Is ENA free?",
    a: "Yes. Free and open source under the MIT License. No account, no trial, no upsell.",
  },
  {
    q: "Do I need an API key?",
    a: "No. ENA runs on the Claude Code or Codex CLI you're already signed into, so it uses the plan you already pay for. Install it, pick your agent, type.",
  },
  {
    q: "Does my code or prompt leave my Mac?",
    a: "Only to your own AI provider. ENA has no servers — your prompt goes from your machine straight to Anthropic or OpenAI under your own account. Nothing passes through us, and there is no telemetry.",
  },
  {
    q: "Do I need a codebase to use it?",
    a: "No. ENA enhances any prompt out of the box — “i want a website for my activewear brand” works fine on its own. Add a project only when you want prompts grounded in your code.",
  },
  {
    q: "What happens when I add a project?",
    a: "Your agent reads the folder and writes its own summary of the stack, structure and conventions. From then on, prompts about that project name your real files instead of guessing.",
  },
  {
    q: "Which agents does it support?",
    a: "Claude Code and Codex. That's who we support right now.",
  },
  {
    q: "What does it run on?",
    a: "macOS 12 or newer. Signed, notarized, shipped as a DMG.",
  },
];

export default function FAQ({ theme }: { theme: "dark" | "light" }) {
  const dark = theme === "dark";
  const [open, setOpen] = useState(0);

  const ink = dark ? "text-white" : "text-[#1a1a1a]";
  const faint = dark ? "text-white/30" : "text-[#1a1a1a]/35";
  /* No fill — the page background IS the background, only a hairline ring. */
  const circle =
    "w-10 h-10 rounded-full flex-none flex items-center justify-center border bg-transparent " +
    (dark ? "border-white/15 text-white/70" : "border-[#1a1a1a]/15 text-[#1a1a1a]/70");

  return (
    <section className="w-full max-w-2xl mt-28 md:mt-36 mb-28 relative z-10" id="faq">
      <div className="text-center">
        <div className={"text-[11px] uppercase tracking-widest font-semibold select-none " + faint}>
          FAQ
        </div>
        <h2 className={"font-serif text-3xl md:text-[40px] tracking-tight mt-3 " + ink}>
          Ask ENA.
        </h2>
      </div>

      <div className="mt-10 flex flex-col gap-3.5 text-left">
        {QA.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              {/* question — you, asking */}
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center gap-3 cursor-pointer text-left"
              >
                <span className={circle + " text-[15px] font-semibold"}>?</span>
                <span
                  className={
                    "flex-1 rounded-2xl border bg-transparent px-5 py-3.5 text-[14.5px] font-medium transition-colors duration-300 " +
                    (dark
                      ? "text-white/90 " + (isOpen ? "border-white/25" : "border-white/12 hover:border-white/25")
                      : "text-[#1a1a1a]/90 " + (isOpen ? "border-[#1a1a1a]/25" : "border-[#1a1a1a]/12 hover:border-[#1a1a1a]/25"))
                  }
                >
                  {item.q}
                </span>
              </button>

              {/* answer — ENA replying, chat mark on the right */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 pt-2.5">
                      <span
                        className={
                          "flex-1 ml-4 md:ml-[52px] rounded-2xl border bg-transparent px-5 py-3.5 text-[13.5px] leading-relaxed " +
                          (dark ? "border-white/8 text-white/55" : "border-[#1a1a1a]/8 text-[#1a1a1a]/60")
                        }
                      >
                        {item.a}
                      </span>
                      <img
                        src="/src/components/ena-orb-128.png"
                        alt="ENA"
                        className="w-10 h-10 object-contain flex-none"
                        draggable={false}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
