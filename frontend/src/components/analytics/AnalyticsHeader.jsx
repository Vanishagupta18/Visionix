import React, { useState } from "react";
import { Calendar, Filter, Download, FileText, ChevronDown } from "lucide-react";

export default function AnalyticsHeader({
  dateRange = "Past 7 Days (Oct 18 - Oct 25, 2024)",
  onDateRangeChange,
  zone = "All Venue Zones",
  onZoneChange,
  onExportCsv,
  onExportPdf,
}) {
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [zoneDropdownOpen, setZoneDropdownOpen] = useState(false);

  const dateOptions = [
    "Today (Oct 25, 2024)",
    "Past 24 Hours",
    "Past 7 Days (Oct 18 - Oct 25, 2024)",
    "Past 30 Days",
    "Custom Date Range...",
  ];

  const zoneOptions = [
    "All Venue Zones",
    "Gate 3 / Main Concourse",
    "Platform 1",
    "North Turnstile Bank",
    "West Escalator & Mezzanine",
    "Baggage Check Area",
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 20,
    }}>
      {/* ── Left Title & Subtitle ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h1 style={{
          margin: 0,
          fontFamily: "var(--vx-sans)",
          fontSize: 26,
          fontWeight: 800,
          color: "#0f172a",
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
        }}>
          Crowd Dynamics &amp; Incident Analytics
        </h1>
        <p style={{
          margin: 0,
          fontFamily: "var(--vx-sans)",
          fontSize: 13,
          color: "#64748b",
          fontWeight: 400,
          lineHeight: 1.4,
        }}>
          Automated spatial density telemetry, queue latency diagnostics, and proactive security logs.
        </p>
      </div>

      {/* ── Right Filters & Action Buttons ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
      }}>
        {/* Date Filter Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setDateDropdownOpen(!dateDropdownOpen);
              setZoneDropdownOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease-in-out",
            }}
          >
            <Calendar size={14} color="#64748b" />
            <span>{dateRange}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {dateDropdownOpen && (
            <div style={{
              position: "absolute",
              top: "110%",
              right: 0,
              zIndex: 50,
              minWidth: 240,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
              padding: "4px 0",
            }}>
              {dateOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onDateRangeChange?.(option);
                    setDateDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    border: "none",
                    backgroundColor: option === dateRange ? "#f1f5f9" : "transparent",
                    color: option === dateRange ? "#0f172a" : "#475569",
                    fontFamily: "var(--vx-sans)",
                    fontSize: 12,
                    fontWeight: option === dateRange ? 700 : 500,
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zone Filter Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setZoneDropdownOpen(!zoneDropdownOpen);
              setDateDropdownOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              fontFamily: "var(--vx-sans)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease-in-out",
            }}
          >
            <Filter size={14} color="#64748b" />
            <span>{zone}</span>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {zoneDropdownOpen && (
            <div style={{
              position: "absolute",
              top: "110%",
              right: 0,
              zIndex: 50,
              minWidth: 220,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
              padding: "4px 0",
            }}>
              {zoneOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onZoneChange?.(option);
                    setZoneDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    border: "none",
                    backgroundColor: option === zone ? "#f1f5f9" : "transparent",
                    color: option === zone ? "#0f172a" : "#475569",
                    fontFamily: "var(--vx-sans)",
                    fontSize: 12,
                    fontWeight: option === zone ? 700 : 500,
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CSV Export Button */}
        <button
          onClick={onExportCsv}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            color: "#1e293b",
            fontFamily: "var(--vx-sans)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            transition: "all 0.15s ease-in-out",
          }}
        >
          <Download size={14} color="#475569" />
          <span>CSV</span>
        </button>

        {/* PDF Export Button */}
        <button
          onClick={onExportPdf}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            color: "#1e293b",
            fontFamily: "var(--vx-sans)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            transition: "all 0.15s ease-in-out",
          }}
        >
          <FileText size={14} color="#475569" />
          <span>PDF</span>
        </button>
      </div>
    </div>
  );
}
