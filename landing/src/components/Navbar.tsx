/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, ArrowUpRight, Github, Sun, Moon } from "lucide-react";

interface NavbarProps {
  onGetStarted: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onHowItWorks: () => void;
}

export default function Navbar({ onGetStarted, theme, onToggleTheme, onHowItWorks }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dark = theme === "dark";

  const navItems = [
    {
      label: "How it works",
      action: () => {
        if (window.location.hash.startsWith("#/")) window.location.hash = "";
        setTimeout(onHowItWorks, 50);
      },
    },
    { label: "Changelog", action: () => (window.location.hash = "#/changelog") },
  ];

  // Custom container animation config for fade-up ease [0.16, 1, 0.3, 1]
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const glass = dark
    ? {
        backgroundColor: "rgba(0, 0, 0, 0.18)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.35)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.12)",
      }
    : {
        backgroundColor: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 8px 32px rgba(0, 0, 0, 0.06)",
      };

  const textMain = dark ? "text-white" : "text-[#1a1a1a]";
  const textDim = dark ? "text-white/75 hover:text-white" : "text-[#1a1a1a]/65 hover:text-[#1a1a1a]";

  /* Cute sliding theme switch: pill with a knob that carries the sun/moon. */
  const ThemeSwitch = (
    <button
      onClick={onToggleTheme}
      aria-label="Toggle dark / light mode"
      className={
        "relative w-[52px] h-[28px] rounded-full cursor-pointer transition-colors duration-300 border " +
        (dark ? "bg-white/10 border-white/25 hover:bg-white/15" : "bg-[#1a1a1a]/5 border-[#1a1a1a]/15 hover:bg-[#1a1a1a]/10")
      }
      id="theme-switch"
    >
      <motion.span
        layout
        transition={{ type: "spring", duration: 0.45, bounce: 0.25 }}
        className={
          "absolute top-[3px] w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-sm " +
          (dark ? "left-[3px] bg-white/90 text-[#1a1a1a]" : "left-[27px] bg-[#1a1a1a] text-white")
        }
      >
        {dark ? <Moon size={12} /> : <Sun size={12} />}
      </motion.span>
    </button>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-0" id="main-navigation">
      <motion.nav
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={glass}
        className={"relative overflow-hidden max-w-5xl mx-auto mt-5 rounded-full px-6 py-3 flex items-center justify-between select-none " + textMain}
      >
        <span className="nav-sheen" aria-hidden="true" />
        {/* Left Side: ENA Purple Orb Logo + Wordmark */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          id="nav-logo-group"
          onClick={() => (window.location.hash = "")}
        >
          <img
            src="/src/components/ena-orb-128.png"
            alt="ENA Logo"
            className="w-8 h-8 object-contain transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback if logo PNG is not loaded yet or unavailable
              e.currentTarget.style.opacity = "0.7";
            }}
          />
          <span className={"font-semibold tracking-tight text-lg " + textMain}>
            ENA
          </span>
        </div>

        {/* Center: Large screens navigation items */}
        <div className="hidden md:flex items-center gap-8" id="nav-center-menu">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={"text-sm font-medium transition-all duration-200 relative py-1 group cursor-pointer " + textDim}
            >
              {item.label}
              <span className={"absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full " + (dark ? "bg-white/60" : "bg-[#1a1a1a]/50")} />
            </button>
          ))}
        </div>

        {/* Right Side: theme switch + GitHub */}
        <div className="hidden md:flex items-center gap-3" id="nav-right-cta">
          {ThemeSwitch}
          <button
            onClick={() => {
              window.open("https://github.com/ceorkm/ena", "_blank", "noopener,noreferrer");
            }}
            className={
              "flex items-center justify-center rounded-full p-2.5 transition-all duration-300 hover:shadow-md cursor-pointer active:scale-98 border " +
              (dark
                ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                : "bg-[#1a1a1a]/5 hover:bg-[#1a1a1a]/10 border-[#1a1a1a]/15 text-[#1a1a1a]")
            }
            aria-label="GitHub Repository"
          >
            <Github size={18} />
          </button>
        </div>

        {/* Mobile: theme switch + Hamburger */}
        <div className="md:hidden flex items-center gap-3">
          {ThemeSwitch}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={"p-1 px-2 transition-colors focus:outline-none cursor-pointer " + textDim}
            aria-label="Toggle Menu"
            id="mobile-menu-toggle"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown (Frosted Pill Floating Panel) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto mt-2 px-4 md:hidden"
            id="mobile-dropdown-panel"
          >
            <div style={glass} className={"rounded-3xl p-5 shadow-xl flex flex-col gap-4 " + textMain}>
              <div className="flex flex-col gap-1.5">
                <span className={"text-xs uppercase tracking-wider font-semibold px-3 select-none " + (dark ? "text-white/40" : "text-[#1a1a1a]/40")}>
                  Navigation
                </span>
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setIsOpen(false);
                      item.action();
                    }}
                    className={
                      "text-left font-medium text-base px-3 py-2 rounded-xl transition-all cursor-pointer " +
                      (dark ? "text-white/85 hover:text-white hover:bg-white/10" : "text-[#1a1a1a]/80 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/5")
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <hr className={dark ? "border-white/10 my-1" : "border-[#1a1a1a]/10 my-1"} />

              <button
                onClick={() => {
                  setIsOpen(false);
                  onGetStarted();
                }}
                style={{
                  backgroundColor: dark ? "rgba(255, 255, 255, 0.1)" : "rgba(26, 26, 26, 0.06)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: dark ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(26, 26, 26, 0.15)",
                }}
                className={
                  "w-full font-medium text-sm py-4 rounded-2xl shadow-sm text-center flex items-center justify-center gap-2 transition-all cursor-pointer " +
                  (dark ? "hover:bg-white/20 text-white" : "hover:bg-[#1a1a1a]/10 text-[#1a1a1a]")
                }
              >
                Get ENA <ArrowUpRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
