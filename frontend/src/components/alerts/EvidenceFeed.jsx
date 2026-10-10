import React from "react";
import { Maximize2, Video } from "lucide-react";

export default function EvidenceFeed({ feedData }) {
  const {
    title = "Optical Evidence Feed - Turnstile Bank 03",
    fps = "60 FPS",
    fov = "114° ULTRA-WIDE",
    imageSrc = "/crowd_feed.jpg",
    cameraDetails = "Camera 03 (South Concourse) - 2024-10-25 14:26:18 UTC - Resolution 3840x2160 - ISO 400 - Shutter 1/250s",
    statusBadge = "AI PIPELINE ACTIVE",
    videoOverlayHeader = "0-25 14:44:32 CST - STADIUM ENTRANCE",
    densityBanner = "CRITICAL SURGE DENSITY ZONE: 1.38 p/m²",
    detailTag = "30C - 0.96",
    stallBanner = "⚡ VECTOR STALL - -0.42 m/s",
    showOverlayBoxes = true,
  } = feedData || {};

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: 16,
      border: "1px solid rgba(226,220,212,0.9)",
      padding: "18px 20px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      marginBottom: 20,
    }}>
      {/* ── Top Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#dc2626" }} />
          <h2 style={{
            margin: 0,
            fontFamily: "var(--vx-sans)",
            fontSize: 15,
            fontWeight: 800,
            color: "#0f172a",
          }}>
            {title}
          </h2>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--vx-mono)",
          fontSize: 11,
          fontWeight: 700,
          color: "#64748b",
        }}>
          <span>REC {fps}</span>
          <span>|</span>
          <span>FOV: {fov}</span>
          <button style={{ border: "none", background: "none", cursor: "pointer", padding: 2 }}>
            <Maximize2 size={14} color="#64748b" />
          </button>
        </div>
      </div>

      {/* ── Video / Evidence Display Screen ── */}
      <div style={{
        position: "relative",
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#090d16",
        minHeight: 380,
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
      }}>
        {/* Background Footage Image */}
        <img
          src={imageSrc}
          alt="CCTV Evidence Feed"
          style={{
            width: "100%",
            height: "100%",
            minHeight: 380,
            maxHeight: 460,
            objectFit: "cover",
            display: "block",
            filter: "brightness(0.92) contrast(1.05)",
          }}
        />

        {/* Top-Left Camera OSD Timestamp */}
        <div style={{
          position: "absolute",
          top: 14,
          left: 14,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          color: "#ffffff",
          fontFamily: "var(--vx-mono)",
          fontSize: 11,
          fontWeight: 700,
          padding: "4px 8px",
          borderRadius: 4,
          letterSpacing: "0.04em",
          border: "1px solid rgba(255,255,255,0.15)",
        }}>
          {videoOverlayHeader}
        </div>

        {/* ── Detection Box 1: Critical Density Zone ──
            Live data mein hide (showOverlayBoxes=false): asli YOLO boxes video mein pehle se hain */}
        {showOverlayBoxes && (
          <div style={{
            position: "absolute",
            top: "28%",
            left: "24%",
            width: "48%",
            height: "36%",
            border: "2px solid #ef4444",
            borderRadius: 6,
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            boxShadow: "0 0 12px rgba(239, 68, 68, 0.4)",
            pointerEvents: "none",
          }}>
            {/* Label Badge 1 */}
            <div style={{
              position: "absolute",
              top: -12,
              left: 10,
              backgroundColor: "#0284c7",
              color: "#ffffff",
              fontFamily: "var(--vx-mono)",
              fontSize: 9,
              fontWeight: 800,
              padding: "1px 6px",
              borderRadius: 3,
              letterSpacing: "0.03em",
            }}>
              PERSON
            </div>

            {/* Critical Surge Banner */}
            <div style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#b91c1c",
              color: "#ffffff",
              fontFamily: "var(--vx-mono)",
              fontSize: 11,
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: 4,
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              whiteSpace: "nowrap",
            }}>
              {densityBanner}
            </div>

            {/* Small Tag */}
            <div style={{
              position: "absolute",
              bottom: 10,
              left: 12,
              backgroundColor: "rgba(15, 23, 42, 0.85)",
              color: "#38bdf8",
              fontFamily: "var(--vx-mono)",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 3,
            }}>
              {detailTag}
            </div>
          </div>
        )}

        {/* ── Detection Box 2: Vector Stall (sirf tab dikhega jab data mein stallBanner ho) ── */}
        {showOverlayBoxes && stallBanner && (
          <div style={{
            position: "absolute",
            top: "54%",
            left: "45%",
            width: "28%",
            height: "22%",
            border: "2px solid #f59e0b",
            borderRadius: 6,
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            pointerEvents: "none",
          }}>
            <div style={{
              position: "absolute",
              top: -12,
              left: 10,
              backgroundColor: "#d97706",
              color: "#ffffff",
              fontFamily: "var(--vx-mono)",
              fontSize: 10,
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: 4,
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              whiteSpace: "nowrap",
            }}>
              {stallBanner}
            </div>
          </div>
        )}

        {/* Bottom OSD Bar over Video */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(9, 13, 22, 0.90)",
          backdropFilter: "blur(6px)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{
            fontFamily: "var(--vx-mono)",
            fontSize: 10,
            color: "#cbd5e1",
            fontWeight: 500,
          }}>
            {cameraDetails}
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--vx-mono)",
            fontSize: 10,
            fontWeight: 800,
            color: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.15)",
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid rgba(34, 197, 94, 0.3)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e" }} />
            <span>{statusBadge}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
