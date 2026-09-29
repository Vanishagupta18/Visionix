import { useEffect, useState } from "react";
import {
  Play,
  Square,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const RISK_COLOR = {
  Safe: "#22c55e",
  Warning: "#f59e0b",
  "High Risk": "#f97316",
  Critical: "#ef4444",
};

export default function LiveFeedCard({
  zoneName = "Default Zone",
  streamUrl,
  connected = false,
  count,
  status,
  countSource,
  riskScore,
  riskLabel,
  onStart,
  onStop,
}) {
  // The stream is visible by default because the AI endpoint is working.
  const [streamActive, setStreamActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const [streamError, setStreamError] = useState("");

  // Sync with backend connection when it reports a successful connection.
  useEffect(() => {
    if (connected) {
      setStreamActive(true);
    }
  }, [connected]);

  const handleStart = async () => {
    setBusy(true);
    setStreamError("");

    try {
      await onStart?.();
      setStreamActive(true);
      setStreamKey((key) => key + 1);
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      setStreamError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not start monitoring. Check the backend."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleStop = async () => {
    setBusy(true);
    setStreamError("");

    try {
      await onStop?.();
      setStreamActive(false);
    } catch (error) {
      console.error("Failed to stop monitoring:", error);
      setStreamError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not stop monitoring. Check the backend."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleReconnect = () => {
    setStreamError("");
    setStreamActive(true);
    setStreamKey((key) => key + 1);
  };

  const riskColor = RISK_COLOR[riskLabel] || "#94a3b8";

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(226,220,212,0.9)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: streamActive ? "#22c55e" : "#94a3b8",
              display: "inline-block",
            }}
          />

          <span
            style={{
              fontFamily: "var(--vx-serif)",
              fontSize: 17,
              color: "#0f172a",
            }}
          >
            {zoneName}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={streamActive ? handleStop : handleStart}
            disabled={busy}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              borderRadius: 8,
              backgroundColor: streamActive ? "#fef2f2" : "#f0fdf4",
              border: `1px solid ${
                streamActive ? "#fca5a5" : "#86efac"
              }`,
              color: streamActive ? "#dc2626" : "#15803d",
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {streamActive ? (
              <Square size={12} />
            ) : (
              <Play size={12} />
            )}

            {busy
              ? "Please wait..."
              : streamActive
                ? "Stop"
                : "Start"}
          </button>

          <button
            onClick={handleReconnect}
            disabled={busy || !streamUrl}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 10px",
              borderRadius: 8,
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={12} />
            Reconnect
          </button>
        </div>
      </div>

      {/* Camera feed */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          backgroundColor: "#0f172a",
          overflow: "hidden",
        }}
      >
        {streamActive && streamUrl ? (
          <img
            key={streamKey}
            src={streamUrl}
            alt="Live camera feed"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
            onError={() => {
              setStreamError(
                "Unable to load the camera feed. Check whether the AI stream is running."
              );
            }}
            onLoad={() => setStreamError("")}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#94a3b8",
            }}
          >
            <AlertTriangle size={24} />
            <span>
              {streamActive
                ? "Waiting for camera feed..."
                : "Stream stopped"}
            </span>
          </div>
        )}

        {/* Stream status */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            zIndex: 2,
            backgroundColor: "rgba(2,6,23,0.85)",
            padding: "5px 10px",
            borderRadius: 6,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            pointerEvents: "none",
          }}
        >
          {streamActive ? "● LIVE" : "● OFFLINE"}
        </div>

        {/* Detection count */}
        {streamActive && (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              zIndex: 2,
              backgroundColor: "rgba(2,6,23,0.85)",
              padding: "5px 10px",
              borderRadius: 6,
              color: "#fbbf24",
              fontSize: 11,
              fontWeight: 700,
              pointerEvents: "none",
            }}
          >
            {countSource || "YOLO"} | {count ?? "—"} detected
          </div>
        )}

        {/* Risk information */}
        {streamActive && riskLabel && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              zIndex: 2,
              backgroundColor: "rgba(2,6,23,0.9)",
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${riskColor}`,
              color: riskColor,
              fontSize: 11,
              fontWeight: 700,
              pointerEvents: "none",
            }}
          >
            Risk:{" "}
            {riskScore != null ? `${Math.round(riskScore)}%` : "—"}
            {" "}({riskLabel})
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#0f172a",
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          color: "#94a3b8",
          fontSize: 11,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span>Status: {status || "—"}</span>
          <span>
            {streamActive ? "AI stream enabled" : "Stream stopped"}
          </span>
        </div>

        {streamError && (
          <div
            style={{
              color: "#fca5a5",
              overflowWrap: "anywhere",
            }}
          >
            {streamError}
          </div>
        )}
      </div>
    </div>
  );
}