import IncidentItem from "./IncidentItem";
import { Bell } from "lucide-react";

const SEVERITY_MAP = {
  Critical: "CRITICAL",
  "High Risk": "HIGH",
  Dangerous: "CRITICAL",
  Warning: "MEDIUM",
  Crowded: "MEDIUM",
  Safe: "LOW",
};

function normalizeAlerts(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.alerts)) return value.alerts;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;

  return [];
}

function timeAgo(iso) {
  if (!iso) return "";

  const timestamp = new Date(iso).getTime();

  if (!Number.isFinite(timestamp)) return "";

  const diffMs = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) return `${hrs}h ago`;

  return `${Math.floor(hrs / 24)}d ago`;
}

export default function IncidentFeed({ alerts: rawAlerts = [] }) {
  const alerts = normalizeAlerts(rawAlerts);

  const activeCount = alerts.filter(
    (alert) => alert?.status === "active"
  ).length;

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(226,220,212,0.9)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        minHeight: 480,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid #f1f5f9",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              padding: 6,
              borderRadius: 8,
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={14} color="#d97706" />
          </div>

          <span
            style={{
              fontFamily: "var(--vx-serif)",
              fontSize: 17,
              fontWeight: 400,
              color: "#0f172a",
            }}
          >
            Active Incident Stream
          </span>
        </div>

        <span
          style={{
            fontFamily: "var(--vx-mono)",
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 9px",
            borderRadius: 999,
            backgroundColor: "#fffbeb",
            color: "#92400e",
            border: "1px solid #fcd34d",
          }}
        >
          {activeCount} Active
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {alerts.length === 0 && (
          <p
            style={{
              fontFamily: "var(--vx-mono)",
              fontSize: 11,
              color: "#94a3b8",
              textAlign: "center",
              padding: "24px 0",
            }}
          >
            No incidents recorded yet.
          </p>
        )}

        {alerts.map((alert, index) => (
          <IncidentItem
            key={alert?._id ?? `alert-${index}`}
            level={SEVERITY_MAP[alert?.severity] || "MEDIUM"}
            location={alert?.zone?.name || "Unknown zone"}
            time={timeAgo(alert?.createdAt)}
            title={
              alert?.severity
                ? `${alert.severity} crowd level`
                : "Alert"
            }
            description={alert?.message || "No additional details."}
          />
        ))}
      </div>
    </div>
  );
}