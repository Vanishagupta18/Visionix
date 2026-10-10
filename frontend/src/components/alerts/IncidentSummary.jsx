import React from "react";
import { Shield, Radio, CheckCircle, XCircle } from "lucide-react";

export default function IncidentSummary({
  incidentId = "#INC-8942",
  title = "Rapid Crowd Surge & Turnstile Bottleneck",
  severity = "CRITICAL",
  status = "UNDER REVIEW",
  location = "Sector 1 - South Gate 3",
  onDismiss,
  onAcknowledge,
  onNotifyDispatch,
}) {
  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 16,
      border: "1px solid rgba(226,220,212,0.9)",
      padding: "20px 24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      marginBottom: 20,
    }}>
      {/* ── Top Row: Badges & Location Chip ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Severity Badge */}
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 999,
            backgroundColor: severity === "CRITICAL" ? "#fee2e2" : "#fef3c7",
            color: severity === "CRITICAL" ? "#dc2626" : "#d97706",
            border: `1px solid ${severity === "CRITICAL" ? "#fca5a5" : "#fde68a"}`,
            fontFamily: "var(--vx-mono)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.04em",
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: severity === "CRITICAL" ? "#dc2626" : "#d97706",
            }} />
            {severity}
          </span>

          {/* Status Badge */}
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px 10px",
            borderRadius: 999,
            backgroundColor: "#fef3c7",
            color: "#d97706",
            border: "1px solid #fde68a",
            fontFamily: "var(--vx-mono)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.04em",
          }}>
            {status}
          </span>
        </div>

        {/* Location Tag Pill */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 12px",
          borderRadius: 999,
          backgroundColor: "#f1f5f9",
          border: "1px solid #e2e8f0",
          color: "#475569",
          fontFamily: "var(--vx-sans)",
          fontSize: 12,
          fontWeight: 600,
        }}>
          <span style={{ fontFamily: "var(--vx-mono)", fontSize: 11, color: "#64748b" }}>DRIVE_FILE_...</span>
          <span style={{ color: "#94a3b8" }}>|</span>
          <span>{location}</span>
        </div>
      </div>

      {/* ── Middle Row & Actions ── */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        {/* Title & Incident ID */}
        <div style={{ maxWidth: 650 }}>
          <div style={{
            fontFamily: "var(--vx-mono)",
            fontSize: 12,
            fontWeight: 600,
            color: "#64748b",
            marginBottom: 4,
          }}>
            ID: {incidentId}
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: "var(--vx-sans)",
            fontSize: 26,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
          }}>
            {title}
          </h1>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}>
          {/* Dismiss Button */}
          <button
            onClick={onDismiss}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#475569",
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease-in-out",
            }}
          >
            Dismiss as False Positive
          </button>

          {/* Acknowledge Button */}
          <button
            onClick={onAcknowledge}
            style={{
              padding: "9px 14px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #94a3b8",
              color: "#0f172a",
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease-in-out",
            }}
          >
            Acknowledge Incident
          </button>

          {/* Primary Dispatch Button */}
          <button
            onClick={onNotifyDispatch}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              borderRadius: 8,
              backgroundColor: "#166534",
              border: "none",
              color: "#ffffff",
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(22,101,52,0.3)",
              transition: "all 0.15s ease-in-out",
            }}
          >
            <Shield size={15} color="#ffffff" />
            <span>Notify Field Security &amp; Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
