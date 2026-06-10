/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

function Shell({
  theme,
  title,
  updated,
  children,
}: {
  theme: "dark" | "light";
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  const dark = theme === "dark";
  const ink = dark ? "text-white" : "text-[#1a1a1a]";
  const faint = dark ? "text-white/30" : "text-[#1a1a1a]/35";

  return (
    <main className="flex-shrink-0 min-h-screen px-6 pt-32 pb-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto"
      >
        <div className={"text-[11px] uppercase tracking-widest font-semibold select-none " + faint}>
          Legal
        </div>
        <h1 className={"font-serif text-4xl md:text-5xl tracking-tight mt-4 " + ink}>{title}</h1>
        <p className={"mt-3 text-[13px] select-none " + faint}>Last updated {updated}</p>
        {children}
      </motion.div>
    </main>
  );
}

function Section({
  theme,
  title,
  children,
}: {
  theme: "dark" | "light";
  title: string;
  children: React.ReactNode;
}) {
  const dark = theme === "dark";
  return (
    <section className="mt-10">
      <h2 className={"text-[16px] font-semibold " + (dark ? "text-white" : "text-[#1a1a1a]")}>{title}</h2>
      <div className={"mt-2.5 text-[14px] leading-relaxed space-y-3 " + (dark ? "text-white/55" : "text-[#1a1a1a]/60")}>
        {children}
      </div>
    </section>
  );
}

export function PrivacyPolicy({ theme }: { theme: "dark" | "light" }) {
  return (
    <Shell theme={theme} title="Privacy Policy" updated="June 10, 2026">
      <Section theme={theme} title="The short version">
        <p>
          ENA runs on your Mac. Your prompts, your code and your project index never touch
          our servers, because there are none. This page exists so you know exactly what
          happens to your data, which is almost nothing.
        </p>
      </Section>
      <Section theme={theme} title="What ENA does on your device">
        <p>
          When you add a project, ENA reads that folder locally to build a summary of the
          codebase. The summary stays on your Mac. When you enhance a prompt, ENA hands it
          to the agent you picked: your own Claude Code or Codex command line tool, signed
          in with your own account.
        </p>
        <p>
          Those requests go directly from your machine to your provider, Anthropic or
          OpenAI, under their terms. ENA is not in the middle and cannot see them.
        </p>
      </Section>
      <Section theme={theme} title="What we collect">
        <p>
          Nothing from the app. No telemetry, no analytics, no crash reporting, no account
          system.
        </p>
        <p>
          If you join the waitlist on this site we store the email you give us and use it
          for one thing: telling you about ENA releases. No sharing, no selling, one-click
          unsubscribe.
        </p>
      </Section>
      <Section theme={theme} title="Don't take our word for it">
        <p>
          ENA is open source under the MIT License. Every line of what the app does is
          public code you can read.
        </p>
      </Section>
      <Section theme={theme} title="Questions">
        <p>Open an issue on GitHub and we answer in the open.</p>
      </Section>
    </Shell>
  );
}

export function Terms({ theme }: { theme: "dark" | "light" }) {
  return (
    <Shell theme={theme} title="Terms of Use" updated="June 10, 2026">
      <Section theme={theme} title="The software">
        <p>
          ENA is free, open source software distributed under the MIT License. You may use,
          copy, modify and redistribute it under that license. It is provided as is, without
          warranty of any kind.
        </p>
      </Section>
      <Section theme={theme} title="Your AI accounts">
        <p>
          ENA works by running the Claude Code or Codex command line tools installed and
          signed in on your Mac. Your use of those tools is governed by your agreements with
          Anthropic and OpenAI. Keeping usage within your plan and your provider's policies
          is on you.
        </p>
      </Section>
      <Section theme={theme} title="Your content">
        <p>
          Everything ENA produces from your prompts and your code is yours. We claim no
          rights over any of it.
        </p>
      </Section>
      <Section theme={theme} title="Liability">
        <p>
          To the maximum extent permitted by law, ENA's authors are not liable for damages
          arising from use of the software. Review what an AI writes before you rely on it.
        </p>
      </Section>
    </Shell>
  );
}
