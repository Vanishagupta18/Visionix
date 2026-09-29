import { Layers, Cpu, Clock, Activity } from "lucide-react";
import { classCounts, averageConfidence, formatMs, formatTime } from "../../utils/analytics";

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 0" }}>
      <span style={{ fontFamily: "var(--vx-mono)", fontSize: 10, color: "#64748b" }}>{label}</span>
      <span style={{ fontFamily: "var(--vx-mono)", fontSize: 10, fontWeight: 600, color: "#0f172a" }}>{value}</span>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
      <Icon size={12} color="#94a3b8" />
      <span style={{ fontFamily: "var(--vx-sans)", fontSize: 10, fontWeight: 700, color: "#374151",
        textTransform: "uppercase", letterSpacing: "0.04em" }}>{children}</span>
    </div>
  );
}

const muted = { fontFamily: "var(--vx-mono)", fontSize: 10, color: "#94a3b8", margin: "2px 0" };

export default function AnalyticsPanel({ result, wsConnected, stale }) {
  const detections = result?.detections || [];
  const objectDetections = result?.objectDetections || [];
  const counts = classCounts(detections);
  const avgConf = averageConfidence(detections);

  return (
    <div style={{
      backgroundColor: "#fff", borderRadius: 16, border: "1px solid rgba(226,220,212,0.9)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Layers size={14} color="#64748b" />
          <span style={{ fontFamily: "var(--vx-serif)", fontSize: 17, color: "#0f172a" }}>Detailed AI Analytics</span>
        </div>
        <span style={{
          fontFamily: "var(--vx-mono)", fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
          backgroundColor: wsConnected && !stale ? "#f0fdf4" : "#fef2f2",
          color: wsConnected && !stale ? "#15803d" : "#dc2626",
          border: `1px solid ${wsConnected && !stale ? "#86efac" : "#fca5a5"}`,
        }}>
          {wsConnected ? (stale ? "Stale" : "Live") : "Disconnected"}
        </span>
      </div>

      {!result ? (
        <p style={{ ...muted, padding: "24px 18px", textAlign: "center" }}>Waiting for the first inference result…</p>
      ) : (
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

          <div>
            <SectionLabel icon={Cpu}>Pipeline status</SectionLabel>
            <Row label="Count source" value={result.countSource || "N/A"} />
            <Row label="Crowd mode" value={result.crowdMode || "N/A"} />
            <Row label="CSRNet model" value={result.csrnetAvailable ? "Loaded" : "Unavailable (no checkpoint)"} />
            <Row label="Object/weapon model" value={result.objectDetectionAvailable ? "Loaded" : "Not available (no weights)"} />
          </div>

          <div>
            <SectionLabel icon={Activity}>Detections this frame</SectionLabel>
            {Object.keys(counts).length === 0 ? (
              <p style={muted}>No detections in the latest frame.</p>
            ) : (
              Object.entries(counts).map(([cls, n]) => (
                <Row key={cls} label={cls} value={`${n} detected`} />
              ))
            )}
            <Row
              label="Avg. detection confidence"
              value={avgConf != null ? `${(avgConf * 100).toFixed(1)}% (this frame, n=${detections.length})` : "N/A"}
            />
          </div>

          <div>
            <SectionLabel icon={Layers}>Object / weapon detections</SectionLabel>
            {!result.objectDetectionAvailable ? (
              <p style={muted}>Disabled — no object-detection weights loaded.</p>
            ) : objectDetections.length === 0 ? (
              <p style={muted}>No objects detected.</p>
            ) : (
              objectDetections.map((d, i) => (
                <Row key={i} label={d.className} value={`${(d.confidence * 100).toFixed(1)}%`} />
              ))
            )}
          </div>

          <div>
            <SectionLabel icon={Cpu}>Inference timing</SectionLabel>
            <Row label="YOLO" value={formatMs(result.inference?.yoloMs)} />
            <Row label="CSRNet" value={formatMs(result.inference?.csrnetMs)} />
            <Row label="Object detection" value={formatMs(result.inference?.objectDetectionMs)} />
            <Row label="Total" value={formatMs(result.inference?.totalInferenceMs)} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
            <Clock size={11} color="#94a3b8" />
            <span style={{ ...muted, color: stale ? "#f59e0b" : "#94a3b8" }}>
              Last inference: {formatTime(result.timestamp)}{stale ? " — not updating" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}