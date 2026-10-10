import React, { useState } from "react";
import { History, Play, Pause } from "lucide-react";

export default function TemporalForensicScrub({ scrubData }) {
  const {
    windowLabel = "T-Window: -60s to +30s",
    thumbnails = [],
  } = scrubData || {};

  const [activeThumbId, setActiveThumbId] = useState("t3"); // default peak

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
        marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <History size={16} color="#475569" />
          <h3 style={{
            margin: 0,
            fontFamily: "var(--vx-sans)",
            fontSize: 15,
            fontWeight: 800,
            color: "#0f172a",
          }}>
            Temporal Forensic Scrub
          </h3>
        </div>

        <span style={{
          fontFamily: "var(--vx-mono)",
          fontSize: 11,
          fontWeight: 600,
          color: "#64748b",
        }}>
          {windowLabel}
        </span>
      </div>

      {/* ── Scrub Bar & Timeline Axis ── */}
      <div style={{
        position: "relative",
        padding: "10px 0 20px 0",
        marginBottom: 14,
        borderBottom: "1px solid #f1f5f9",
      }}>
        {/* Main timeline horizontal bar */}
        <div style={{
          height: 6,
          width: "100%",
          borderRadius: 3,
          backgroundColor: "#e2e8f0",
          position: "relative",
        }}>
          {/* Active progress bar highlight */}
          <div style={{
            position: "absolute",
            left: "0%",
            width: "72%",
            height: "100%",
            borderRadius: 3,
            backgroundColor: "#dc2626",
          }} />

          {/* Red Scrubber Pin at Peak */}
          <div style={{
            position: "absolute",
            left: "72%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#dc2626",
            border: "2px solid #ffffff",
            boxShadow: "0 0 6px rgba(220,38,38,0.5)",
            zIndex: 5,
            cursor: "pointer",
          }} />
        </div>

        {/* Timeline Axis Labels */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontFamily: "var(--vx-mono)",
          fontSize: 10,
          color: "#94a3b8",
        }}>
          <span>-60s (14:25:18)</span>
          <span>-30s (14:25:48)</span>
          <span style={{ color: "#dc2626", fontWeight: 800 }}>14:26:18 (PEAK)</span>
          <span>+30s (14:26:48)</span>
        </div>
      </div>

      {/* ── 4 Evidence Thumbnail Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}>
        {thumbnails.map((thumb) => {
          const isSelected = activeThumbId === thumb.id || thumb.isPeak;
          return (
            <div
              key={thumb.id}
              onClick={() => setActiveThumbId(thumb.id)}
              style={{
                position: "relative",
                borderRadius: 10,
                overflow: "hidden",
                border: thumb.isPeak ? "2px solid #dc2626" : isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                backgroundColor: "#0f172a",
                cursor: "pointer",
                transition: "all 0.15s ease-in-out",
                boxShadow: thumb.isPeak ? "0 2px 8px rgba(220,38,38,0.2)" : "none",
              }}
            >
              {/* Thumbnail Image */}
              <div style={{ height: 75, overflow: "hidden", position: "relative" }}>
                <img
                  src={thumb.imageSrc}
                  alt={thumb.label}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {/* Time Badge Overlay */}
                <span style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  backgroundColor: thumb.isPeak ? "#dc2626" : "rgba(0,0,0,0.75)",
                  color: "#ffffff",
                  fontFamily: "var(--vx-mono)",
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: 3,
                }}>
                  {thumb.isPeak ? "PEAK" : thumb.timeLabel}
                </span>
              </div>

              {/* Bottom Density Label */}
              <div style={{
                padding: "6px 8px",
                backgroundColor: thumb.isPeak ? "#fef2f2" : "#ffffff",
                fontFamily: "var(--vx-mono)",
                fontSize: 10,
                fontWeight: 700,
                color: thumb.isPeak ? "#dc2626" : "#475569",
                textAlign: "center",
                borderTop: "1px solid #f1f5f9",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {thumb.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
