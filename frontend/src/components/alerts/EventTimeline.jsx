import React from "react";
import { ListFilter, Clock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export default function EventTimeline({ events = [] }) {
  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 16,
      border: "1px solid rgba(226,220,212,0.9)",
      padding: "18px 20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ── Top Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ListFilter size={16} color="#475569" />
          <h2 style={{
            margin: 0,
            fontFamily: "var(--vx-sans)",
            fontSize: 15,
            fontWeight: 800,
            color: "#0f172a",
          }}>
            Event Timeline &amp; Audit Log
          </h2>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontFamily: "var(--vx-mono)",
          fontSize: 10,
          fontWeight: 700,
          color: "#16a34a",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#16a34a" }} />
          <span>Live Sync</span>
        </div>
      </div>

      {/* ── Timeline Items List ── */}
      <div style={{
        position: "relative",
        paddingLeft: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}>
        {/* Vertical line connecting events */}
        <div style={{
          position: "absolute",
          left: 6,
          top: 8,
          bottom: 8,
          width: 2,
          backgroundColor: "#e2e8f0",
        }} />

        {events.map((evt) => {
          const isTrigger = evt.isTrigger || evt.type === "critical";
          return (
            <div
              key={evt.id || evt.timestamp}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {/* Timeline Bullet Node */}
              <div style={{
                position: "absolute",
                left: -20,
                top: 2,
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: isTrigger ? "#dc2626" : "#2563eb",
                border: "2px solid #ffffff",
                boxShadow: isTrigger ? "0 0 6px rgba(220,38,38,0.4)" : "none",
                zIndex: 2,
              }} />

              {/* Event Container Card */}
              <div style={{
                backgroundColor: isTrigger ? "#fef2f2" : "#f8fafc",
                border: isTrigger ? "1px solid #fca5a5" : "1px solid #f1f5f9",
                borderRadius: 8,
                padding: "8px 12px",
              }}>
                {/* Timestamp Header */}
                <div style={{
                  fontFamily: "var(--vx-mono)",
                  fontSize: 10,
                  fontWeight: 800,
                  color: isTrigger ? "#dc2626" : "#64748b",
                  marginBottom: 2,
                }}>
                  {evt.timestamp}
                </div>

                {/* Event Description */}
                <div style={{
                  fontFamily: "var(--vx-sans)",
                  fontSize: 11,
                  color: isTrigger ? "#991b1b" : "#334155",
                  fontWeight: isTrigger ? 700 : 500,
                  lineHeight: 1.35,
                }}>
                  {evt.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
