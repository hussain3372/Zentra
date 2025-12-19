"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/utils/api";
import { usePsychologicalStateContext } from "@/context/PsychologicalStateContext";
import { STATE_CONFIG } from "@/components/StateIndicator";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const NavLink = ({ href, icon, label, showLabel, isActive, isMobile = false }) => {
  return (
    <Link
      href={href}
      className={`flex ${isMobile ? 'flex-row items-center' : 'flex-col lg:flex-col items-center justify-center'} w-full py-4 transition-all duration-200 relative group ${
        isActive ? "text-primary" : "text-gray-600 hover:text-primary"
      } ${showLabel && isMobile ? "gap-3" : ""}`}
    >
      <div
        className={`flex items-center justify-center transition-all duration-200 rounded-lg p-2 backdrop-blur-sm ${
          isActive ? "shadow-sm" : ""
        }`}
        style={{
          background: isActive
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(255, 255, 255, 0)",
          border: isActive
            ? "1px solid rgba(255, 255, 255, 0.4)"
            : "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0)";
            e.currentTarget.style.border = "1px solid transparent";
          }
        }}
      >
        <div style={{ color: "#000080" }}>
          {icon}
        </div>
      </div>
      {showLabel && (
        <span className={`${isMobile ? 'mt-0' : 'mt-0 lg:mt-2'} text-sm lg:text-xs font-medium`} style={{ color: "#000080" }}>{label}</span>
      )}
    </Link>
  );
};

const Icon = ({ children, className = "w-6 h-6" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const HamburgerIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const Sidebar = ({ collapsed = false, onToggle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(!collapsed);
  const { data: stateData } = usePsychologicalStateContext() || {};

  // Map backend state to frontend state
  const stateMapping = {
    CONFIDENT: "focused",
    ANXIOUS: "hesitant",
    FRUSTRATED: "overtrading",
    DISCIPLINED: "stable",
    GREEDY: "aggressive",
    FEARFUL: "hesitant",
  };

  const currentState = stateData?.state
    ? stateMapping[stateData.state] || "focused"
    : "focused";

  // Update showLabels when collapsed prop changes
  useEffect(() => {
    setShowLabels(!collapsed);
  }, [collapsed]);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleToggle = () => {
    setShowLabels(!showLabels);
    if (onToggle) {
      onToggle();
    }
  };

  // Close mobile menu when a link is clicked
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <Icon>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="3" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </Icon>
      ),
    },
    {
      href: "/dashboard/trades",
      label: "Trades",
      icon: (
        <Icon>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="4" y1="10" x2="20" y2="10" />
          <line x1="10" y1="4" x2="10" y2="20" />
        </Icon>
      ),
    },
    {
      href: "/dashboard/plan",
      label: "Trading Plan",
      icon: (
        <Icon>
          <line x1="7" y1="4" x2="7" y2="20" />
          <line x1="17" y1="4" x2="17" y2="20" />
          <line x1="7" y1="8" x2="17" y2="8" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="17" y2="16" />
        </Icon>
      ),
    },
    {
      href: "/dashboard/connect",
      label: "Connect",
      icon: (
        <Icon>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <circle cx="6" cy="8" r="1" />
          <circle cx="10" cy="8" r="1" />
          <circle cx="14" cy="8" r="1" />
          <path d="M6 12h8" />
        </Icon>
      ),
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md shadow-sm backdrop-blur-md transition-all duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          color: "#000080",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
        }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <HamburgerIcon />
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Toggle Button - Desktop (when collapsed) */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="hidden lg:flex fixed top-4 left-4 z-50 p-2 rounded-md shadow-sm backdrop-blur-md transition-all duration-300 mt-2"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            color: "#000080",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
          }}
          aria-label="Expand sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static flex flex-col h-screen transform transition-all duration-300 ease-in-out z-50 relative overflow-hidden ${
          isMobileMenuOpen
            ? "translate-x-0 w-64"
            : collapsed
            ? "w-0 lg:w-0 overflow-hidden -translate-x-full lg:translate-x-0"
            : showLabels
            ? "w-0 lg:w-24 -translate-x-full lg:translate-x-0"
            : "w-0 lg:w-20 -translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)`,
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.6), 0 8px 32px 0 rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Vertical line on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-px z-10" style={{ backgroundColor: "rgba(0, 0, 128, 0.1)" }} />

        {/* Toggle button at the top */}
        <div className="pt-6 pb-4 flex items-center justify-center relative z-10">
          {/* Mobile close button */}
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              }}
              aria-label="Close menu"
            >
              <Icon className="w-5 h-5" style={{ color: "#000080" }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </Icon>
            </button>
          )}
          <button
            onClick={handleToggle}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 backdrop-blur-md"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)";
            }}
            aria-label={showLabels ? "Hide labels" : "Show labels"}
            title={showLabels ? "Hide labels" : "Show labels"}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: "#000080" }}
            >
              {showLabels ? (
                // Double left chevron (collapse/hide labels)
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 19l-7-7 7-7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 19l-7-7 7-7"
                  />
                </>
              ) : (
                // Double right chevron (expand/show labels)
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 5l7 7-7 7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 5l7 7-7 7"
                  />
                </>
              )}
            </Icon>
          </button>
        </div>

        {/* Icons container - centered vertically */}
        <div className={`flex-1 flex flex-col ${isMobileMenuOpen ? 'items-start px-4' : 'items-center'} justify-center py-8 space-y-6 relative z-10`}>
          {navLinks.map(({ href, label, icon }) => (
            <div key={href} onClick={handleNavClick} className="w-full">
              <NavLink
                href={href}
                icon={icon}
                label={label}
                showLabel={showLabels || isMobileMenuOpen}
                isActive={pathname === href}
                isMobile={isMobileMenuOpen}
              />
            </div>
          ))}
        </div>

        {/* Logout button at the bottom */}
        <div className={`pb-6 flex items-center ${isMobileMenuOpen ? 'justify-start px-4' : 'justify-center'} relative z-10`}>
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className={`flex ${isMobileMenuOpen ? 'flex-row items-center gap-3' : 'flex-col items-center justify-center'} w-full py-4 transition-all duration-200 group`}
            aria-label="Logout"
            title="Logout"
          >
            <div
              className="flex items-center justify-center transition-all duration-200 rounded-lg p-2 backdrop-blur-sm"
              style={{
                background: "rgba(255, 255, 255, 0)",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.border =
                  "1px solid rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0)";
                e.currentTarget.style.border = "1px solid transparent";
              }}
            >
              <Icon className="w-6 h-6" style={{ color: "#000080" }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </Icon>
            </div>
            {(showLabels || isMobileMenuOpen) && (
              <span className="mt-2 text-xs font-medium" style={{ color: "#000080" }}>
                Logout
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
