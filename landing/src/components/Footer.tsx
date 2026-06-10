/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface FooterProps {
  theme: "dark" | "light";
  onGetStarted: () => void;
}

export default function Footer({ theme, onGetStarted }: FooterProps) {
  const dark = theme === "dark";
  const link =
    "text-[13.5px] transition-colors duration-200 cursor-pointer " +
    (dark ? "text-white/55 hover:text-white" : "text-[#1a1a1a]/55 hover:text-[#1a1a1a]");
  const faint = dark ? "text-white/30" : "text-[#1a1a1a]/35";
  const rule = dark ? "border-white/10" : "border-[#1a1a1a]/10";
  const subRule = dark ? "border-white/[0.06]" : "border-[#1a1a1a]/[0.06]";

  return (
    <footer className="w-full px-6 relative z-10" id="site-footer">
      <div className={"max-w-5xl mx-auto border-t " + rule}>
        <div className="flex justify-between items-center py-8 gap-6 flex-wrap">
          <button
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => (window.location.hash = "")}
          >
            <img
              src="/src/components/ena-orb-128.png"
              alt="ENA"
              className="w-7 h-7 object-contain"
              draggable={false}
            />
            <span className={"font-semibold tracking-tight text-[15px] " + (dark ? "text-white" : "text-[#1a1a1a]")}>
              ENA
            </span>
          </button>

          <nav className="flex items-center gap-7 flex-wrap">
            <button className={link} onClick={onGetStarted}>Download</button>
            <button className={link} onClick={() => (window.location.hash = "#/changelog")}>Changelog</button>
            <a className={link} href="https://github.com/ceorkm/ena" target="_blank" rel="noopener noreferrer">GitHub</a>
            <button className={link} onClick={() => (window.location.hash = "#/privacy")}>Privacy</button>
            <button className={link} onClick={() => (window.location.hash = "#/terms")}>Terms</button>
          </nav>
        </div>

        <div className={"flex justify-between items-center py-5 gap-4 flex-wrap border-t " + subRule}>
          <span className={"text-[12.5px] select-none " + faint}>© 2026 ENA · MIT License</span>
          <a
            href="https://x.com/ceorkm"
            target="_blank"
            rel="noopener noreferrer"
            className={
              "flex items-center gap-2 text-[12.5px] transition-colors duration-200 " +
              (dark ? "text-white/45 hover:text-white" : "text-[#1a1a1a]/45 hover:text-[#1a1a1a]")
            }
          >
            <img
              src="https://unavatar.io/x/ceorkm"
              alt=""
              className="w-5 h-5 rounded-full"
              loading="lazy"
              draggable={false}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            Made by <span className={"font-semibold " + (dark ? "text-white/75" : "text-[#1a1a1a]/75")}>@ceorkm</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
