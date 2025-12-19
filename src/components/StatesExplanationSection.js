"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "./Container";
import GradientHeading from "./GradientHeading.js";
import DescriptionText from "./DescriptionText.js";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// Cycle through states for animation
const STATE_CYCLE = ["stable", "overextended", "hesitant", "aggressive"];

gsap.registerPlugin(ScrollTrigger);

export default function StatesExplanationSection() {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const imageRef = useRef(null);
  const cardRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStateIndex((prev) => (prev + 1) % STATE_CYCLE.length);
    }, 6000); // Change state every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStateClick = (clickedIndex) => {
    setCurrentStateIndex(clickedIndex);
  };

  useEffect(() => {
    if (!imageRef.current || !cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        {
          y: "5%",
          scaleX: 2,
          scaleY: 1.5,
        },
        {
          y: "60%",
          scaleX: 1.1,
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            end: "top 20%",
            scrub: true,

            // 👇 When scrolling DOWN → hide overflow
            onUpdate: (self) => {
              if (self.progress > 0.85) {
                cardRef.current.classList.remove("overflow-visible");
                cardRef.current.classList.add("overflow-hidden");
              } else {
                cardRef.current.classList.remove("overflow-hidden");
                cardRef.current.classList.add("overflow-visible");
              }
            },

            // 👇 When scrolling UP → show overflow again
            onLeaveBack: () => {
              cardRef.current.classList.remove("overflow-hidden");
              cardRef.current.classList.add("overflow-visible");
            },
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="states-explanation"
      className="min-h-screen px-6 md:px-[100px] py-[100px]  relative scroll-mt-12 overflow-hidden"
      style={{
        borderRadius: "0 0 64px 64px",
        background:
          "linear-gradient(180deg, #FFF 0%, rgba(255, 255, 253, 0.15) 45%, rgba(255, 255, 215, 0.25) 50%, rgba(255, 255, 164, 0.35) 55%, rgba(255, 255, 113, 0.45) 70%, rgba(255, 229, 74, 0.55) 85%, rgba(249, 115, 22, 0.65) 100%)",
      }}
    >
      <Container maxWidth="4xl" className="relative z-10" padding={false}>
        {/* Header Section */}
        <div className="mb-16 md:mb-20">
          <GradientHeading>
            How zentra
            <br />
            thinks.
          </GradientHeading>

          <div className="mt-8 max-w-2xl">
            <DescriptionText delay={0.2}>
              Zentra interprets your trading data to reveal your psychological
              state in real time. Each state represents a different cognitive
              and emotional condition that affects your decision making.
              Zentra's goal is to help you identify when to engage and when to
              protect your clarity and capital.
            </DescriptionText>
          </div>
        </div>

        {/* State Display (Animation Stopped) */}
        <div
          ref={cardRef}
          className="grid grid-cols-1 gap-8 md:gap-12 items-center mb-6 overflow-hidden rounded-[46px]"
        >
          {/* Card */}
          <div className="flex justify-center">
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full h-full min-w-[896px] min-h-[386px]">
              {/* Top Icon */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                <div className=" rounded-full  flex items-center justify-center shadow-md">
                  <img
                    src="/images/brain.svg"
                    alt="brain"
                    height={40}
                    width={40}
                  />
                </div>
              </div>

              {/* Top Title */}
              <div className="pt-[75px] text-center z-10 relative">
                <h3 className="text-[40px] leading-[52px] font-semibold">
                  <span
                    style={{
                      background:
                        "linear-gradient(99deg, #000080 6.92%, #00BFA6 50%, #F0E8D0 93.08%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                    className="text-[40px] leading-[52px] font-semibold"
                  >
                    Psychology, made measurable
                  </span>
                </h3>
              </div>

              {/* Image Area */}
              <div className="absolute bottom-0 z-20 w-full flex justify-center rounded-2xl">
                <Image
                  ref={imageRef}
                  width={735}
                  height={404}
                  src="/images/tablet-heroSection4.png"
                  alt="Dashboard Preview"
                  className="w-[90%] translate-y-[61%] rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* All Trading States – New Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT MAIN CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full h-[620px] shadow-[0_0_40px_0_rgba(0,0,0,0.12)] rounded-[32px] bg-[#00001F] p-6"
          >
            <div className="space-y-2">
              <h1 className="text-[24px] text-white leading-6 font-bold">
                Trading States
              </h1>
              <p className="text-[#FFFFFFCC] text-[14px] font-normal leading-4">
                Your mindset informs the recommendations you receive.
              </p>
            </div>
            <div className="w-full mt-6 space-y-3 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 300 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="px-5 py-6 bg-[#FFFFFF3D] rounded-[24px] space-y-6">
                  <h1 className="text-white text-[20px] font-bold leading-6">
                    🧠 Psychological Stability Curve
                  </h1>
                  <div className="flex items-center gap-1">
                    <p className="text-[14px] text-white font-normal leading-5">
                      Track your psychological stability over time to spot
                      emotional risk and know when your mindset supports
                      decisions.
                    </p>
                    <Image
                      src="/images/trading1.png"
                      width={163}
                      height={126}
                      alt="trading1"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 300 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  delay: 0.3,
                }}
              >
                <div className="px-5 py-6 bg-[#FFFFFF3D] rounded-[24px] space-y-6">
                  <h1 className="text-white text-[20px] font-bold leading-6">
                    🧭 Behaviour Heatmap
                  </h1>
                  <div className="flex items-center gap-1">
                    <p className="text-[14px] text-white font-normal leading-5">
                      Visualize behavioral intensity across days and time blocks
                      to identify high-risk periods and trade with greater
                      control.
                    </p>
                    <Image
                      src="/images/trading2.png"
                      width={163}
                      height={126}
                      alt="trading1"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="bg-[#16C9B5] blur-[150px] w-[348px] h-[348px] absolute bottom-10 z-0 left-10 rounded-full"></div>
          </motion.div>

          {/* RIGHT MAIN CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }} // <-- added duration
            className="relative w-full h-[620px] shadow-[0_0_40px_0_rgba(0,0,0,0.12)] rounded-[32px] bg-[#00001F] px-6 pt-6"
          >
            <div className="flex flex-col items-center justify-between h-full overflow-hidden">
              <h1 className="text-[32px] text-white leading-10 font-semibold flex text-center">
                Clarity when it matters the most
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 400 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Image
                  src="/images/Wallpaper.png"
                  className="relative z-10"
                  width={600}
                  height={670}
                  alt="Wallpaper"
                />
                <div className="bg-[#16C9B5] blur-[150px] w-[348px] h-[348px] absolute bottom-10 z-0 left-10 rounded-full"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
