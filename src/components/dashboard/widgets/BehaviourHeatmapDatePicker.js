"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Helper to format date
const formatDate = (date) => {
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
};

// Helper to get start of week (Monday)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Convert Sunday (0) to 7, then subtract 1 to get days to subtract
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.setDate(diff));
};

// Helper to get week dates
const getWeekDates = (startDate) => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Helper to get day name from date
const getDayName = (date) => {
  return date.toLocaleDateString("en-US", { weekday: "short" });
};

// Helper to get days in month (week starts on Monday)
const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Convert Sunday (0) to 7, then subtract 1 to get offset for Monday start
  const startingDayOfWeek = firstDay.getDay();
  const mondayOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
  
  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < mondayOffset; i++) {
    days.push(null);
  }
  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

export default function BehaviourHeatmapDatePicker({ 
  onDateChange,
  selectedDate = new Date(),
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [monthView, setMonthView] = useState(new Date(selectedDate));
  const pickerRef = useRef(null);

  // Sync with props
  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
    setMonthView(new Date(selectedDate));
  }, [selectedDate]);



  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Navigate months
  const navigateMonth = (direction) => {
    const newMonth = new Date(monthView);
    newMonth.setMonth(monthView.getMonth() + direction);
    setMonthView(newMonth);
  };

  // Select date
  const handleDateSelect = (date) => {
    if (!date) return;
    setCurrentDate(date);
    setMonthView(date);
    if (onDateChange) {
      onDateChange(date);
    }
    setIsOpen(false);
  };



  const daysInMonth = getDaysInMonth(monthView);
  const weekDates = getWeekDates(getStartOfWeek(currentDate));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="relative" ref={pickerRef}>
      {/* Date Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 hover:text-teal-800 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 border border-teal-100 shadow-sm"
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="text-xs">{formatDate(currentDate)}</span>
      </button>

      {/* Date Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4 w-80"
            style={{
              boxShadow: "0 0 20px rgba(0, 191, 166, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700">Select Date & View</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close date picker"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>




            {/* Calendar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 rounded-md hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <div className="text-sm font-semibold text-gray-700">
                  {monthNames[monthView.getMonth()]} {monthView.getFullYear()}
                </div>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 rounded-md hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-400 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square" />;
                  }
                  const isSelected = date.toDateString() === currentDate.toDateString();
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`aspect-square text-xs rounded-md transition-all ${
                        isSelected
                          ? "bg-teal-500 text-white font-medium shadow-md shadow-teal-100"
                          : isToday
                          ? "bg-teal-50 text-teal-600 font-medium"
                          : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDateSelect(new Date())}
                className="w-full text-xs text-teal-600 hover:text-teal-700 font-medium py-2 rounded-md hover:bg-teal-50 transition-colors"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

