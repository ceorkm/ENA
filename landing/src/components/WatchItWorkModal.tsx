/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Code2, Check, Sparkles, Terminal, FileText, ArrowRight } from "lucide-react";

interface WatchItWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SimulationStep = "IDLE" | "PROMPT" | "ANALYZING" | "CODING" | "COMPILING" | "SUCCESS";

export default function WatchItWorkModal({ isOpen, onClose }: WatchItWorkModalProps) {
  const [step, setStep] = useState<SimulationStep>("IDLE");
  const [typedPrompt, setTypedPrompt] = useState("");
  const [typedCode, setTypedCode] = useState("");
  const [analyzingFile, setAnalyzingFile] = useState("");

  const promptText = "Add a lightweight cached session manager that exports a polished React hook. Keep it clean and typings perfect.";

  const codeBlocks = [
    "// src/hooks/useSession.ts",
    "import { useState, useEffect } from 'react';",
    "",
    "export interface Session {",
    "  user: { id: string; name: string };",
    "  authToken: string;",
    "  expiresAt: number;",
    "}",
    "",
    "export function useSession() {",
    "  const [session, setSession] = useState<Session | null>(null);",
    "  const [loading, setLoading] = useState(true);",
    "",
    "  useEffect(() => {",
    "    // Calm sync from secure local cache",
    "    const cached = localStorage.getItem('ena_session');",
    "    if (cached) {",
    "      const parsed = JSON.parse(cached);",
    "      if (parsed.expiresAt > Date.now()) {",
    "        setSession(parsed);",
    "      }",
    "    }",
    "    setLoading(false);",
    "  }, []);",
    "",
    "  return { session, loading, active: !loading && !!session };",
    "}"
  ];

  const fullCodeText = codeBlocks.join("\n");

  useEffect(() => {
    if (!isOpen) {
      setStep("IDLE");
      setTypedPrompt("");
      setTypedCode("");
      return;
    }

    // Start simulation when modal opens
    setStep("PROMPT");
  }, [isOpen]);

  // Handle simulations
  useEffect(() => {
    if (step === "PROMPT") {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < promptText.length) {
          setTypedPrompt((prev) => prev + promptText[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStep("ANALYZING"), 800);
        }
      }, 25);
      return () => clearInterval(interval);
    }

    if (step === "ANALYZING") {
      const files = ["tsconfig.json", "package.json", "src/App.tsx", "src/main.tsx", "src/types.ts"];
      let fileIdx = 0;
      setAnalyzingFile(files[0]);

      const interval = setInterval(() => {
        fileIdx++;
        if (fileIdx < files.length) {
          setAnalyzingFile(files[fileIdx]);
        } else {
          clearInterval(interval);
          setTimeout(() => setStep("CODING"), 600);
        }
      }, 500);
      return () => clearInterval(interval);
    }

    if (step === "CODING") {
      let charIdx = 0;
      const charactersPerTick = 4; // stream faster for UX
      const interval = setInterval(() => {
        if (charIdx < fullCodeText.length) {
          setTypedCode(() => fullCodeText.slice(0, charIdx + charactersPerTick));
          charIdx += charactersPerTick;
        } else {
          setTypedCode(fullCodeText);
          clearInterval(interval);
          setTimeout(() => setStep("COMPILING"), 800);
        }
      }, 15);
      return () => clearInterval(interval);
    }

    if (step === "COMPILING") {
      const timer = setTimeout(() => {
        setStep("SUCCESS");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0C1117]/15 backdrop-blur-md cursor-pointer"
            id="modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_32px_64px_rgba(0,0,0,0.12)] text-[#1A1A1A] z-10"
            id="watch-it-work-dialog"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/5 px-6 py-4 select-none">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#1A1A1A]/80 rotate-12" />
                <span className="font-semibold text-sm tracking-tight">ENA Live Demonstration</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-all cursor-pointer"
                id="modal-close-btn"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simulation Area */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left side: Instructions & State indicator */}
                <div className="md:col-span-4 flex flex-col justify-between h-80 select-none">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1A1A1A]/40 mb-1">Concept</h4>
                      <h3 className="font-serif text-2xl text-[#1A1A1A] leading-tight">Code with zero friction</h3>
                    </div>

                    <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                      Watch how ENA indexes your actual folder structure, reasons about exports, and synthesizes precise, elegant code.
                    </p>
                  </div>

                  {/* Status Steps Tracker */}
                  <div className="space-y-2 border-t border-[#1A1A1A]/5 pt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <div className={`w-1.5 h-1.5 rounded-full ${step === "PROMPT" ? "bg-[#1A1A1A] pulse" : "bg-[#1A1A1A]/20"}`} />
                      <span className={step === "PROMPT" ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40"}>1. Input Request</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <div className={`w-1.5 h-1.5 rounded-full ${step === "ANALYZING" ? "bg-[#1A1A1A]" : "bg-[#1A1A1A]/20"}`} />
                      <span className={step === "ANALYZING" ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40"}>2. Map & Index Workspace</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <div className={`w-1.5 h-1.5 rounded-full ${step === "CODING" ? "bg-[#1A1A1A]" : "bg-[#1A1A1A]/20"}`} />
                      <span className={step === "CODING" ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40"}>3. Stream Synthesis</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <div className={`w-1.5 h-1.5 rounded-full ${step === "SUCCESS" ? "bg-[#1A1A1A]" : "bg-[#1A1A1A]/20"}`} />
                      <span className={step === "SUCCESS" ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40"}>4. Complete Hook Shipped</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Mock IDE pane */}
                <div className="md:col-span-8 bg-white/40 border border-white/80 rounded-2xl p-4 flex flex-col h-80 font-mono text-xs overflow-hidden shadow-inner">
                  {/* IDE Head */}
                  <div className="flex items-center justify-between border-b border-[#1A1A1A]/5 pb-2.5 mb-2.5 select-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]/10" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]/10" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]/10" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#1A1A1A]/40">
                      <Terminal size={10} />
                      <span>terminal — active</span>
                    </div>
                  </div>

                  {/* IDE Body View */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 select-text">
                    {/* Prompt input simulation */}
                    <div className="space-y-1">
                      <span className="text-[#1A1A1A]/40 text-[10px] block font-sans">Prompt Input:</span>
                      <div className="bg-white/60 border border-white/60 rounded-xl p-2.5 shadow-sm text-[#1A1A1A]/95 text-xs font-sans italic leading-relaxed">
                        {typedPrompt}
                        {step === "PROMPT" && <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#1A1A1A]/70 animate-pulse" />}
                      </div>
                    </div>

                    {/* Analyzing state */}
                    {step === "ANALYZING" && (
                      <div className="flex flex-col gap-1.5 font-sans justify-center py-6 text-center select-none">
                        <div className="flex items-center justify-center gap-2 text-[#1A1A1A]/60">
                          <svg className="animate-spin h-4 w-4 text-[#1A1A1A]/70" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          <span>Analyzing workspace dependencies...</span>
                        </div>
                        <div className="text-[10px] text-[#1A1A1A]/40 font-mono">
                          Mapping definitions from: <span className="font-semibold text-[#1A1A1A]/60">{analyzingFile}</span>
                        </div>
                      </div>
                    )}

                    {/* Streaming Code block */}
                    {(step === "CODING" || step === "COMPILING" || step === "SUCCESS") && (
                      <div className="text-[11px] leading-relaxed text-[#1A1A1A]/90 whitespace-pre-wrap font-mono select-all">
                        {typedCode}
                        {step === "CODING" && <span className="inline-block w-1 h-3 ml-0.5 bg-[#1A1A1A] animate-pulse" />}
                      </div>
                    )}

                    {/* Complete compiling step */}
                    {step === "COMPILING" && (
                      <div className="flex items-center gap-2 font-sans py-2 text-xs text-[#1A1A1A]/60 border-t border-[#1A1A1A]/5 select-none">
                        <svg className="animate-spin h-3.5 w-3.5 text-[#1A1A1A]/70" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        <span>Testing and linting generated hook...</span>
                      </div>
                    )}

                    {/* Success outcome */}
                    {step === "SUCCESS" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-white/70 border border-white/80 rounded-xl flex items-center justify-between font-sans shadow-sm select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="bg-[#1A1A1A]/5 rounded-full p-1.5">
                            <Check size={14} className="text-[#1A1A1A]" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-[#1A1A1A]">Hook built successfully</div>
                            <div className="text-[10px] text-[#1A1A1A]/50">0 errors • 0 warnings • compiled in 24ms</div>
                          </div>
                        </div>

                        <button
                          onClick={onClose}
                          className="bg-white hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A] font-medium text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          Try ENA <ArrowRight size={10} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-white/40 border-t border-[#1A1A1A]/5 px-6 py-4 flex items-center justify-between gap-4 select-none">
              <span className="text-xs text-[#1A1A1A]/50">
                Simulation ends in completion.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTypedPrompt("");
                    setTypedCode("");
                    setStep("PROMPT");
                  }}
                  className="bg-white hover:bg-white/95 border border-[#1A1A1A]/10 text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors active:scale-97"
                >
                  Restart Demo
                </button>
                <button
                  onClick={onClose}
                  className="bg-white hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors active:scale-97"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
