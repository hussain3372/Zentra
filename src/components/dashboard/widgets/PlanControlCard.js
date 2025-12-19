"use client";
import { motion } from "framer-motion";
import { EyeIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import CardIconTooltip from "./CardIconTooltip";

export default function PlanControlCard({
  percentage = 78,
  tradesOutsidePlan = 2,
  message,
  hasNoTrades = false,
  tradeScores = [],
  tradesAnalyzed = 0,
}) {
  if (hasNoTrades) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col relative"
        style={{
          boxShadow:
            "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <CardIconTooltip
            title="Plan Control"
            tooltipText="Shows how reliably you follow your trading plan by analysing your entries, exits, risk limits, and adherence to your pre-defined rules. Higher scores indicate disciplined execution with fewer emotional or impulsive deviations."
            position="bottom"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <EyeIcon className="w-5 h-5 text-gray-400" />
            </div>
          </CardIconTooltip>
          <h3 className="text-lg font-semibold text-gray-500">Plan Control</h3>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="relative">
            <div className="text-4xl font-bold text-gray-300 mb-3">—</div>
            <div className="absolute top-0 right-0 opacity-20">
              <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-auto">
            Complete trades to see your plan compliance score
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col overflow-visible"
      style={{
        boxShadow:
          "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <CardIconTooltip
          title="Plan Control"
          tooltipText="Shows how reliably you follow your trading plan by analysing your entries, exits, risk limits, and adherence to your pre-defined rules. Higher scores indicate disciplined execution with fewer emotional or impulsive deviations."
          position="bottom"
        >
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
            <EyeIcon className="w-5 h-5 text-teal-600" />
          </div>
        </CardIconTooltip>
        <h3 className="text-lg font-semibold text-primary">Plan Control</h3>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="text-4xl font-bold text-primary mb-3">
          {percentage}%
        </div>

        {message && (
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            {message}
          </p>
        )}

        {!message && (
          <p className="text-sm text-gray-600 mt-auto">
            {`You have taken ${tradesOutsidePlan} ${
              tradesOutsidePlan === 1 ? "trade" : "trades"
            } this week outside of your trading plan.`}
          </p>
        )}
      </div>
    </motion.div>
  );
}
