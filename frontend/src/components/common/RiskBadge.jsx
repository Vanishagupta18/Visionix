export default function RiskBadge({ level = "MEDIUM" }) {
  const lvl = level.toUpperCase();

  const map = {
    CRITICAL: { bg: "rgba(239,68,68,0.15)",  border: "#fca5a5", color: "#dc2626", dot: "#ef4444" },
    ELEVATED: { bg: "rgba(245,158,11,0.15)", border: "#fcd34d", color: "#b45309", dot: "#f59e0b" },
    HIGH:     { bg: "rgba(249,115,22,0.15)", border: "#fdba74", color: "#c2410c", dot: "#f97316" },
    MEDIUM:   { bg: "rgba(234,179,8,0.12)",  border: "#fde047", color: "#854d0e", dot: "#eab308" },
    LOW:      { bg: "rgba(34,197,94,0.12)",  border: "#86efac", color: "#15803d", dot: "#22c55e" },
  };

  const s = map[lvl] || map.MEDIUM;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 9px", borderRadius: 999,
      backgroundColor: s.bg, border: `1px solid ${s.border}`,
      fontFamily: "var(--vx-mono)", fontSize: 9, fontWeight: 700,
      letterSpacing: "0.07em", textTransform: "uppercase", color: s.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        backgroundColor: s.dot, display: "inline-block",
        flexShrink: 0,
      }} />
      {lvl}
    </span>
  );
}
