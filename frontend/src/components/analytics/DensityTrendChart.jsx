import React, { useState } from "react";
import { densityTrendData as defaultData } from "./mockAnalyticsData";
import AnalyticsSummary from "./AnalyticsSummary";
import { Clock } from "lucide-react";

export default function DensityTrendChart({ data = defaultData }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const points = data.timePoints || [];
  const threshold = data.safetyThreshold || 1.0;

  // Chart dimensions & bounds
  const svgWidth = 720;
  const svgHeight = 280;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxDensity = 1.5;
  const minDensity = 0.0;

  // Map data to SVG coordinates
  const getX = (index) => paddingLeft + (index / (points.length - 1)) * chartWidth;
  const getY = (val) => paddingTop + chartHeight - ((val - minDensity) / (maxDensity - minDensity)) * chartHeight;

  // Generate smooth cubic bezier SVG path string
  const createSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    let path = `M ${getX(0)} ${getY(pts[0].density)}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const x0 = getX(i);
      const y0 = getY(pts[i].density);
      const x1 = getX(i + 1);
      const y1 = getY(pts[i + 1].density);

      const cpX1 = x0 + (x1 - x0) / 2;
      const cpY1 = y0;
      const cpX2 = x0 + (x1 - x0) / 2;
      const cpY2 = y1;

      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x1} ${y1}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${getX(points.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;

  // Y-axis ticks
  const yTicks = [0.0, 0.3, 0.6, 0.9, 1.2, 1.5];
  const thresholdY = getY(threshold);

  // Critical surge incident point
  const surgePointIndex = points.findIndex((p) => p.isSurge);
  const surgePoint = surgePointIndex !== -1 ? points[surgePointIndex] : null;
  const surgeX = surgePoint ? getX(surgePointIndex) : 0;
  const surgeY = surgePoint ? getY(surgePoint.density) : 0;

  // AM peak point
  const amPeakIndex = points.findIndex((p) => p.isAmPeak);
  const amPeakX = amPeakIndex !== -1 ? getX(amPeakIndex) : 0;
  const amPeakY = amPeakIndex !== -1 ? getY(points[amPeakIndex].density) : 0;

  // X-axis display labels (filter main time steps)
  const xTickIndices = [0, 2, 4, 6, 9, 11, 13, 15]; // 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 16,
      border: "1px solid rgba(226,220,212,0.9)",
      padding: "20px 22px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--vx-sans)",
              fontSize: 18,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}>
              Crowd Density Trajectory &amp; Commute Surges
            </h2>
            {data.dateLabel && (
              <span style={{
                fontFamily: "var(--vx-sans)",
                fontSize: 11,
                fontWeight: 600,
                color: "#64748b",
                backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0",
                padding: "2px 9px",
                borderRadius: 999,
              }}>
                {data.dateLabel}
              </span>
            )}
          </div>
          <p style={{
            margin: "4px 0 0 0",
            fontFamily: "var(--vx-sans)",
            fontSize: 12,
            color: "#64748b",
          }}>
            Continuous spatial telemetry plotted against pedestrian comfort threshold.
          </p>
        </div>

        {/* Legend */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: "var(--vx-sans)",
          fontSize: 11,
          color: "#475569",
          fontWeight: 600,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 14,
              height: 2.5,
              backgroundColor: "#1e3a29",
              display: "inline-block",
              borderRadius: 2,
            }} />
            <span>Active Density (pers/m²)</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 14,
              height: 0,
              borderTop: "2px dashed #dc2626",
              display: "inline-block",
            }} />
            <span style={{ color: "#dc2626" }}>Safety Threshold (1.0)</span>
          </div>
        </div>
      </div>

      {/* ── Chart Container ── */}
      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="densityAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d5a41" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#2d5a41" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2d5a41" stopOpacity="0.00" />
            </linearGradient>

            {/* Drop Shadow for Callout Card */}
            <filter id="shadowCallout" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#dc2626" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Background Grid Lines & Y-axis labels */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAlign="end"
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="var(--vx-mono)"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Safety Threshold Dashed Line (y=1.0) */}
          <line
            x1={paddingLeft}
            y1={thresholdY}
            x2={svgWidth - paddingRight}
            y2={thresholdY}
            stroke="#dc2626"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Area Fill under curve */}
          <path d={areaPath} fill="url(#densityAreaGrad)" />

          {/* Main Density Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#1e3a29"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* AM PEAK Marker */}
          {amPeakIndex !== -1 && (
            <g transform={`translate(${amPeakX - 25}, ${amPeakY - 20})`}>
              <rect
                x="0"
                y="0"
                width="50"
                height="16"
                rx="4"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x="25"
                y="11"
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#475569"
                fontFamily="var(--vx-sans)"
              >
                AM PEAK
              </text>
            </g>
          )}

          {/* Critical Surge Vertical Dashed Line & Peak Dot */}
          {surgePoint && (
            <g>
              {/* Vertical line down to axis */}
              <line
                x1={surgeX}
                y1={surgeY}
                x2={surgeX}
                y2={getY(0)}
                stroke="#dc2626"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {/* Peak Circle Dot */}
              <circle
                cx={surgeX}
                cy={surgeY}
                r="5"
                fill="#dc2626"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X-axis Ticks & Time Labels */}
          {xTickIndices.map((idx) => {
            if (!points[idx]) return null;
            const x = getX(idx);
            return (
              <text
                key={idx}
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="var(--vx-mono)"
              >
                {points[idx].time}
              </text>
            );
          })}

          {/* Interactive Hover Data Points */}
          {points.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(pt.density);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="6"
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredPoint({ ...pt, x: cx, y: cy })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* ── Overlay Incident Callout Box (Positioned floating over the 17:45 Peak) ── */}
        {surgePoint && (
          <div style={{
            position: "absolute",
            top: "22%",
            left: "54%",
            transform: "translate(-50%, -100%)",
            backgroundColor: "#ffffff",
            border: "1px solid #fca5a5",
            borderRadius: 10,
            padding: "10px 14px",
            boxShadow: "0 6px 16px rgba(220, 38, 38, 0.12)",
            minWidth: 230,
            zIndex: 10,
            pointerEvents: "auto",
          }}>
            {/* Header Badge & Time */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{
                fontFamily: "var(--vx-mono)",
                fontSize: 9,
                fontWeight: 800,
                color: "#dc2626",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "1px 6px",
                borderRadius: 4,
                letterSpacing: "0.03em",
              }}>
                {surgePoint.incident.title}
              </span>
              <span style={{
                fontFamily: "var(--vx-mono)",
                fontSize: 10,
                color: "#64748b",
                fontWeight: 600,
              }}>
                {surgePoint.incident.time}
              </span>
            </div>

            {/* Incident Title */}
            <div style={{
              fontFamily: "var(--vx-sans)",
              fontSize: 13,
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 3,
            }}>
              Incident {surgePoint.incident.id}
            </div>

            {/* Description */}
            <div style={{
              fontFamily: "var(--vx-sans)",
              fontSize: 11,
              color: "#475569",
              lineHeight: 1.3,
              marginBottom: 8,
            }}>
              {surgePoint.incident.description}
            </div>

            {/* Action Footer */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 10,
              fontFamily: "var(--vx-sans)",
              fontWeight: 700,
              color: "#0f172a",
              borderTop: "1px solid #f1f5f9",
              paddingTop: 6,
            }}>
              <span>{surgePoint.incident.actionText}</span>
              <a
                href="#audit"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: "#1e293b",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                {surgePoint.incident.actionLinkText}
              </a>
            </div>
          </div>
        )}

        {/* Hover Tooltip if user hovers on other points */}
        {hoveredPoint && !hoveredPoint.isSurge && (
          <div style={{
            position: "absolute",
            left: `${(hoveredPoint.x / svgWidth) * 100}%`,
            top: `${(hoveredPoint.y / svgHeight) * 100}%`,
            transform: "translate(-50%, -120%)",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 11,
            fontFamily: "var(--vx-mono)",
            pointerEvents: "none",
            boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
            zIndex: 20,
            whiteSpace: "nowrap",
          }}>
            {hoveredPoint.time}: {hoveredPoint.density} pers/m²
          </div>
        )}
      </div>

      {/* ── Summary Statistics Line (AnalyticsSummary integration) ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10,
        paddingTop: 12,
        marginTop: 10,
        borderTop: "1px solid #f1f5f9",
        fontFamily: "var(--vx-sans)",
        fontSize: 12,
        color: "#64748b",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span>
            Standard deviation: <strong style={{ color: "#1e293b" }}>{data.summaryStats?.stdDev || "±0.18 pers/m²"}</strong>
          </span>
          <span>
            Morning Peak Max: <strong style={{ color: "#1e293b" }}>{data.summaryStats?.morningPeakMax || "1.14 pers/m² (08:20)"}</strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b", fontFamily: "var(--vx-mono)" }}>
          <Clock size={12} color="#94a3b8" />
          <span>{data.summaryStats?.aggregation || "5-minute rolling average aggregation"}</span>
        </div>
      </div>
    </div>
  );
}
