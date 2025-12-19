"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChartPieIcon } from "@heroicons/react/24/outline";
import CardIconTooltip from "./CardIconTooltip";

const CATEGORIES = [
  "Impulsiveness",
  "Aggression",
  "Hesitation",
  "Discipline",
  "Consistency",
];

// Mock data - in production, this would come from props/API
const generateMockData = () => {
  return {
    Impulsiveness: 75,
    Aggression: 80,
    Hesitation: 30,
    Discipline: 45,
    Consistency: 60,
  };
};

export default function PsychologicalStateDistribution({ data = null, hasNoTrades = false }) {
  const [distributionData] = useState(data || generateMockData());
  const size = 280;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const numCategories = CATEGORIES.length;
  const angleStep = (2 * Math.PI) / numCategories;

  // Generate empty data (all zeros) for empty state
  const generateEmptyData = () => {
    return {
      Impulsiveness: 0,
      Aggression: 0,
      Hesitation: 0,
      Discipline: 0,
      Consistency: 0,
    };
  };

  const displayData = hasNoTrades ? generateEmptyData() : distributionData;

  // Calculate points for each category
  const points = CATEGORIES.map((category, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const value = displayData[category] || 0;
    const normalizedValue = value / 100; // Normalize to 0-1
    const pointRadius = radius * normalizedValue;
    const x = centerX + Math.cos(angle) * pointRadius;
    const y = centerY + Math.sin(angle) * pointRadius;
    const labelX = centerX + Math.cos(angle) * (radius + 20);
    const labelY = centerY + Math.sin(angle) * (radius + 20);

    return {
      category,
      value,
      x,
      y,
      labelX,
      labelY,
      angle,
    };
  });

  // Create path for the polygon - if no trades, all points are at center
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ") + " Z";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col"
      style={{
        boxShadow: "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <CardIconTooltip
          title="Psychological State Distribution"
          tooltipText="Breaks down your real-time psychological profile across traits like discipline, impulsiveness, confidence, focus, and emotional volatility. Gives a clear snapshot of which tendencies are currently driving your decisions."
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            hasNoTrades ? "bg-gray-100" : "bg-teal-50"
          }`}>
            <ChartPieIcon className={`w-5 h-5 ${
              hasNoTrades ? "text-gray-400" : "text-teal-600"
            }`} />
          </div>
        </CardIconTooltip>
        <h3 className={`text-lg font-semibold ${hasNoTrades ? 'text-gray-500' : 'text-primary'}`}>
          Psychological State Distribution
        </h3>
      </div>

      <div className="flex items-center justify-center flex-1 relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={`overflow-visible ${hasNoTrades ? 'opacity-30' : ''}`}
        >
          {/* Grid lines */}
          {CATEGORIES.map((_, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x1 = centerX;
            const y1 = centerY;
            const x2 = centerX + Math.cos(angle) * radius;
            const y2 = centerY + Math.sin(angle) * radius;
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Concentric circles */}
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <circle
              key={scale}
              cx={centerX}
              cy={centerY}
              r={radius * scale}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Polygon fill - only show if has trades */}
          {!hasNoTrades && (
            <path
              d={pathData}
              fill="#00bfa6"
              fillOpacity="0.3"
              stroke="#00bfa6"
              strokeWidth="2"
            />
          )}

          {/* Data points - only show if has trades */}
          {!hasNoTrades && points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#00bfa6"
            />
          ))}

          {/* Labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              className={`text-xs ${hasNoTrades ? 'fill-gray-400' : 'fill-gray-600'}`}
              fontSize="10"
              dominantBaseline="middle"
            >
              {point.category}
            </text>
          ))}
        </svg>

        {hasNoTrades && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 px-4">
                Complete trades to see your psychological profile
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

