export default function OfficerPanel({
  name = "Officer Elena Vance",
  role = "Shift Lead - Station 04",
  initials = "EV",
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 12px", borderRadius: 12,
      backgroundColor: "#f8f4ee", border: "1px solid rgba(226,220,212,0.9)",
    }}>
      {/* Avatar */}
      <div style={{
        width: 34, height: 34, borderRadius: "50%",
        backgroundColor: "#065f46", color: "#d1fae5",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--vx-mono)", fontSize: 11, fontWeight: 700,
        flexShrink: 0, position: "relative",
      }}>
        {initials}
        <span style={{
          position: "absolute", bottom: 0, right: 0,
          width: 9, height: 9, borderRadius: "50%",
          backgroundColor: "#22c55e", border: "2px solid #f8f4ee",
        }} />
      </div>

      {/* Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{
          fontFamily: "var(--vx-sans)", fontSize: 11, fontWeight: 700,
          color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{name}</span>
        <span style={{
          fontFamily: "var(--vx-mono)", fontSize: 9, color: "#94a3b8",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{role}</span>
      </div>
    </div>
  );
}
