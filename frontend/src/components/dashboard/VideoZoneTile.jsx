import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const iconBtnStyle = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 24, height: 24, borderRadius: 6, border: "none", cursor: "pointer",
  backgroundColor: "rgba(2,6,23,0.75)", color: "#fff",
};

// Plays a real local video file (or an MJPEG <img> when isMjpeg is true, for
// the one actual live camera). No fabricated FPS/PTZ/confidence overlays -
// detectedCount is only shown if the caller actually passes a real number.
//
// onSelect (optional): makes the tile clickable, for use as a thumbnail
// that switches a separate "main feed" view - see Cameras.jsx.
export default function VideoZoneTile({
  zoneName, videoSrc, isMjpeg = false, live = false, detectedCount,
  onSelect, active = false,
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  return (
    <div
      onClick={onSelect}
      style={{
        backgroundColor: "#fff", borderRadius: 12,
        border: active ? "2px solid #0f172a" : "1px solid rgba(226,220,212,0.9)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden",
        cursor: onSelect ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px" }}>
        <span style={{ fontFamily: "var(--vx-sans)", fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
          {zoneName}
        </span>
        <span style={{
          fontFamily: "var(--vx-mono)", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
          backgroundColor: live ? "#fef2f2" : "#f1f5f9", color: live ? "#dc2626" : "#64748b",
        }}>
          {live ? "LIVE" : "Recorded footage"}
        </span>
      </div>

      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", backgroundColor: "#0f172a" }}>
        {isMjpeg ? (
          <img src={videoSrc} alt={zoneName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted={muted}
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {typeof detectedCount === "number" && (
          <div style={{
            position: "absolute", bottom: 8, left: 8,
            backgroundColor: "rgba(2,6,23,0.75)", padding: "3px 8px", borderRadius: 6,
            fontFamily: "var(--vx-mono)", fontSize: 10, color: "#fbbf24", fontWeight: 700,
          }}>
            {detectedCount} detected
          </div>
        )}

        {!isMjpeg && (
          <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6 }}>
            <button onClick={togglePlay} style={iconBtnStyle}>
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }} style={iconBtnStyle}>
              {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}