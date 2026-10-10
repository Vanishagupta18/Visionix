import React from "react";
import { BarChart2, ChevronRight } from "lucide-react";
import { locationIncidentsData as defaultLocations, highFrequencyZone } from "./mockAnalyticsData";

export default function IncidentsByLocation({ locations = defaultLocations }) {
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
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{
              margin: 0,
              fontFamily: "var(--vx-sans)",
              fontSize: 17,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}>
              Incidents by Location
            </h2>
            <p style={{
              margin: "3px 0 0 0",
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              color: "#64748b",
            }}>
              Ranked by severity distribution
            </p>
          </div>

          <BarChart2 size={18} color="#64748b" />
        </div>

        {/* Legend */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 14,
          marginBottom: 16,
          fontSize: 11,
          fontFamily: "var(--vx-sans)",
          color: "#475569",
          fontWeight: 600,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#16a34a" }} />
            <span>Low</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#d97706" }} />
            <span>Med</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#ea580c" }} />
            <span>High</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#dc2626" }} />
            <span>Critical</span>
          </div>
        </div>

        {/* ── Locations Stacked Bars List ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {locations.map((loc) => {
            const { low, med, high, critical } = loc.percentages;
            return (
              <div key={loc.id} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {/* Location Title & Count */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "var(--vx-sans)",
                  fontSize: 12,
                }}>
                  <span style={{ fontWeight: 700, color: "#1e293b" }}>{loc.name}</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{loc.totalIncidents} incidents</span>
                </div>

                {/* Stacked Severity Progress Bar */}
                <div style={{
                  display: "flex",
                  height: 10,
                  width: "100%",
                  borderRadius: 5,
                  overflow: "hidden",
                  backgroundColor: "#f1f5f9",
                }}>
                  {low > 0 && <div style={{ width: `${low}%`, backgroundColor: "#16a34a" }} title={`Low: ${loc.breakdown.low}`} />}
                  {med > 0 && <div style={{ width: `${med}%`, backgroundColor: "#d97706" }} title={`Med: ${loc.breakdown.med}`} />}
                  {high > 0 && <div style={{ width: `${high}%`, backgroundColor: "#ea580c" }} title={`High: ${loc.breakdown.high}`} />}
                  {critical > 0 && <div style={{ width: `${critical}%`, backgroundColor: "#dc2626" }} title={`Critical: ${loc.breakdown.critical}`} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 14,
        marginTop: 18,
        borderTop: "1px solid #f1f5f9",
        fontFamily: "var(--vx-sans)",
        fontSize: 12,
      }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>High-frequency zone:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{highFrequencyZone.name}</span>
        </div>

        <a
          href={highFrequencyZone.auditLogUrl}
          onClick={(e) => e.preventDefault()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontSize: 12,
            fontWeight: 700,
            color: "#1e293b",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <span>View full audit log</span>
          <ChevronRight size={14} color="#64748b" />
        </a>
      </div>
    </div>
  );
}
