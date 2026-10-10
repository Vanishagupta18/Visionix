import React, { useState, useEffect } from "react";
import { Cpu, ShieldCheck } from "lucide-react";

const AI_URL = "http://localhost:8000";
const POLL_MS = 3000;

export default function ModelConfidencePanel({
  models = [],
  ensembleVersion = "v4.8 Ensemble",
}) {
  // ── Live AI status (YOLO + CSRNet asli data). Camera na ho to mock cards hi dikhte hain. ──
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`${AI_URL}/status`);
        const json = await res.json();
        if (alive) setAiStatus(json);
      } catch (e) {
        if (alive) setAiStatus(null);
      }
    };
    load();
    const t = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const r = aiStatus?.latestResult;
  const live = !!aiStatus && r?.cameraStatus === "connected";
  const dets = r?.detections || [];
  const avgConf = dets.length
    ? Math.round((dets.reduce((a, d) => a + d.confidence, 0) / dets.length) * 1000) / 10
    : null;
  const csrOn = r?.crowdMode === "CSRNET";
  const dens = Number(r?.density?.peoplePerSquareMeter ?? 0).toFixed(2);

  const shownModels = live
    ? models.map((m) => {
        if (m.id === "yolo") {
          return {
            ...m,
            modelName: "YOLOv8n (Subject Detection & Count)",
            confidence: avgConf,
            subtext: `${dets.length} individual persons detected in target zone`,
          };
        }
        if (m.id === "csrnet") {
          return {
            ...m,
            confidence: null, // CSRNet density map deta hai, confidence % nahi
            badge: csrOn ? "TRIGGER" : null,
            isTrigger: csrOn,
            subtext: csrOn
              ? `${dens} persons/m² (dense-crowd mode active)`
              : `Standby - activates at 40+ people (${dens} persons/m²)`,
          };
        }
        return m; // C3D / baaki abhi mock
      })
    : models;

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
        marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Cpu size={16} color="#475569" />
          <h2 style={{
            margin: 0,
            fontFamily: "var(--vx-sans)",
            fontSize: 15,
            fontWeight: 800,
            color: "#0f172a",
          }}>
            AI Model Confidence &amp; Multi-Head
          </h2>
        </div>

        <span style={{
          fontFamily: "var(--vx-mono)",
          fontSize: 10,
          fontWeight: 800,
          padding: "3px 8px",
          borderRadius: 6,
          backgroundColor: "#dcfce7",
          color: "#15803d",
          border: "1px solid #86efac",
        }}>
          {ensembleVersion}
        </span>
      </div>

      {/* ── Model Confidence Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shownModels.map((m) => {
          const isTrigger = m.isTrigger || m.badge === "TRIGGER";
          return (
            <div
              key={m.id || m.modelName}
              style={{
                backgroundColor: isTrigger ? "#fef2f2" : "#ffffff",
                border: isTrigger ? "1px solid #fca5a5" : "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "all 0.15s ease-in-out",
              }}
            >
              {/* Header: Title, Badge & Confidence % */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: "var(--vx-sans)",
                      fontSize: 12,
                      fontWeight: 800,
                      color: isTrigger ? "#991b1b" : "#0f172a",
                    }}>
                      {m.modelName}
                    </span>

                    {m.badge && (
                      <span style={{
                        fontFamily: "var(--vx-mono)",
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 4,
                        backgroundColor: isTrigger ? "#dc2626" : "#e2e8f0",
                        color: "#ffffff",
                        letterSpacing: "0.03em",
                      }}>
                        {m.badge}
                      </span>
                    )}
                  </div>

                  <p style={{
                    margin: "3px 0 0 0",
                    fontFamily: "var(--vx-sans)",
                    fontSize: 11,
                    color: isTrigger ? "#b91c1c" : "#64748b",
                    lineHeight: 1.3,
                  }}>
                    {m.subtext}
                  </p>
                </div>

                {/* Big Confidence % */}
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontFamily: "var(--vx-sans)",
                    fontSize: 18,
                    fontWeight: 800,
                    color: isTrigger ? "#dc2626" : "#0f172a",
                    lineHeight: 1,
                  }}>
                    {m.confidence === null || m.confidence === undefined ? "N/A" : `${m.confidence}%`}
                  </div>
                  <div style={{
                    fontFamily: "var(--vx-sans)",
                    fontSize: 10,
                    color: "#94a3b8",
                    marginTop: 2,
                  }}>
                    Confidence
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                height: 5,
                width: "100%",
                borderRadius: 999,
                backgroundColor: isTrigger ? "#fecaca" : "#f1f5f9",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${m.confidence ?? 0}%`,
                  borderRadius: 999,
                  backgroundColor: isTrigger ? "#dc2626" : m.color || "#2563eb",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}