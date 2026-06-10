/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Sparkles, Check, ArrowRight, X } from "lucide-react";
import Navbar from "./components/Navbar";
import WatchItWorkModal from "./components/WatchItWorkModal";
import { lazy, Suspense } from "react";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

/* Secondary pages load only when visited — keeps the first paint light. */
const Changelog = lazy(() => import("./components/Changelog"));
const PrivacyPolicy = lazy(() => import("./components/Legal").then((m) => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import("./components/Legal").then((m) => ({ default: m.Terms })));

/* The real Apple mark (not the fruit). */
function AppleLogo({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 384 512" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.7-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash);
      document.getElementById("app-viewport-root")?.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

export default function App() {
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try { return localStorage.getItem("ena.theme") === "light" ? "light" : "dark"; } catch { return "dark"; }
  });
  const dark = theme === "dark";
  const route = useHashRoute();

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("ena.theme", next); } catch {}
  };

  const scrollToDemo = () => {
    document.getElementById("demo-video-wrapper")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleGetStarted = () => {
    setIsGetStartedOpen(true);
  };

  const handleSignupSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSignupSuccess(true);
    setTimeout(() => {
      setIsGetStartedOpen(false);
      setSignupSuccess(false);
      setEmailInput("");
    }, 1800);
  };

  // Custom ease specified by the user: [0.16, 1, 0.3, 1]
  const customEase = [0.16, 1, 0.3, 1];

  const animateVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.25,
        ease: customEase,
        delay: customDelay,
      },
    }),
  };

  return (
    <div
      className={
        "relative w-screen h-screen overflow-y-auto overflow-x-hidden flex flex-col font-sans select-none scroll-smooth transition-colors duration-500 " +
        (dark ? "bg-[#0a0a0a] text-white" : "bg-[#f5f5f3] text-[#1a1a1a]")
      }
      id="app-viewport-root"
    >
      {/* Matte background: near-black in dark mode, warm paper in light mode */}

      {/* Floating Headroom & Fixed Header Navigation */}
      <Navbar
        onGetStarted={handleGetStarted}
        theme={theme}
        onToggleTheme={toggleTheme}
        onHowItWorks={scrollToDemo}
      />

      {route === "#/changelog" ? (
        <Suspense fallback={<div className="min-h-screen" />}>
          <Changelog theme={theme} />
        </Suspense>
      ) : route === "#/privacy" ? (
        <Suspense fallback={<div className="min-h-screen" />}>
          <PrivacyPolicy theme={theme} />
        </Suspense>
      ) : route === "#/terms" ? (
        <Suspense fallback={<div className="min-h-screen" />}>
          <Terms theme={theme} />
        </Suspense>
      ) : (
      <>
      {/* Hero content centered in upper third */}
      <main className="flex-shrink-0 min-h-screen flex flex-col items-center justify-start pt-28 sm:pt-32 md:pt-40 px-5 sm:px-6 relative z-10" id="hero-main-container">
        {/* Subtle, soft radial shadow block precisely behind the content so the white text contrast against raw sky is maximum */}
        {dark && (
          <div className="absolute top-[28%] md:top-[32%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[480px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_65%)] pointer-events-none z-0" />
        )}

        {/* Headline block */}
        <motion.h1
          custom={0.5}
          variants={animateVariants}
          initial="hidden"
          animate="visible"
          className={"font-serif text-4xl sm:text-5xl md:text-7xl leading-[1.08] md:leading-[1.05] tracking-tight max-w-4xl text-center select-text relative z-10 " + (dark ? "text-white" : "text-[#1a1a1a]")}
          style={dark ? { textShadow: "0 2px 12px rgba(0,0,0,0.35)" } : undefined}
          id="hero-header-headline"
        >
          Meet ENA, the prompt enhancer that lives on your <span className="italic font-serif">Mac</span>.
        </motion.h1>

        {/* Subtitle block */}
        <motion.p
          custom={0.8}
          variants={animateVariants}
          initial="hidden"
          animate="visible"
          className={"mt-5.5 text-base md:text-[18px] leading-relaxed max-w-xl text-center font-normal select-text relative z-10 " + (dark ? "text-white/90" : "text-[#1a1a1a]/75")}
          style={dark ? { textShadow: "0 2px 12px rgba(0,0,0,0.35)" } : undefined}
          id="hero-header-subline"
        >
          Type a rough idea and get back a sharp, structured prompt. Add a project when you want one grounded in your actual codebase. Works with the Claude or Codex you already use.
        </motion.p>

        {/* CTA Actions Group */}
        <motion.div
          custom={1.05}
          variants={animateVariants}
          initial="hidden"
          animate="visible"
          className="mt-9 flex flex-row items-center justify-center relative z-10"
          id="hero-cta-button-row"
        >
          {/* Primary CTA button */}
          <button
            onClick={handleGetStarted}
            className={
              "group relative backdrop-blur-md text-sm md:text-base font-medium rounded-full px-7 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition-all duration-300 active:scale-98 cursor-pointer flex items-center gap-2 border " +
              (dark
                ? "bg-black/20 border-white/35 text-white hover:bg-white/10"
                : "bg-[#1a1a1a] border-[#1a1a1a] text-white hover:bg-[#1a1a1a]/90")
            }
            id="primary-cta-btn"
          >
            <AppleLogo size={16} className="text-white/95" />
            <span>Download for macOS</span>
          </button>
        </motion.div>

        {/* Frameless Video Player Frame directly inside Hero */}
        <motion.div 
          custom={1.3}
          variants={animateVariants}
          initial="hidden"
          animate="visible"
          className={
            "w-full rounded-2xl md:rounded-3xl max-w-5xl mt-12 md:mt-20 overflow-hidden relative z-10 border " +
            (dark ? "shadow-[0_24px_64px_rgba(0,0,0,0.4)] border-white/10" : "shadow-[0_24px_64px_rgba(0,0,0,0.15)] border-[#1a1a1a]/10")
          }
          id="demo-video-wrapper"
        >
          <div className="aspect-video md:aspect-[16/9] relative">
            <video
              src="https://pub-d50b64b3cf024fb99056d2fda492c991.r2.dev/ena-demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
        </motion.div>

        <Features theme={theme} />
        <FAQ theme={theme} />
      </main>
      </>
      )}

      <Footer theme={theme} onGetStarted={handleGetStarted} />

      {/* Interactive Signup Form Popover/Modal */}
      <AnimatePresence>
        {isGetStartedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark minimal background blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGetStartedOpen(false)}
              className="absolute inset-0 bg-[#0C1117]/15 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 p-6 shadow-[0_24px_48px_rgba(0,0,0,0.1)] text-[#1A1A1A] z-10"
              id="get-started-signup-card"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#1A1A1A]/80 rotate-12" />
                  <span className="font-semibold text-xs uppercase tracking-wider text-[#1A1A1A]/50">Priority Access</span>
                </div>
                <button
                  onClick={() => setIsGetStartedOpen(false)}
                  className="rounded-full p-1 text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="font-serif text-3xl mb-1 text-[#1A1A1A] leading-tight">Welcome to ENA</h3>
              <p className="text-xs text-[#1A1A1A]/60 mb-6 leading-relaxed">
                Connect your workspace to experience an AI buddy that thinks deeply and codes calmly. Enter your email to secure early access.
              </p>

              {signupSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 flex flex-col items-center justify-center text-center space-y-3"
                >
                  <div className="bg-[#1A1A1A]/5 rounded-full p-3.5">
                    <Check size={24} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-[#1A1A1A]">You are on the list</h4>
                    <p className="text-[11px] text-[#1A1A1A]/50 mt-1">Authenticating priority ticket... Done</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1A1A1A]/50 uppercase tracking-wider mb-1.5 px-1 select-none">
                      Developer Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-white/80 rounded-2xl text-sm focus:outline-none focus:border-[#1A1A1A]/40 transition-all font-sans text-[#1A1A1A] shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white font-medium text-sm py-3.5 rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Join Priority List <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
