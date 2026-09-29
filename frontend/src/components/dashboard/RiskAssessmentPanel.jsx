import { ShieldAlert, Clock } from "lucide-react";
import RiskBadge from "../common/RiskBadge";
import { formatTime } from "../../utils/analytics";

const RISK_LABEL_MAP = { Safe: "LOW", Warning: "MEDIUM", "High Risk": "HIGH", Critical: "CRITICAL" };
const RISK_COLOR = { Safe: "#22c55e", Warning: "#f59e0b", "High Risk": "#f97316", Critical: "#ef4444" };

// Mirrors the actual bands in ai-service/risk/risk_engine.py (DENSITY_SAFE=2,
// DENSITY_WARNING=4, DENSITY_CRITICAL=5 people/m²) - not a separate formula.
function explainRisk(label, peoplePerSqm) {
  if (peoplePerSqm == null) return null;
  const d = peoplePerSqm.toFixed(2);
  switch (label) {
    case "Safe":
      return `${d} people/m² — comfortable density, under the 2/m² threshold.`;
    case "Warning":
      return `${d} people/m² — busy but manageable (2–4/m² range).`;
    case "High Risk":
      return `${d} people/m² — crowd flow beginning to fail (4–5/m² range).`;
    case "Critical":
      return `${d} people/m² — above 5/m², crowd turbulence risk.`;
    default:
      return null;
  }
}

export default function RiskAssessmentPanel({ result, stale }) {
  const risk = result?.risk;
  const breakdown = risk?.breakdown;
  const color = RISK_COLOR[risk?.label] || "#94a3b8";

  return (
    <div style={{
      backgroundColor: "#fff", borderRadius: 16, border: "1px solid rgba(226,220,212,0.9)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ShieldAlert size={14} color="#64748b" />
        <span style={{ fontFamily: "var(--vx-sans)", fontSize: 10, fontWeight: 600, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>Current Risk Assessment</span>
      </div>

      {!risk ? (
        <p style={{ fontFamily: "var(--vx-mono)", fontSize: 11, color: "#94a3b8" }}>No inference data yet.</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RiskBadge level={RISK_LABEL_MAP[risk.label] || "LOW"} />
            <span style={{ fontFamily: "var(--vx-serif)", fontSize: 28, color: "#0f172a" }}>
              {Math.round(risk.score)}%
            </span>
          </div>

          <div style={{ width: "100%", height: 6, backgroundColor: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, risk.score)}%`, height: "100%", backgroundColor: color, borderRadius: 999 }} />
          </div>

          {breakdown && (
            <p style={{ fontFamily: "var(--vx-sans)", fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              {explainRisk(risk.label, breakdown.people_per_sqm)}
            </p>
          )}

          {breakdown && (
            <div style={{ display: "flex", gap: 16, fontFamily: "var(--vx-mono)", fontSize: 10, color: "#94a3b8" }}>
              <span>Density score: {breakdown.density_score?.toFixed?.(1) ?? "N/A"}</span>
              <span>Zone area: {breakdown.zone_area_sqm} m²</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 6, borderTop: "1px solid #f1f5f9" }}>
            <Clock size={11} color="#94a3b8" />
            <span style={{ fontFamily: "var(--vx-mono)", fontSize: 10, color: stale ? "#f59e0b" : "#94a3b8" }}>
              {formatTime(result.timestamp)}{stale ? " — not updating" : ""}
            </span>
          </div>
        </>
      )}
    </div>
  );
}