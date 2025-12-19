"use client";
import { motion } from "framer-motion";
import { BoltIcon } from "@heroicons/react/24/outline";
import CardIconTooltip from "./CardIconTooltip";

export default function MentalBatteryCard({
  percentage = 45,
  level = "Medium",
  message,
  drainFactors,
  rechargeFactors,
  hasNoTrades = false,
}) {
  const batteryLevel = Math.min(100, Math.max(0, percentage));
  const filledSquares = Math.floor((batteryLevel / 100) * 5);

  if (hasNoTrades) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col overflow-visible"
        style={{
          boxShadow:
            "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <CardIconTooltip
            title="Energy Usage"
            tooltipText="Estimates your current mental energy based on recent screen time, trading intensity, emotional spikes, and cognitive load. Helps you understand when you're operating at your sharpest, or when fatigue may be influencing decisions."
            position="bottom"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-gray-400" />
            </div>
          </CardIconTooltip>
          <h3 className="text-lg font-semibold text-gray-500">Mental Battery</h3>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-4xl font-bold text-gray-300 mb-3">100%</div>

            {/* Battery indicator squares - all grayed out */}
            <div className="flex gap-2 mb-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="w-12 h-12 rounded bg-gray-200 opacity-50"
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-auto">
            Start trading to track your mental energy levels
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col"
      style={{
        boxShadow:
          "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <CardIconTooltip
          title="Energy Usage"
          tooltipText="Estimates your current mental energy based on recent screen time, trading intensity, emotional spikes, and cognitive load. Helps you understand when you're operating at your sharpest, or when fatigue may be influencing decisions."
          position="bottom"
        >
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
            <BoltIcon className="w-5 h-5 text-teal-600" />
          </div>
        </CardIconTooltip>
        <h3 className="text-lg font-semibold text-primary">Mental Battery</h3>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-4xl font-bold text-primary mb-3">
            {batteryLevel}%
          </div>

          {/* Battery indicator squares */}
          <div className="flex gap-2 mb-2">
            {[0, 1, 2, 3, 4].map((index) => {
              const isFilled = index < filledSquares;
              // Green gradient colors from light to strong (left to right)
              const greenColors = [
                "#a7f3d0", // Very light green
                "#6EE7B7", // Light green
                "#6ee7b7", // Medium green
                "#34d399", // Medium-strong green
                "#10b981", // Strong emerald green
              ];

              return (
                <div
                  key={index}
                  className="w-12 h-12 rounded"
                  style={{
                    backgroundColor: isFilled ? greenColors[index] : "#e5e7eb",
                  }}
                />
              );
            })}
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-auto">
          {message || `Current mental energy level: ${level}`}
        </p>
      </div>
    </motion.div>
  );
}
