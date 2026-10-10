import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import AlertHeader from "../components/alerts/AlertHeader";
import IncidentSummary from "../components/alerts/IncidentSummary";
import EvidenceFeed from "../components/alerts/EvidenceFeed";
import ModelConfidencePanel from "../components/alerts/ModelConfidencePanel";
import TemporalForensicScrub from "../components/alerts/TemporalForensicScrub";
import EventTimeline from "../components/alerts/EventTimeline";
import { incidentDetailData as defaultData } from "../components/alerts/alertsData";
import { buildIncidentData } from "../components/alerts/buildIncidentData";
import alertService from "../services/alertService"; // path apne api.js ke folder ke hisaab se check karo

const POLL_MS = 3000;

export default function Alerts() {
  const [activeNav, setActiveNav] = useState("Alerts");
  const [liveAlert, setLiveAlert] = useState(null);
  const navigate = useNavigate();
    const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    const loadAI = async () => {
      try {
        const res = await fetch("http://localhost:8000/status");
        setAiStatus(await res.json());
      } catch (e) {
        setAiStatus(null);
      }
    };
    loadAI();
    const t = setInterval(loadAI, 3000);
    return () => clearInterval(t);
  }, []);

  const r = aiStatus?.latestResult;
  const live = !!aiStatus && r?.cameraStatus === "connected";
  const dets = r?.detections || [];
  const avgConf = dets.length
    ? Math.round((dets.reduce((a, d) => a + d.confidence, 0) / dets.length) * 1000) / 10
    : null;
  const csrOn = r?.crowdMode === "CSRNET";
  const dens = Number(r?.density?.peoplePerSquareMeter ?? 0).toFixed(2);

  
  const { id } = useParams(); // /incident/:id ho to wahi alert, warna latest

  const load = useCallback(async () => {
    try {
      let a = null;
      if (id) {
        const res = await alertService.getAlert(id);
        a = res.data;
      } else {
        const active = await alertService.getAlerts("active");
        a = active.data?.[0] || null;
        if (!a) {
          const all = await alertService.getAlerts();
          a = all.data?.[0] || null;
        }
      }
      setLiveAlert(a);
    } catch (e) {
      // backend na mile to purana interface hi dikhta rahega
      setLiveAlert(null);
    }
  }, [id]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  // live alert ho to asli data, warna tumhara purana interface
  const isLive = !!liveAlert;
  const data = isLive ? buildIncidentData(liveAlert) : defaultData;

  const handleBack = () => navigate(-1);

  const handleDismiss = async () => {
    if (!isLive) return window.alert("Demo data: abhi koi live alert nahi hai.");
    try {
      await alertService.dismiss(data.alertId);
      await load();
    } catch (e) {
      window.alert("Dismiss nahi ho paya.");
    }
  };

  const handleAcknowledge = async () => {
    if (!isLive) return window.alert("Demo data: abhi koi live alert nahi hai.");
    try {
      await alertService.acknowledge(data.alertId);
      await load();
    } catch (e) {
      window.alert("Acknowledge nahi ho paya.");
    }
  };

  const handleNotifyDispatch = () => {
    window.alert(`Demo: dispatch team notified for ${data.incidentId} (simulated).`);
  };

  return (
    <DashboardLayout activeNav={activeNav} onNavSelect={setActiveNav}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <AlertHeader incidentId={data.incidentId} onBack={handleBack} />

        <IncidentSummary
          incidentId={data.incidentId}
          title={data.title}
          severity={data.severity}
          status={data.status}
          location={data.location.fullLocation}
          onDismiss={handleDismiss}
          onAcknowledge={handleAcknowledge}
          onNotifyDispatch={handleNotifyDispatch}
        />

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 18,
          alignItems: "start",
        }}>
          <div style={{ gridColumn: "span 7", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <EvidenceFeed feedData={{ ...data.evidenceFeed, imageSrc: "http://localhost:8000/stream/raw", showOverlayBoxes: false }} />
            <TemporalForensicScrub scrubData={data.temporalScrub} />
          </div>

          <div style={{ gridColumn: "span 5", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <ModelConfidencePanel
              models={data.modelConfidences}
              ensembleVersion={data.ensembleVersion}
            />
            <EventTimeline events={data.eventTimeline} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}