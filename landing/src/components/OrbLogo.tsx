/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

export default function OrbLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} id="ena-orb-container">
      {/* Outer elegant glow element */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/40 blur-md"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/70"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Internal flowing serene gradient paths inside an SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="orb-grad-1" x1="10%" y1="10%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#E2ECF5" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C4D7E6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="orb-grad-2" x1="90%" y1="10%" x2="10%" y2="90%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#D2E0EE" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#B4CBDD" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* First organic morphing layer */}
        <motion.path
          d="M 50,15 C 68,15 82,28 82,46 C 82,64 65,85 50,85 C 32,85 18,65 18,46 C 18,28 32,15 50,15 Z"
          fill="url(#orb-grad-1)"
          animate={{
            d: [
              "M 50,15 C 68,15 82,28 82,46 C 82,64 65,85 50,85 C 32,85 18,65 18,46 C 18,28 32,15 50,15 Z",
              "M 50,18 C 72,16 85,32 85,48 C 85,64 68,82 50,82 C 30,82 15,66 15,48 C 15,30 28,20 50,18 Z",
              "M 50,15 C 68,15 82,28 82,46 C 82,64 65,85 50,85 C 32,85 18,65 18,46 C 18,28 32,15 50,15 Z",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Internal core layer */}
        <motion.circle
          cx="50"
          cy="48"
          r="20"
          fill="url(#orb-grad-2)"
          className="mix-blend-overlay"
          animate={{
            scale: [0.9, 1.05, 0.9],
            x: [-1, 2, -1],
            y: [1, -2, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Central highlight spark */}
        <circle cx="42" cy="40" r="4" fill="#FFFFFF" opacity="0.9" />
      </svg>

      {/* Soft inner shadow ring */}
      <div className="absolute inset-0 rounded-full border border-white/40 ring-1 ring-white/10 pointer-events-none" />
    </div>
  );
}
