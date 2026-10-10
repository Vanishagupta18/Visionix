import React from "react";
import { RefreshCw, Activity, AlertCircle } from "lucide-react";

export default function AnalyticsSummary({
  stdDev = "±0.18 pers/m²",
  morningPeakMax = "1.14 pers/m² (08:20)",
  aggregation = "5-minute rolling average aggregation",
  compact = false,
}) {
  if (compact) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        paddingTop: 12,
        marginTop: 12,
        borderTop: "1px solid #f1f5f9",
        fontFamily: "var(--vx-sans)",
        fontSize: 12,
        color: "#64748b",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span>
            Standard deviation: <strong style={{ color: "#334155" }}>{stdDev}</strong>
          </span>
          <span>
            Morning Peak Max: <strong style={{ color: "#334155" }}>{morningPeakMax}</strong>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8" }}>
          <RefreshCw size={12} color="#94a3b8" />
          <span>{aggregation}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 14,
      border: "1px solid rgba(226,220,212,0.9)",
      padding: "14px 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={16} color="#3b82f6" />
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "var(--vx-sans)" }}>
            Standard deviation: <strong style={{ color: "#0f172a", fontWeight: 700 }}>{stdDev}</strong>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={16} color="#f59e0b" />
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "var(--vx-sans)" }}>
            Morning Peak Max: <strong style={{ color: "#0f172a", fontWeight: 700 }}>{morningPeakMax}</strong>
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", fontFamily: "var(--vx-mono)" }}>
        <RefreshCw size={12} color="#94a3b8" />
        <span>{aggregation}</span>
      </div>
    </div>
  );
}
