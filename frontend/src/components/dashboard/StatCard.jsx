import RiskBadge from "../common/RiskBadge";

const card = {
  backgroundColor: "#fff",
  borderRadius: 16,
  border: "1px solid rgba(226,220,212,0.9)",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  padding: "16px 18px",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

export default function StatCard({
  title, icon: Icon, value, unit, trend, trendPositive = true,
  badge, badgeColor = "amber", subtext, progressBar, specs, riskLevel,
}) {
  return (
    <div style={card}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "var(--vx-sans)", fontSize: 10, fontWeight: 600,
          color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em",
        }}>{title}</span>
        {Icon && <Icon size={14} color="#94a3b8" />}
      </div>

      {/* Value row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {riskLevel ? (
          <RiskBadge level={riskLevel} />
        ) : (
          <span style={{
            fontFamily: "var(--vx-serif)", fontSize: 36, fontWeight: 400,
            color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1,
          }}>{value}</span>
        )}

        {unit && (
          <span style={{ fontFamily: "var(--vx-mono)", fontSize: 11, color: "#94a3b8" }}>{unit}</span>
        )}

        {trend && (
          <span style={{
            fontFamily: "var(--vx-mono)", fontSize: 10, fontWeight: 600,
            padding: "2px 8px", borderRadius: 999,
            backgroundColor: trendPositive ? "#f0fdf4" : "#fef2f2",
            color: trendPositive ? "#15803d" : "#dc2626",
          }}>{trend}</span>
        )}

        {badge && (
          <span style={{
            fontFamily: "var(--vx-mono)", fontSize: 9, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.05em",
            padding: "2px 9px", borderRadius: 999,
            backgroundColor: badgeColor === "amber" ? "#fef3c7" : badgeColor === "red" ? "#fee2e2" : "#d1fae5",
            color: badgeColor === "amber" ? "#92400e" : badgeColor === "red" ? "#991b1b" : "#065f46",
            border: `1px solid ${badgeColor === "amber" ? "#fcd34d" : badgeColor === "red" ? "#fca5a5" : "#6ee7b7"}`,
          }}>{badge}</span>
        )}
      </div>

      {/* Progress bar */}
      {progressBar !== undefined && (
        <div style={{ width: "100%", height: 5, backgroundColor: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${progressBar}%`, height: "100%", backgroundColor: "#22c55e", borderRadius: 999 }} />
        </div>
      )}

      {/* Specs */}
      {specs && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "var(--vx-mono)", fontSize: 9, color: "#94a3b8",
          paddingTop: 8, marginTop: 2, borderTop: "1px solid #f1f5f9",
        }}>
          <span>{specs.left}</span>
          <span style={{ fontWeight: 600, color: "#64748b" }}>{specs.right}</span>
        </div>
      )}

      {/* Subtext */}
      {subtext && !specs && (
        <p style={{
          fontFamily: "var(--vx-mono)", fontSize: 9, color: "#94a3b8",
          margin: 0, lineHeight: 1.4,
        }}>{subtext}</p>
      )}
    </div>
  );
}
