import { useState } from "react";
import { Play, Pause, RefreshCw, Bookmark, AlertTriangle, Maximize2, Sliders } from "lucide-react";

const PRESETS = ["01 Gate Overhead", "02 Turnstile Rank", "03 Plaza Concourse"];

export default function LiveFeedCard() {
  const [playing, setPlaying] = useState(true);
  const [preset, setPreset] = useState("02 Turnstile Rank");

  return (
    <div style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      border: "1px solid rgba(226,220,212,0.9)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 18px", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            width: 9, height: 9, borderRadius: "50%", backgroundColor: "#ef4444",
            display: "inline-block",
            animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
          }} />
          <span style={{
            fontFamily: "var(--vx-serif)", fontSize: 17, fontWeight: 400, color: "#0f172a",
          }}>Gate 3 – South Turnstiles</span>
          <span style={{
            fontFamily: "var(--vx-mono)", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.05em", textTransform: "uppercase",
            padding: "2px 8px", borderRadius: 4,
            backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0",
          }}>CAM_07_SOUTH_CONCOURSE</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 8,
            backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0",
            fontFamily: "var(--vx-mono)", fontSize: 10, color: "#64748b",
          }}>
            <Sliders size={12} color="#94a3b8" />
            <span style={{ fontWeight: 600 }}>Preset 03</span>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "5px 10px", borderRadius: 8,
            backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0",
            fontFamily: "var(--vx-mono)", fontSize: 10, color: "#64748b",
            cursor: "pointer",
          }}>
            <Maximize2 size={11} color="#94a3b8" />
            <span style={{ fontWeight: 600 }}>Expand</span>
          </button>
        </div>
      </div>

      {/* Video area */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", backgroundColor: "#0f172a", overflow: "hidden" }}>
        <img
          src="/crowd_feed.jpg"
          alt="Surveillance Live Feed"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.05) brightness(0.95)" }}
        />
        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(2,6,23,0.8) 0%, transparent 35%, rgba(2,6,23,0.55) 100%)",
          pointerEvents: "none",
        }} />

        {/* HUD top bar */}
        <div style={{
          position: "absolute", top: 10, left: 12, right: 12,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          zIndex: 10,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            backgroundColor: "rgba(2,6,23,0.8)", backdropFilter: "blur(6px)",
            padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--vx-mono)", fontSize: 10, color: "#e2e8f0",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
            <span style={{ fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>LIVE</span>
            <span style={{ color: "#475569" }}>|</span>
            <span>CAM 07</span>
            <span style={{ color: "#475569" }}>|</span>
            <span style={{ color: "#34d399", fontWeight: 700 }}>59.8 FPS</span>
            <span style={{ color: "#475569" }}>|</span>
            <span>4K H.265</span>
          </div>
          <div style={{
            backgroundColor: "rgba(2,6,23,0.8)", backdropFilter: "blur(6px)",
            padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--vx-mono)", fontSize: 10, color: "#94a3b8",
          }}>
            <span>YOLOv9 + CSRNet Density Map | </span>
            <span style={{ color: "#fbbf24", fontWeight: 700 }}>842 detected</span>
          </div>
        </div>

        {/* Bounding box overlays */}
        <div style={{
          position: "absolute", top: "38%", left: "34%", width: "18%", height: "28%",
          border: "2px solid rgba(52,211,153,0.8)", borderRadius: 4,
          backgroundColor: "rgba(52,211,153,0.08)", pointerEvents: "none",
          display: "flex", alignItems: "flex-start", padding: 3,
        }}>
          <span style={{
            backgroundColor: "#34d399", color: "#0f172a",
            fontFamily: "var(--vx-mono)", fontSize: 8, fontWeight: 700,
            padding: "1px 5px", borderRadius: 3,
          }}>NORM 0.21</span>
        </div>

        <div style={{
          position: "absolute", top: "42%", left: "52%", width: "22%", height: "32%",
          border: "2px solid #f97316", borderRadius: 4,
          backgroundColor: "rgba(249,115,22,0.12)", pointerEvents: "none",
          display: "flex", alignItems: "flex-start", padding: 3,
        }}>
          <span style={{
            backgroundColor: "#f97316", color: "#0f172a",
            fontFamily: "var(--vx-mono)", fontSize: 8, fontWeight: 700,
            padding: "1px 5px", borderRadius: 3,
          }}>SURGE 0.89</span>
        </div>

        <div style={{
          position: "absolute", top: "48%", left: "72%", width: "16%", height: "24%",
          border: "2px solid rgba(34,211,238,0.8)", borderRadius: 4,
          backgroundColor: "rgba(34,211,238,0.08)", pointerEvents: "none",
          display: "flex", alignItems: "flex-start", padding: 3,
        }}>
          <span style={{
            backgroundColor: "#22d3ee", color: "#0f172a",
            fontFamily: "var(--vx-mono)", fontSize: 8, fontWeight: 700,
            padding: "1px 5px", borderRadius: 3,
          }}>FLOW 0.62</span>
        </div>

        {/* Warning badge */}
        <div style={{
          position: "absolute", bottom: 48, right: 12, zIndex: 10,
          display: "flex", alignItems: "center", gap: 5,
          backgroundColor: "rgba(245,158,11,0.9)", backdropFilter: "blur(4px)",
          padding: "5px 12px", borderRadius: 8, border: "1px solid #fcd34d",
          fontFamily: "var(--vx-mono)", fontSize: 10, fontWeight: 700, color: "#0f172a",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        }}>
          <AlertTriangle size={12} color="#0f172a" />
          Flow Restriction Detected
        </div>

        {/* OSD bottom telemetry */}
        <div style={{
          position: "absolute", bottom: 10, left: 12, zIndex: 10,
          backgroundColor: "rgba(2,6,23,0.8)", backdropFilter: "blur(6px)",
          padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)",
          fontFamily: "var(--vx-mono)", fontSize: 9, color: "#94a3b8",
          lineHeight: 1.5,
        }}>
          <div>
            <span style={{ color: "#fbbf24", fontWeight: 700 }}>PTZ:</span>
            {" "}Pan 142.4° • Tilt -18.2° • Zoom 1.4x |{" "}
            <span style={{ color: "#34d399" }}>LAT: 12ms</span>
          </div>
          <div>Auto-Tracking: <span style={{ color: "#e2e8f0" }}>Engaged</span> | IR Filter: <span style={{ color: "#e2e8f0" }}>Auto (Day)</span></div>
        </div>
      </div>

      {/* Playback controls */}
      <div style={{ backgroundColor: "#0f172a", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Timeline */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--vx-mono)", fontSize: 9, color: "#64748b" }}>14:18:42</span>
          <div style={{
            flex: 1, height: 6, backgroundColor: "#1e293b", borderRadius: 999,
            overflow: "hidden", cursor: "pointer", position: "relative",
          }}>
            <div style={{ width: "78%", height: "100%", backgroundColor: "#334155", borderRadius: 999 }} />
            <div style={{
              position: "absolute", top: 0, right: "22%",
              width: 3, height: "100%", backgroundColor: "#ef4444", borderRadius: 999,
            }} />
          </div>
          <span style={{
            fontFamily: "var(--vx-mono)", fontSize: 9, fontWeight: 700, color: "#ef4444",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
            LIVE
          </span>
        </div>

        {/* Controls */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 6,
          paddingTop: 6, borderTop: "1px solid #1e293b",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[
              { label: playing ? "Pause" : "Play", icon: playing ? Pause : Play, action: () => setPlaying(p => !p) },
              { label: "-10x", icon: null, action: null },
              { label: "Sync Live", icon: RefreshCw, action: null },
              { label: "Flag Clip", icon: Bookmark, action: null },
            ].map(({ label, icon: Ic, action }) => (
              <button key={label} onClick={action} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 8px", borderRadius: 4, border: "none",
                backgroundColor: "#1e293b", color: "#94a3b8",
                fontFamily: "var(--vx-mono)", fontSize: 9, cursor: "pointer",
              }}>
                {Ic && <Ic size={10} color="#64748b" />}
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: "var(--vx-mono)", fontSize: 9, color: "#475569", marginRight: 2 }}>PTZ Presets:</span>
            {PRESETS.map(p => (
              <button key={p} onClick={() => setPreset(p)} style={{
                padding: "3px 7px", borderRadius: 4, border: "none",
                fontFamily: "var(--vx-mono)", fontSize: 9, cursor: "pointer",
                backgroundColor: preset === p ? "rgba(245,158,11,0.2)" : "#1e293b",
                color: preset === p ? "#fbbf24" : "#475569",
                fontWeight: preset === p ? 700 : 400,
                outline: preset === p ? "1px solid rgba(245,158,11,0.4)" : "none",
              }}>{p}</button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
