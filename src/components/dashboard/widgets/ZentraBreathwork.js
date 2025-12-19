
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import CardIconTooltip from "./CardIconTooltip";

export default function ZentraBreathwork({ shouldSuggest, message }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("Ready"); // Ready, Inhale, Hold, Exhale

  const handleStart = () => {
    setIsActive(true);
    setPhase("Inhale");
  };

  const handleStop = () => {
    setIsActive(false);
    setPhase("Ready");
  };

  useEffect(() => {
    let timeouts = [];
    
    if (isActive) {
      setPhase("Inhale");
      
      // Inhale: 0s - 6s
      
      // Hold: 6s - 13s (7s duration)
      const t1 = setTimeout(() => {
        setPhase("Hold");
      }, 6000);
      timeouts.push(t1);

      // Exhale: 13s - 20s (7s duration)
      const t2 = setTimeout(() => {
        setPhase("Exhale");
      }, 13000);
      timeouts.push(t2);

      // Stop: 20s (Plus buffer to ensure exhale completes smoothly)
      const t3 = setTimeout(() => {
        setIsActive(false);
        setPhase("Ready");
      }, 20500);
      timeouts.push(t3);
    } else {
      setPhase("Ready");
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-visible h-full flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #050c18 0%, #0a1628 50%, #050c18 100%)",
        boxShadow:
          "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <CardIconTooltip
            title="Zentra Breathwork"
            tooltipText="A guided breathing experience designed to reduce cortisol, calm impulsive decision pathways, and restore focus. Ideal before entering the market, after a loss, or whenever you feel mentally overloaded."
            variant="dark"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
          </CardIconTooltip>
          <div className="flex flex-col h-11 justify-center">
            <h3 className="text-lg font-semibold text-white leading-tight">
              Zentra Breathwork
            </h3>
            <div className="h-4 flex items-center">
            <AnimatePresence mode="wait">
              {isActive && (
                <motion.span 
                  key="phase-text"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs font-medium text-[#2ee7ff] animate-pulse uppercase tracking-wider"
                >
                  {phase === 'Hold' ? 'Hold Breath' : phase}
                </motion.span>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>
        {message && !isActive && <p className="text-white/80 text-sm mb-4">{message}</p>}

        <div className="flex items-center justify-center flex-1 mb-6 relative overflow-visible min-h-[160px]">
          {/* Animated background orbs based on phase */}
          <AnimatePresence>
            {isActive && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/20 blur-md"
                    style={{
                      width: `${4 + Math.random() * 8}px`,
                      height: `${4 + Math.random() * 8}px`,
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      x: Math.cos(i * 30 * (Math.PI / 180)) * (phase === 'Inhale' ? 100 : phase === 'Hold' ? 120 : 40),
                      y: Math.sin(i * 30 * (Math.PI / 180)) * (phase === 'Inhale' ? 100 : phase === 'Hold' ? 120 : 40),
                      opacity: phase === 'Hold' ? [0.4, 0.8, 0.4] : 0.2, // Pulse transparency on hold
                      scale: phase === 'Inhale' ? 1.2 : phase === 'Hold' ? 1.5 : 0.5,
                    }}
                    exit={{ opacity: 0, transition: { duration: 2, ease: "easeOut" } }}
                    transition={{
                      duration: phase === 'Inhale' ? 6 : phase === 'Hold' ? 2 : 7, // Faster pulsing on hold maybe? or just steady
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Lotus SVG Container */}
          <motion.div
            className="relative z-10"
            animate={
                isActive
                  ? {
                      scale: phase === "Inhale" ? 1.3 : phase === "Hold" ? 1.35 : 1,
                      filter:
                        phase === "Hold"
                          ? "drop-shadow(0 0 25px rgba(46, 231, 255, 0.8)) brightness(1.3)"
                          : phase === "Inhale"
                          ? "drop-shadow(0 0 15px rgba(46, 231, 255, 0.4)) brightness(1.1)"
                          : "drop-shadow(0 0 0px rgba(46, 231, 255, 0)) brightness(1)",
                    }
                  : { scale: 1, filter: "drop-shadow(0 0 0px rgba(0,0,0,0))" }
              }
            transition={{
                duration: isActive ? (phase === "Inhale" ? 6 : phase === "Hold" ? 1 : 7) : 3, // Transitions match phase duration roughly
                ease: "easeInOut"
            }}
          >
            <svg
              width="200"
              height="130"
              viewBox="0 0 400 260"
              className="relative z-10"
            >
              <defs>
                <linearGradient
                  id="lotusStroke"
                  x1="-0.175"
                  y1="0.908"
                  x2="0.825"
                  y2="-0.092"
                >
                  <motion.stop
                    offset="0"
                    stopColor="#2ee7ff"
                    animate={
                        phase === 'Hold' ? { stopColor: "#ffffff" } : { stopColor: "#2ee7ff" }
                    }
                    transition={{ duration: 4, repeat: Infinity, reverse: true }}
                  />
                  <motion.stop
                    offset="0.5"
                    stopColor="#5fcbff"
                    animate={
                        phase === 'Hold' ? { stopColor: "#a26bff" } : { stopColor: "#5fcbff" }
                     }
                  />
                  <motion.stop
                    offset="1"
                    stopColor="#a26bff"
                  />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g
                fill="none"
                stroke="url(#lotusStroke)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="matrix(1, 0, 0, 1, 174.11794, 194.379049)"
                filter="url(#glow)"
              >
                 <path
                  d="M 20.915 44.942 C -41.305 -31.146 -41.305 -126.25 20.915 -183.32 C 83.135 -126.25 83.135 -31.146 20.915 44.942"
                  style={{
                    transformOrigin: "22.098px -56.152px",
                    strokeWidth: "7px",
                  }}
                  transform="matrix(0.999848, -0.017453, 0.017452, 0.999848, 0, 0)"
                />
                <g
                  transform="matrix(1.18618, -0.654872, 0.710398, 1.086007, -18.502282, 12.45881)"
                  style={{ transformOrigin: "40.6003px -68.6108px" }}
                >
                  <path
                    d=" M 0 0 C -40 -55 -40 -125 0 -170 C 40 -125 40 -55 0 0 "
                    style={{ strokeWidth: "5.28495px" }}
                  />
                </g>
                <g
                  transform="matrix(1.208312, 0.613075, -0.672064, 1.110138, 61.216585, 13.314311)"
                  style={{ transformOrigin: "-39.1185px -69.4663px" }}
                >
                  <path
                    d=" M 0 0 C -40 -55 -40 -125 0 -170 C 40 -125 40 -55 0 0 "
                    style={{ strokeWidth: "5.28495px" }}
                  />
                </g>
                <g
                  transform="matrix(0.672064, -1.110138, 1.208312, 0.613075, -47.368162, -17.033476)"
                  style={{ transformOrigin: "69.4663px -39.1185px" }}
                >
                  <path
                    d=" M 0 0 C -35 -45 -35 -105 0 -150 C 35 -105 35 -45 0 0 "
                    style={{ strokeWidth: "5.28527px" }}
                  />
                </g>
                <g
                  transform="matrix(0.710398, 1.086007, -1.18618, 0.654872, 90.708819, -15.551678)"
                  style={{ transformOrigin: "-68.6107px -40.6003px" }}
                >
                  <path
                    d=" M 0 0 C -35 -45 -35 -105 0 -150 C 35 -105 35 -45 0 0 "
                    style={{ strokeWidth: "5.28526px" }}
                  />
                </g>
                <g
                  transform="matrix(1.382462, -0.024131, -0.022132, -1.267946, 21.242547, -135.870808)"
                  style={{ transformOrigin: "0.8555px 79.7188px" }}
                >
                  <g transform="rotate(-35)" />
                  <g transform="rotate(35)" />
                </g>
              </g>
            </svg>
          </motion.div>
        </div>

        {!isActive ? (
          <button
            onClick={handleStart}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30"
          >
            Start 20s Quick Reset
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40"
          >
            Stop Session
          </button>
        )}
      </div>
    </motion.div>
  );
}
