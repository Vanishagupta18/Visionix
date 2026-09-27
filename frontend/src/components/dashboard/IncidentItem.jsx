import RiskBadge from "../common/RiskBadge";
import { ChevronRight, Video, UserPlus } from "lucide-react";

const levelBorder = {
  CRITICAL: { borderColor: "#fecaca", backgroundColor: "rgba(254,202,202,0.15)" },
  HIGH:     { borderColor: "#fed7aa", backgroundColor: "rgba(254,215,170,0.15)" },
  MEDIUM:   { borderColor: "#fde68a", backgroundColor: "rgba(253,230,138,0.1)"  },
  LOW:      { borderColor: "#e2e8f0", backgroundColor: "#fff" },
};

export default function IncidentItem({
  level = "CRITICAL", location = "", time = "", title = "",
  description = "", actions = [], telemetry, triageLink,
}) {
  const lvl = level.toUpperCase();
  const borders = levelBorder[lvl] || levelBorder.LOW;

  return (
    <div style={{
      borderRadius: 12,
      border: `1px solid ${borders.borderColor}`,
      backgroundColor: borders.backgroundColor,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RiskBadge level={lvl} />
          <span style={{
            fontFamily: "var(--vx-mono)", fontSize: 10, fontWeight: 600, color: "#374151",
          }}>{location}</span>
        </div>
        <span style={{
          fontFamily: "var(--vx-mono)", fontSize: 10, color: "#ef4444", fontWeight: 500,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>{time}</span>
      </div>

      {/* Title */}
      <p style={{
        fontFamily: "var(--vx-sans)", fontSize: 12, fontWeight: 700,
        color: "#0f172a", margin: 0, lineHeight: 1.3,
      }}>{title}</p>

      {/* Description */}
      <p style={{
        fontFamily: "var(--vx-sans)", fontSize: 11, color: "#64748b",
        margin: 0, lineHeight: 1.5,
      }}>{description}</p>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          paddingTop: 6, borderTop: "1px solid rgba(241,245,249,0.8)",
          flexWrap: "wrap",
        }}>
          {actions.map((label, i) => (
            <button key={i} style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px", borderRadius: 8, border: "none",
              cursor: "pointer",
              backgroundColor: i === 0 ? "#0f172a" : "#fff",
              color: i === 0 ? "#fff" : "#374151",
              border: i === 0 ? "none" : "1px solid #e2e8f0",
              fontFamily: "var(--vx-mono)", fontSize: 10, fontWeight: 600,
            }}>
              {i === 0 ? <Video size={10} /> : <UserPlus size={10} />}
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Telemetry footer */}
      {telemetry && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 6, borderTop: "1px solid rgba(241,245,249,0.8)",
          fontFamily: "var(--vx-mono)", fontSize: 10, color: "#94a3b8",
        }}>
          <span>{telemetry}</span>
          {triageLink && (
            <button style={{
              display: "flex", alignItems: "center", gap: 2,
              border: "none", background: "none",
              fontFamily: "var(--vx-mono)", fontSize: 10,
              fontWeight: 700, color: "#92400e", cursor: "pointer",
            }}>
              {triageLink} <ChevronRight size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
