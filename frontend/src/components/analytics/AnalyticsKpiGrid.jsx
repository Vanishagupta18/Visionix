import React from "react";
import AnalyticsKpiCard from "./AnalyticsKpiCard";
import { kpiData as defaultKpis } from "./mockAnalyticsData";

export default function AnalyticsKpiGrid({ kpis = defaultKpis }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 16,
      marginBottom: 20,
    }}>
      {kpis.map((kpi) => (
        <AnalyticsKpiCard
          key={kpi.id || kpi.title}
          title={kpi.title}
          value={kpi.value}
          unit={kpi.unit}
          iconType={kpi.iconType}
          trend={kpi.trend}
          subtext={kpi.subtext}
          subtextDotColor={kpi.subtextDotColor}
        />
      ))}
    </div>
  );
}
