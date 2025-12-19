"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function TabletHero() {
  const [size, setSize] = useState(800);

  useEffect(() => {
    const calculateSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let newSize;
      if (vw < 640) newSize = Math.min(vh * 0.85, vw * 0.9);
      else if (vw < 1024) newSize = Math.min(vw * 0.7, vh * 0.8);
      else newSize = Math.min(800, vw * 0.6, vh * 0.85);

      setSize(Math.max(300, newSize));
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, []);

  return (
    <section className="relative flex items-center justify-center">
      {/* ================= MAIN DASHBOARD ================= */}
      <motion.div
        initial={{ opacity: 0, y: 160 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.2,
          ease: "easeOut",
        }}
        className="relative w-full max-w-[900px] overflow-visible"
      >
        <Image
          src="/images/tablet-heroSection2.png"
          width={size}  
          height={(size * 500) / 580}
          alt="Dashboard"
          className="w-full h-auto rounded-[48px]"
          style={{ boxShadow: "0 0 44.636px 0 rgba(0, 0, 0, 0.30)" }}
        />

        {/* ================= RIGHT OVERLAY (Top → Down) ================= */}
        <motion.div
          initial={{ opacity: 0, y: -120, x: 900 }}
          animate={{ opacity: 1, y: -70, x: 40 }}
          transition={{
            duration: 1,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="absolute -top-[15px] -right-[36px]"
        >
          <Image
            src="/images/right-dashboard.svg"
            alt="Right Overlay"
            width={197}
            height={200}
            className="
             object-contain
            hidden sm:block
            "
          />
        </motion.div>

        {/* ================= LEFT OVERLAY (Left → Right) ================= */}
        <motion.div
          initial={{ opacity: 0, x: -900 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="absolute   -left-[81px] top-[31%] -translate-y-1/2"
        >
          <Image
            src="/images/left-dashboard.svg"
            alt="Left Overlay"
            width={250}
            height={126}
            className="object-contain hidden sm:block sm:w-[250px] w-[200px]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
