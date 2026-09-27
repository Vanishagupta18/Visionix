import IncidentItem from "./IncidentItem";
import { Bell } from "lucide-react";

const incidents = [
  {
    id: 1, level: "CRITICAL", location: "Gate 3 Turnstiles", time: "2m ago",
    title: "Abnormal Bottleneck & Rapid Surge",
    description: "Density exceeded 1.35 pers/m². Inflow rate higher than gate throughput capacity. Risk of turnstile stampede.",
    actions: ["Review Feed", "Deploy Patrol 2"],
  },
  {
    id: 2, level: "HIGH", location: "West Corridor", time: "8m ago",
    title: "Flow Rate Limit Approaching 92%",
    description: "West Corridor Escalator upward passenger velocity slowing. CAM_11 indicates luggage obstruction.",
    telemetry: "Escalator 4B Telemetry: 1.1m/s",
    triageLink: "Triage",
  },
  {
    id: 3, level: "MEDIUM", location: "North Concourse", time: "14m ago",
    title: "Stationary Group / Obstruction",
    description: "Cluster of 14 people stationary around Info Kiosk > 9 minutes. Minor lateral pedestrian deviation.",
    telemetry: "CAM_02 Detection confidence: 95%",
    triageLink: "Dismiss",
  },
  {
    id: 4, level: "LOW", location: "Perimeter Gate 2", time: "22m ago",
    title: "Perimeter Motion Drift",
    description: "Low-density movement near egress gate. Normal pedestrian flow pattern confirmed.",
  },
];

export default function IncidentFeed() {
  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      border: "1px solid rgba(226,220,212,0.9)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      minHeight: 480,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px",
        borderBottom: "1px solid #f1f5f9",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            padding: 6, borderRadius: 8,
            backgroundColor: "#fffbeb", border: "1px solid #fde68a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bell size={14} color="#d97706" />
          </div>
          <span style={{
            fontFamily: "var(--vx-serif)", fontSize: 17, fontWeight: 400,
            color: "#0f172a",
          }}>Active Incident Stream</span>
        </div>

        <span style={{
          fontFamily: "var(--vx-mono)", fontSize: 9, fontWeight: 700,
          padding: "3px 9px", borderRadius: 999,
          backgroundColor: "#fffbeb", color: "#92400e",
          border: "1px solid #fcd34d",
        }}>4 Pending</span>
      </div>

      {/* Incident list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {incidents.map(incident => (
          <IncidentItem key={incident.id} {...incident} />
        ))}
      </div>
    </div>
  );
}
