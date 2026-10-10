import React from "react";
import { TrendingUp, TrendingDown, Users, Sliders, Hourglass, ShieldCheck } from "lucide-react";

export default function KpiCard({
  title,
  value,
  unit,
  icon: IconComponent,
  iconType,
  trend,
  subtext,
  subtextDotColor,
  style = {},
  className = "",
}) {
  // Render icon based on iconType or passed IconComponent
  const renderIcon = () => {
    if (IconComponent) {
      return <IconComponent size={18} color="#64748b" />;
    }
    switch (iconType) {
      case "users":
        return <Users size={18} color="#64748b" />;
      case "density":
        return <Sliders size={18} color="#64748b" />;
      case "hourglass":
        return <Hourglass size={18} color="#64748b" />;
      case "shield":
        return <ShieldCheck size={18} color="#64748b" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        border: "1px solid rgba(226,220,212,0.9)",
        padding: "16px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 122,
        transition: "all 0.15s ease-in-out",
        ...style,
      }}
    >
      {/* ── Top Header Row: Title & Icon ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          fontFamily: "var(--vx-sans)",
          fontSize: 13,
          fontWeight: 600,
          color: "#475569",
          letterSpacing: "-0.01em",
        }}>
          {title}
        </span>
        {renderIcon() && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: "#f8fafc",
          }}>
            {renderIcon()}
          </div>
        )}
      </div>

      {/* ── Middle Row: Large Value & Unit ── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10, marginBottom: 12 }}>
        <span style={{
          fontFamily: "var(--vx-sans)",
          fontSize: 28,
          fontWeight: 800,
          color: "#0f172a",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}>
          {value}
        </span>
        {unit && (
          <span style={{
            fontFamily: "var(--vx-sans)",
            fontSize: 13,
            fontWeight: 500,
            color: "#64748b",
          }}>
            {unit}
          </span>
        )}
      </div>

      {/* ── Bottom Row: Trend Badge OR Subtext ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 22 }}>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 7px",
              borderRadius: 6,
              backgroundColor: trend.direction === "up" ? "#e6f4ea" : "#e6f4ea",
              color: "#16a34a",
              fontFamily: "var(--vx-sans)",
              fontSize: 11,
              fontWeight: 700,
            }}>
              {trend.direction === "up" ? (
                <TrendingUp size={12} color="#16a34a" />
              ) : (
                <TrendingDown size={12} color="#16a34a" />
              )}
              {trend.value}
            </span>
            <span style={{
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              color: "#64748b",
              fontWeight: 500,
            }}>
              {trend.label}
            </span>
          </div>
        )}

        {!trend && subtext && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {subtextDotColor && (
              <span style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: subtextDotColor,
                display: "inline-block",
                flexShrink: 0,
              }} />
            )}
            <span style={{
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              color: "#64748b",
              fontWeight: 500,
              lineHeight: 1.3,
            }}>
              {subtext}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
