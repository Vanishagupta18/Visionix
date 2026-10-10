import React, { useState } from "react";
import { heatmapMatrixData as defaultData } from "./mockAnalyticsData";

export default function PeakHoursHeatmap({ data = defaultData }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const hoursList = Array.from({ length: 24 }, (_, i) => i);

  // Determine cell background color from density level
  const getCellColor = (density) => {
    if (density >= 1.3) return "#b83a24"; // Surge red/rust
    if (density >= 0.9) return "#236b3e"; // Dark forest green
    if (density >= 0.5) return "#6eb37b"; // Medium green
    if (density >= 0.25) return "#c2e0c6"; // Light sage green
    return "#f4efe6"; // Soft sand/cream
  };

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 16,
      border: "1px solid rgba(226,220,212,0.9)",
      padding: "20px 22px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      marginTop: 20,
    }}>
      {/* ── Top Header ── */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 16,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--vx-sans)",
              fontSize: 18,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}>
              Peak Hours Calendar Heatmap Grid
            </h2>
            <span style={{
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              fontWeight: 600,
              color: "#64748b",
            }}>
              7-Day Matrix · 24-Hour Resolution
            </span>
          </div>
          <p style={{
            margin: "4px 0 0 0",
            fontFamily: "var(--vx-sans)",
            fontSize: 12,
            color: "#64748b",
          }}>
            Visualizing micro-density concentrations to coordinate guard shifts.
          </p>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--vx-sans)",
          fontSize: 11,
          color: "#475569",
          fontWeight: 600,
        }}>
          <span>0.1 (Soft Sand)</span>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: "#f4efe6", border: "1px solid #e5dec9" }} />
            <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: "#c2e0c6" }} />
            <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: "#6eb37b" }} />
            <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: "#236b3e" }} />
            <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: "#b83a24" }} />
          </div>
          <span>1.4+ pers/m² (Surge)</span>
        </div>
      </div>

      {/* ── Heatmap Grid Container ── */}
      <div style={{ overflowX: "auto", position: "relative" }}>
        <div style={{ minWidth: 700 }}>

          {/* Time Header Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "55px repeat(24, 1fr)",
            gap: 4,
            marginBottom: 6,
          }}>
            <div /> {/* Empty top-left cell */}
            {hoursList.map((h) => (
              <div
                key={h}
                style={{
                  textAlign: "center",
                  fontFamily: "var(--vx-mono)",
                  fontSize: 9,
                  fontWeight: 600,
                  color: "#94a3b8",
                }}
              >
                {h % 2 === 0 ? `${String(h).padStart(2, '0')}:00` : ""}
              </div>
            ))}
          </div>

          {/* Day Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {data.map((dayRow) => (
              <div
                key={dayRow.day}
                style={{
                  display: "grid",
                  gridTemplateColumns: "55px repeat(24, 1fr)",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                {/* Day Label */}
                <div style={{
                  fontFamily: "var(--vx-sans)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#475569",
                }}>
                  {dayRow.day}
                </div>

                {/* 24 Hour Cells */}
                {dayRow.hours.map((cell) => {
                  const bg = getCellColor(cell.density);
                  return (
                    <div
                      key={cell.hour}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredCell({
                          day: dayRow.day,
                          hourLabel: cell.hourLabel,
                          density: cell.density,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        height: 24,
                        borderRadius: 4,
                        backgroundColor: bg,
                        cursor: "pointer",
                        transition: "transform 0.1s ease, filter 0.1s ease",
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.03)",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredCell && (
          <div style={{
            position: "fixed",
            left: hoveredCell.x,
            top: hoveredCell.y - 8,
            transform: "translate(-50%, -100%)",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "5px 10px",
            borderRadius: 6,
            fontSize: 11,
            fontFamily: "var(--vx-sans)",
            pointerEvents: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            zIndex: 100,
            whiteSpace: "nowrap",
          }}>
            <div style={{ fontWeight: 700 }}>{hoveredCell.day} {hoveredCell.hourLabel}</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>
              Density: <span style={{ color: "#38bdf8", fontWeight: 700 }}>{hoveredCell.density} pers/m²</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
