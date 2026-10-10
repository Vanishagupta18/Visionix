import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Camera,
  Bell,
  BarChart2,
  Settings,
  AlertOctagon,
} from "lucide-react";
import OfficerPanel from "../dashboard/OfficerPanel";

const navItems = [
  { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
  {
    name: "Cameras",
    icon: Camera,
    badge: "LIVE",
    badgeGreen: true,
    path: "/cameras",
  },
  {
    name: "Alerts",
    icon: Bell,
    badge: "2",
    badgeRed: true,
    path: "/alerts",
  },
  { name: "Analytics", icon: BarChart2, path: "/analytics" },
  { name: "System Settings", icon: Settings, path: "/dashboard" },
];

export default function Sidebar({ activeNav = "Cameras", onNavSelect }) {
  const navigate = useNavigate();

  const handleNav = (item) => {
    onNavSelect?.(item.name);
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside
      style={{
        width: 248,
        minWidth: 248,
        flexShrink: 0,
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(226,220,212,0.9)",
        padding: "20px 16px",
      }}
    >
      {/* ── TOP: Logo + Nav ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <img
                src="/vision logo.jpg"
                alt="Visionix"
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "contain",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--vx-serif)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.01em",
                }}
              >
                Visionix
              </span>
            </div>
          </div>

          <p
            style={{
              fontFamily: "var(--vx-sans)",
              fontSize: 11,
              color: "#64748b",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Control Room 02 -<br />
            Systems Nominal
          </p>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map((item) => {
            const { name, icon: Icon, badge, badgeRed, badgeGreen } = item;
            const active = activeNav === name;
            return (
              <button
                key={name}
                onClick={() => handleNav(item)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: 10,
                  border: active
                    ? "1px solid #3b82f6"
                    : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  backgroundColor: active ? "#ffffff" : "transparent",
                  color: active ? "#0f172a" : "#64748b",
                  fontFamily: "var(--vx-sans)",
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  boxShadow: active
                    ? "0 1px 4px rgba(59,130,246,0.15)"
                    : "none",
                }}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <Icon size={16} color={active ? "#2563eb" : "#94a3b8"} />
                  {name}
                </span>
                {badge && (
                  <span
                    style={{
                      fontFamily: "var(--vx-mono)",
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 4,
                      backgroundColor: badgeRed
                        ? "#ef4444"
                        : badgeGreen
                          ? "#059669"
                          : "#e2e8f0",
                      color: "#fff",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── BOTTOM: Emergency + Officer ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingTop: 16,
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 10,
            border: "none",
            backgroundColor: "#c53030",
            color: "#fff",
            fontFamily: "var(--vx-sans)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(197,48,48,0.3)",
          }}
        >
          <AlertOctagon size={15} color="#fff" />
          Emergency Override
        </button>

        {/* Officer info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            borderRadius: 10,
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#2d5a52",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--vx-sans)",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            EV
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#1e293b",
                lineHeight: 1.2,
              }}
            >
              Officer Elena Vance
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#64748b",
                fontFamily: "var(--vx-mono)",
              }}
            >
              Station 4 · Shift A
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
