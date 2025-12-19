"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import CardIconTooltip from "./CardIconTooltip";
import BehaviourHeatmapDatePicker from "./BehaviourHeatmapDatePicker";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Su"];

// Helper to format day label
function dayLabel(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-GB", { weekday: "short" }); // Mon, Tue, ...
}

// Helper to get start of week (Monday)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Convert Sunday (0) to 7, then subtract to get Monday
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.setDate(diff));
};

// Helper to check if two dates are the same day
const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Transform API data to chart format with fixed Mon-Sun range
function toChartData(apiData, selectedRefDate = new Date()) {
  console.log('🔄 [PsychStability] toChartData called with:', { apiData, selectedRefDate });
  
  // 1. Generate skeleton for Mon-Sun of the selected week
  const startOfWeek = getStartOfWeek(selectedRefDate);
  // Set to noon to avoid daylight saving issues when adding days
  startOfWeek.setHours(12, 0, 0, 0);
  
  const widthData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    widthData.push({
      day: DAYS[i], // Mon, Tue, ...
      date: d.toISOString(),
      score: null, // Default to null (connectNulls will handle gaps)
      originalDate: d
    });
  }

  const history = apiData || [];
  
  // Handle both array of objects and array of numbers
  if (!Array.isArray(history)) {
    console.log('❌ [PsychStability] Data is not an array:', typeof history);
    return widthData;
  }
  
  // If it's an array of objects with date and score
  if (history.length > 0 && typeof history[0] === 'object' && history[0]?.date) {
    console.log('📊 [PsychStability] Merging object array into weekly skeleton');
    
    history.forEach(item => {
      const itemDate = new Date(item.date);
      // Find matching day in our skeleton
      const dayIndex = widthData.findIndex(w => isSameDay(w.originalDate, itemDate));
      if (dayIndex !== -1) {
        widthData[dayIndex].score = item.score;
        // Update precise date from API if needed, though skeleton date is fine
        widthData[dayIndex].date = item.date;
      }
    });

    console.log('📈 [PsychStability] Final Chart data:', widthData);
    return widthData;
  }
  
  // Legacy: array of numbers - map to days assuming current week or provided order
  // For legacy number arrays, we just map them to the skeleton in order
  if (history.length > 0 && typeof history[0] === 'number') {
    console.log('📊 [PsychStability] Processing number array format');
    return widthData.map((item, index) => ({
      ...item,
      score: history[index] !== undefined ? history[index] : null
    }));
  }
  
  return widthData;
}

// Helper to check if a date is today
const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Helper to get start and end of day in ISO format
const getDayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

export default function PsychologicalStabilityTrend({ 
  data = null, 
  hasNoTrades = false,
  fetchHistory = null,
  refetch = null 
}) {
  console.log('🎨 [PsychStability] Component rendered with props:', { 
    data, 
    hasNoTrades, 
    hasFetchHistory: !!fetchHistory, 
    hasRefetch: !!refetch 
  });
  
  const [stabilityData, setStabilityData] = useState(data || []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Update stability data when data prop changes
  useEffect(() => {
    console.log('🔄 [PsychStability] Data prop changed:', data);
    if (data) {
      console.log('✅ [PsychStability] Setting stability data to:', data);
      setStabilityData(data);
    }
  }, [data]);

  // Helper to get week range
  const getWeekRange = (date) => {
    const startOfWeek = getStartOfWeek(date);
    const start = new Date(startOfWeek);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(startOfWeek);
    end.setDate(end.getDate() + 6); // Add 6 days to get Sunday
    end.setHours(23, 59, 59, 999);
    
    return { start: start.toISOString(), end: end.toISOString() };
  };

  // Handle date change - fetch historical data if needed
  const handleDateChange = async (date) => {
    console.log('📅 [PsychStability] Date changed to:', date);
    setSelectedDate(date);
    
    // Check if the selected date's week includes today
    const startOfSelectedWeek = getStartOfWeek(date);
    const startOfCurrentWeek = getStartOfWeek(new Date());
    const isCurrentWeek = isSameDay(startOfSelectedWeek, startOfCurrentWeek);
    
    // If it's the current week, refetch current data
    if (isCurrentWeek) {
      if (refetch) {
        setIsLoadingHistory(true);
        try {
          await refetch();
        } catch (error) {
          console.error("Error refetching current stability data:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
      return;
    }

    // If date is in a past week and fetchHistory is available, fetch historical data
    if (fetchHistory) { // Simplified check, fetch for any week if fetchHistory exists
      setIsLoadingHistory(true);
      try {
        const { start, end } = getWeekRange(date);
        const result = await fetchHistory(start, end);
        
        // Transform the result to object array format for local state
        if (result?.scores && Array.isArray(result.scores)) {
          setStabilityData(result.scores.map(entry => ({
            date: entry.date,
            score: entry.score || entry.value || 0
          })));
        } else if (result?.data && Array.isArray(result.data)) {
          setStabilityData(result.data.map(entry => ({
            date: entry.date,
            score: entry.score || entry.value || 0
          })));
        } else if (result?.history && Array.isArray(result.history)) {
          setStabilityData(result.history.map(entry => ({
            date: entry.date,
            score: entry.score || entry.value || 0
          })));
        } else if (Array.isArray(result)) {
          setStabilityData(result);
        }
      } catch (error) {
        console.error("Error fetching historical stability data:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  const chartData = toChartData(stabilityData, selectedDate);
  const isEmptyWeek = chartData.every(d => d.score === null);
  
  console.log('📊 [PsychStability] Final chartData for rendering:', chartData);
  console.log('📊 [PsychStability] hasNoTrades:', hasNoTrades);

  if (hasNoTrades) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col"
        style={{
          boxShadow: "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CardIconTooltip
            title="Psychological Stability Trend"
            tooltipText="Tracks fluctuations in your emotional stability by analysing trade outcomes, behaviour patterns, and how you respond to winners and losers. Reveals when you're mentally balanced versus when stress, impatience, or overconfidence may be building."
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
            </div>
          </CardIconTooltip>
          <h3 className="text-lg font-semibold text-gray-500">
            Psychological Stability Trend
          </h3>
        </div>
        <button className="text-sm text-gray-400 px-3 py-1 rounded-md cursor-not-allowed">
          Date
        </button>
      </div>

        <div className="relative flex-1 flex items-center justify-center min-h-[240px]">
          {/* Background grid mimicking the chart area */}
          <div className="absolute inset-0 opacity-30">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={DAYS.map(d => ({ day: d, score: 0 }))}>
                   <CartesianGrid vertical={false} strokeDasharray="3 3" />
                   <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                   <YAxis domain={[0, 100]} hide />
               </AreaChart>
             </ResponsiveContainer>
          </div>
          
          <div className="relative z-10 text-center">
            <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 px-4">
              Trading data will appear here after your first trades
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col"
      style={{
        boxShadow: "0 0 20px rgba(0, 191, 166, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <CardIconTooltip
            title="Psychological Stability Trend"
            tooltipText="Tracks fluctuations in your emotional stability by analysing trade outcomes, behaviour patterns, and how you respond to winners and losers. Reveals when you're mentally balanced versus when stress, impatience, or overconfidence may be building."
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-teal-600" />
            </div>
          </CardIconTooltip>
          <h3 className="text-lg font-semibold text-primary">
            Psychological Stability Trend
          </h3>
        </div>
        {!hasNoTrades && (
          <BehaviourHeatmapDatePicker
            selectedDate={selectedDate}
            viewMode="weekly"
            hideViewModeToggle={true}
            onDateChange={handleDateChange}
            onViewModeChange={() => {}}
          />
        )}
      </div>

      <div className={`flex flex-row flex-1 ${isLoadingHistory ? "opacity-50" : ""} min-h-[240px]`}>
        {/* Custom HTML Y-Axis Labels for guaranteed visibility */}
        <div className="flex flex-col justify-between text-xs text-gray-400 pr-2 py-[10px] w-[30px] text-right select-none font-medium h-full">
          <span>100</span>
          <span>80</span>
          <span>60</span>
          <span>40</span>
          <span>20</span>
          <span>0</span>
        </div>

        <div className="flex-1 relative">
          
          {/* Empty Week State Overlay */}
          {isEmptyWeek && !isLoadingHistory && (
             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                  <ChartBarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No stability data for this week</p>
                </div>
             </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 6" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              {/* Hide labels but keep axis for grid alignment */}
              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                hide={true} 
              />
              <Tooltip
                cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }}
                wrapperStyle={{ outline: 'none', zIndex: 1000 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg z-50 min-w-[120px]">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {data.date ? new Date(data.date).toLocaleDateString("en-GB") : data.day}
                        </p>
                        <p className="text-sm text-gray-500">
                          Score: <span className="text-sm font-normal text-emerald-600">{data.score ?? '-'}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#colorScore)"
                dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                connectNulls={true}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
