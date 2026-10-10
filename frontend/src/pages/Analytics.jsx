import React, { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import AnalyticsKpiGrid from "../components/analytics/AnalyticsKpiGrid";
import DensityTrendChart from "../components/analytics/DensityTrendChart";
import IncidentsByLocation from "../components/analytics/IncidentsByLocation";
import PeakHoursHeatmap from "../components/analytics/PeakHoursHeatmap";

export default function Analytics() {
  const [activeNav, setActiveNav] = useState("Analytics");
  const [dateRange, setDateRange] = useState("Past 7 Days (Oct 18 - Oct 25, 2024)");
  const [zone, setZone] = useState("All Venue Zones");

  const handleExportCsv = () => {
    // CSV export trigger action
    alert("Exporting Analytics Report as CSV...");
  };

  const handleExportPdf = () => {
    // PDF export trigger action
    window.print();
  };

  return (
    <DashboardLayout activeNav={activeNav} onNavSelect={setActiveNav}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* ── Page Header & Controls ── */}
        <AnalyticsHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          zone={zone}
          onZoneChange={setZone}
          onExportCsv={handleExportCsv}
          onExportPdf={handleExportPdf}
        />

        {/* ── 4 KPI Cards Grid ── */}
        <AnalyticsKpiGrid />

        {/* ── Middle Row: Crowd Density Trajectory Chart (2/3) + Incidents by Location (1/3) ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 16,
          alignItems: "stretch",
          marginBottom: 0,
        }}>
          <div style={{ gridColumn: "span 8", minWidth: 0 }}>
            <DensityTrendChart />
          </div>
          <div style={{ gridColumn: "span 4", minWidth: 0 }}>
            <IncidentsByLocation />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
