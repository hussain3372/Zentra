"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import CardIconTooltip from "./CardIconTooltip";

export default function QuoteOfTheDay({
  quote = "Every trade is just another trade.",
  author = "Mark Minervini",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-visible h-full flex flex-col"
      style={{
        boxShadow:
          "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <div className="absolute inset-0 scale-[2] origin-left">
          <Image
            src="/quote.png"
            alt=""
            fill
            className="object-cover object-left"
          />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <CardIconTooltip
            title="Quote of the Day"
            tooltipText="Daily inspiration to help maintain perspective and mental clarity in your trading journey."
            variant="dark"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-white" />
            </div>
          </CardIconTooltip>
          <h3 className="text-base font-semibold text-white">
            Quote of the Day
          </h3>
        </div>

        <div className="space-y-2 flex-1 flex flex-col justify-between">
          <p className="text-white text-base leading-relaxed font-medium">
            "{quote}"
          </p>
          <p className="text-white/80 text-xs">— {author}</p>
        </div>
      </div>
    </motion.div>
  );
}
