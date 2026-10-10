import React from "react";
import { ArrowLeft } from "lucide-react";

export default function AlertHeader({ incidentId = "#INC-8942", onBack }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    }}>
      <button
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 8,
          backgroundColor: "#ffffff",
          border: "1px solid #cbd5e1",
          color: "#2563eb",
          fontFamily: "var(--vx-sans)",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          transition: "all 0.15s ease-in-out",
        }}
      >
        <ArrowLeft size={15} color="#2563eb" />
        <span>Back to Live Alerts / Incident {incidentId}</span>
      </button>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        backgroundColor: "#e0f2fe",
        border: "1px solid #bae6fd",
        color: "#0369a1",
        fontFamily: "var(--vx-mono)",
        fontSize: 11,
        fontWeight: 700,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#0284c7" }} />
        <span>Connected</span>
      </div>
    </div>
  );
}
