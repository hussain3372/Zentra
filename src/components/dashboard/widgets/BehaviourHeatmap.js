"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import BehaviourHeatmapDatePicker from "./BehaviourHeatmapDatePicker";
import CardIconTooltip from "./CardIconTooltip";

// Teal-based tile theme for heatmap
// Backend returns: "green" (disciplined 70+), "yellow" (mixed 40-69), "red" (emotional <40), "grey" (no trades)
const TILE_THEME = {
  grey: {
    bg: "rgba(0, 0, 0, 0.05)",
    border: "rgba(0, 0, 0, 0.10)",
  },
  red: {
    bg: "rgba(0, 191, 166, 0.30)",
    border: "rgba(0, 191, 166, 0.20)",
  },
  yellow: {
    bg: "rgba(0, 191, 166, 0.60)",
    border: "rgba(0, 191, 166, 0.20)",
  },
  green: {
    bg: "rgba(0, 191, 166, 0.90)",
    border: "rgba(0, 191, 166, 0.20)",
  },
};

// Get tile style for window - returns style object
const getTileStyle = (window) => {
  if (!window || window.score === null || window.score === undefined) {
    return TILE_THEME.grey;
  }

  switch (window.color) {
    case 'green':
      return TILE_THEME.green;
    case 'yellow':
      return TILE_THEME.yellow;
    case 'red':
      return TILE_THEME.red;
    case 'grey':
    default:
      return TILE_THEME.grey;
  }
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Helper to check if a date is today
const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Helper to get start and end of day in ISO format matching API format: 2025-12-12T00:00:00Z
const getDayRange = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const start = `${year}-${month}-${day}T00:00:00Z`;
  const end = `${year}-${month}-${day}T23:59:59Z`;

  return { start, end };
};

// Helper to get date key for caching (YYYY-MM-DD format)
const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to process windows data
const processWindows = (windowsData) => {
  if (!windowsData || !Array.isArray(windowsData)) return null;

  const processedWindows = windowsData.map((window) => {
    if (window.startHour !== undefined && window.endHour !== undefined) {
      return window;
    }
    const [startHourStr, endHourStr] = window.id.split("-");
    const startHour = parseInt(startHourStr, 10);
    const endHour = parseInt(endHourStr, 10);
    return {
      ...window,
      startHour,
      endHour,
    };
  });

  return processedWindows.sort((a, b) => a.startHour - b.startHour);
};

const HeatmapTile = ({
  window,
  tileStyle,
  isCurrentTimeBlock,
  hasNoTrades,
  isLoadingHistory,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`w-9 h-8 rounded-md cursor-pointer transition-all hover:opacity-80
          ${hasNoTrades ? "opacity-30" : ""}
          ${isLoadingHistory ? "opacity-50" : ""}
        `}
        style={{
          backgroundColor: tileStyle.bg,
          border: `1px solid ${tileStyle.border}`,
          boxShadow: isCurrentTimeBlock
            ? "0 0 0 2px rgba(0, 191, 166, 0.3), 0 0 8px rgba(0, 191, 166, 0.4)"
            : "none",
        }}
      />
      <AnimatePresence>
        {isHovered && window?.message && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100] pointer-events-none whitespace-normal min-w-[200px]"
          >
            <div className="bg-[#1A1A1A] bg-gradient-to-br from-[#262626] to-[#1A1A1A] border border-white/10 rounded-xl p-3 shadow-2xl">
              <div className="text-white text-sm font-semibold mb-1">
                Score: {window.score}
              </div>
              <div className="text-gray-300 text-xs leading-relaxed">
                {window.message}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function BehaviourHeatmap({
  hasNoTrades = false,
  fetchHistory = null,
}) {
  const [windows, setWindows] = useState([]);
  const [totalTrades, setTotalTrades] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [cachedData, setCachedData] = useState(new Map()); // Cache for historical data by date
  const [weeklyData, setWeeklyData] = useState(new Map()); // Cache for weekly view: dateKey -> windows

  // Fetch data for a single date using history endpoint
  const fetchDateData = async (date, skipCache = false) => {
    const dateKey = getDateKey(date);

    // Check cache first (unless skipCache is true for today's data refresh)
    if (!skipCache && cachedData.has(dateKey)) {
      const cached = cachedData.get(dateKey);
      if (cached && cached.windows) {
        const processedWindows = processWindows(cached.windows);
        return {
          windows: processedWindows,
          totalTrades: cached.totalTrades || 0,
        };
      }
    }

    // Fetch from history endpoint
    if (fetchHistory) {
      try {
        const { start, end } = getDayRange(date);
        const result = await fetchHistory(start, end);

        if (result) {
          // Find the history item that matches the requested date
          let historyData = null;
          if (result.history && Array.isArray(result.history)) {
            // Match by date - API returns dates like "2025-12-15T00:00:00.000Z"
            historyData = result.history.find((item) => {
              if (!item.date) return false;
              const itemDate = new Date(item.date);
              return (
                itemDate.getFullYear() === date.getFullYear() &&
                itemDate.getMonth() === date.getMonth() &&
                itemDate.getDate() === date.getDate()
              );
            });
          }
          // Fallback to result itself if no history array
          if (!historyData && result.windows) {
            historyData = result;
          }

          if (historyData) {
            const newCache = new Map(cachedData);
            newCache.set(dateKey, historyData);
            setCachedData(newCache);

            if (historyData.windows) {
              const processedWindows = processWindows(historyData.windows);
              return {
                windows: processedWindows,
                totalTrades: historyData.totalTrades || 0,
              };
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching data for ${dateKey}:`, error);
      }
    }

    // Return empty windows if no data
    return {
      windows: null,
      totalTrades: 0,
    };
  };

  // Get start of week for selected date (Monday)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    // Convert Sunday (0) to 7, then subtract 1 to get days to subtract
    const diff = d.getDate() - ((day + 6) % 7);
    return new Date(d.setDate(diff));
  };

  // Get week dates
  const getWeekDates = (startDate) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Fetch data for entire week
  const fetchWeekData = async (weekStartDate, forceRefresh = false) => {
    setIsLoadingHistory(true);
    try {
      const weekDates = getWeekDates(weekStartDate);
      const weekDataMap = new Map();

      // Fetch data for each day in the week
      await Promise.all(
        weekDates.map(async (date) => {
          const dateKey = getDateKey(date);
          // Skip cache for today if forceRefresh is true
          const skipCache = forceRefresh && isToday(date);
          const dateData = await fetchDateData(date, skipCache);
          if (dateData.windows) {
            weekDataMap.set(dateKey, dateData.windows);
          } else {
            // Set null to indicate no data for this date
            weekDataMap.set(dateKey, null);
          }
        })
      );

      setWeeklyData(weekDataMap);
    } catch (error) {
      console.error("Error fetching weekly heatmap data:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle date change - fetch historical data if needed
  const handleDateChange = async (date) => {
    setSelectedDate(date);

    // Fetch data for the entire week
    const weekStart = getStartOfWeek(date);
    // Force refresh if navigating to current week (to get fresh today's data)
    const forceRefresh = isToday(date) || getWeekDates(weekStart).some(d => isToday(d));
    await fetchWeekData(weekStart, forceRefresh);

    // Also update windows for the selected date (for internal state)
    const dateData = await fetchDateData(date, isToday(date));
    if (dateData.windows) {
      setWindows(dateData.windows);
      setTotalTrades(dateData.totalTrades);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      const weekStart = getStartOfWeek(selectedDate);
      await fetchWeekData(weekStart, true); // Force refresh on mount
    };

    if (fetchHistory) {
      loadData();
    }
  }, []);

  // Generate TIME_SLOTS dynamically from windows, or use standard 3-hour blocks
  const TIME_SLOTS =
    windows.length > 0
      ? windows.map((window) => {
          const startHour = window.startHour.toString().padStart(2, "0");
          const endHour =
            window.endHour === 24
              ? "00"
              : window.endHour.toString().padStart(2, "0");
          return `${startHour}:00-${endHour}:00`;
        })
      : [
          "00:00-03:00",
          "03:00-06:00",
          "06:00-09:00",
          "09:00-12:00",
          "12:00-15:00",
          "15:00-18:00",
          "18:00-21:00",
          "21:00-00:00",
        ];

  const displayWindows = hasNoTrades ? [] : windows;

  // Get heatmap value for a specific time slot and day (for weekly view)
  const getHeatmapValue = (timeSlot, date) => {
    const dateKey = getDateKey(date);
    const dayWindows = weeklyData.get(dateKey);
    if (!dayWindows) {
      return null; // No data for this date
    }

    const window = dayWindows.find((w) => {
      const startHour = w.startHour.toString().padStart(2, "0");
      const endHour =
        w.endHour === 24 ? "00" : w.endHour.toString().padStart(2, "0");
      const windowTimeSlot = `${startHour}:00-${endHour}:00`;
      return windowTimeSlot === timeSlot;
    });

    // Return the window object if it has trades, otherwise null
    if (
      window &&
      window.tradeCount > 0 &&
      window.score !== null &&
      window.score > 0
    ) {
      return window; // Return entire window object
    }
    return null; // No trades in this time slot
  };

  // Get current time block (e.g., "09:00-12:00")
  const getCurrentTimeBlock = () => {
    const now = new Date();
    const currentHour = now.getHours();
    // Find which 3-hour block the current hour falls into
    const blockStart = Math.floor(currentHour / 3) * 3;
    const blockEnd = blockStart + 3 === 24 ? 0 : blockStart + 3;
    const startStr = blockStart.toString().padStart(2, "0");
    const endStr = blockEnd === 0 ? "00" : blockEnd.toString().padStart(2, "0");
    return `${startStr}:00-${endStr}:00`;
  };

  const weekStart = getStartOfWeek(selectedDate);
  const weekDates = getWeekDates(weekStart);
  const currentTimeBlock = getCurrentTimeBlock();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 h-full flex flex-col"
      style={{
        boxShadow:
          "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CardIconTooltip
            title="Behaviour Heatmap"
            tooltipText="Maps your trading behaviour across days and time blocks, highlighting periods of high activity, hesitation, overtrading, or emotional triggers. Useful for spotting when you're most likely to excel or fall into patterns."
            position="bottom"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                hasNoTrades ? "bg-gray-100" : "bg-teal-50"
              }`}
            >
              <Squares2X2Icon
                className={`w-5 h-5 ${
                  hasNoTrades ? "text-gray-400" : "text-teal-600"
                }`}
              />
            </div>
          </CardIconTooltip>
          <h3
            className={`text-lg font-semibold ${
              hasNoTrades ? "text-gray-500" : "text-primary"
            }`}
          >
            Behaviour Heatmap
          </h3>
        </div>
        {!hasNoTrades && (
          <BehaviourHeatmapDatePicker
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
          {/* Weekly Grid View */}
          <div className="w-full flex-1 flex flex-col overflow-x-auto overflow-y-hidden custom-scrollbar pb-2">
            {/* Header row with days - 3 letter */}
            <div className="flex mb-2 min-w-fit">
              <div className="w-16 sm:w-20 flex-shrink-0 mr-1 sm:mr-8"></div>
              <div className="flex gap-1 sm:gap-1 flex-1">
                {weekDates.map((date, index) => {
                  const isSelected =
                    date.toDateString() === selectedDate.toDateString();
                  return (
                    <div
                      key={index}
                      className={`w-9 flex-shrink-0 text-center text-xs sm:text-xs py-1 text-gray-400`}
                      title={`${DAYS[index]} ${date.getDate()}/${
                        date.getMonth() + 1
                      }`}
                    >
                      {DAYS[index]}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time slots with heatmap cells */}
            <div className="flex-1 flex flex-col justify-between gap-1 sm:gap-1 min-w-fit">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="flex items-center gap-1 sm:gap-8 h-full min-w-fit">
                  <div
                    className={`w-16 sm:w-20 flex-shrink-0 text-xs sm:text-xs text-gray-400`}
                  >
                    {time}
                  </div>
                  <div className="flex gap-1 sm:gap-1 flex-1 h-full">
                    {weekDates.map((date, dayIndex) => {
                      const window = getHeatmapValue(time, date);
                      const isTodayDate =
                        date.toDateString() === new Date().toDateString();
                      const isCurrentTimeBlock =
                        isTodayDate && time === currentTimeBlock;
                      const cellKey = `${dayIndex}-${time}`;
                      const tileStyle = getTileStyle(window);
                      
                      return (
                        <HeatmapTile
                          key={cellKey}
                          window={window}
                          tileStyle={tileStyle}
                          isCurrentTimeBlock={isCurrentTimeBlock}
                          hasNoTrades={hasNoTrades}
                          isLoadingHistory={isLoadingHistory}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>


      {hasNoTrades && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Your trading patterns will appear here
        </p>
      )}
    </motion.div>
  );
}
