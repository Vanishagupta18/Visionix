import { Video, Wifi, WifiOff, Cpu } from "lucide-react";
import { formatTime } from "../../utils/analytics";

function StatusRow({ label, ok, okText, badText, icon: Icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "var(--vx-mono)", fontSize: 10, color: "#64748b" }}>{label}</span>
      <span style={{
        display: "flex", alignItems: "center", gap: 4,
        fontFamily: "var(--vx-mono)", fontSize: 10, fontWeight: 700,
        color: ok ? "#15803d" : "#dc2626",
      }}>
        <Icon size={11} />
        {ok ? okText : badText}
      </span>
    </div>
  );
}

export default function CameraStatusCard({ result, wsConnected, stale }) {
  const cameraConnected = result?.cameraStatus === "connected";
  const inferenceHealthy = wsConnected && !stale;

  return (
    <div style={{
      backgroundColor: "#fff", borderRadius: 16, border: "1px solid rgba(226,220,212,0.9)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Video size={14} color="#64748b" />
        <span style={{ fontFamily: "var(--vx-sans)", fontSize: 10, fontWeight: 600, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.06em" }}>Camera & Inference Status</span>
      </div>

      <StatusRow label="Camera" ok={cameraConnected} okText="Connected" badText="Disconnected" icon={Video} />
      <StatusRow label="Analytics stream" ok={wsConnected} okText="Connected" badText="Disconnected" icon={wsConnected ? Wifi : WifiOff} />
      <StatusRow label="Inference" ok={inferenceHealthy} okText="Live" badText={stale ? "Stale (not updating)" : "Not receiving"} icon={Cpu} />

      <div style={{ paddingTop: 6, borderTop: "1px solid #f1f5f9",
        fontFamily: "var(--vx-mono)", fontSize: 9, color: "#94a3b8" }}>
        Last update: {formatTime(result?.timestamp)}
      </div>
    </div>
  );
}