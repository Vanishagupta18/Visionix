import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import LiveFeedCard from "../components/dashboard/LiveFeedCard";
import IncidentFeed from "../components/dashboard/IncidentFeed";
import RiskAssessmentPanel from "../components/dashboard/RiskAssessmentPanel";
import CameraStatusCard from "../components/dashboard/CameraStatusCard";
import AnalyticsPanel from "../components/dashboard/AnalyticsPanel";
import { Users, Sliders, Video, Gauge } from "lucide-react";
import useLiveStats from "../hooks/useLiveStats";
import useAiAnalytics from "../hooks/useAiAnalytics";
import useIncidentAlerts from "../hooks/useIncidentAlerts";
import cameraService from "../services/cameraService";
import { averageConfidence } from "../utils/analytics";

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  // Primary source: direct websocket to the AI service - full per-frame
  // detail (detections, confidence, breakdown, timing). Falls back to the
  // Node/Mongo-backed snapshot (useLiveStats) when the AI service's own
  // socket hasn't connected yet or has dropped, so the dashboard still
  // shows the last known-good persisted values rather than going blank.
  const { result, wsConnected, stale } = useAiAnalytics();
  const { data: fallbackData, loading: fallbackLoading } = useLiveStats();
  const { alerts } = useIncidentAlerts();

  const usingLive = result != null;
  const count = usingLive ? result.personCount : fallbackData?.count;
  const density = usingLive ? result.density?.peoplePerSquareMeter : fallbackData?.density;
  const riskScore = usingLive ? result.risk?.score : fallbackData?.riskScore;
  const riskLabel = usingLive ? result.risk?.label : fallbackData?.riskLabel;
  const status = usingLive ? undefined : fallbackData?.status; // risk.label supersedes status once live
  const countSource = usingLive ? result.countSource : fallbackData?.countSource;
  const cameraConnected = usingLive ? result.cameraStatus === "connected" : fallbackData?.cameraStatus === "connected";
  const avgConfidence = usingLive ? averageConfidence(result.detections) : null;

  return (
    <DashboardLayout activeNav={activeNav} onNavSelect={setActiveNav}>

      {/* ── Top: Real-time Person Count / Density / Confidence / Risk Score ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        <StatCard
          title="Real-time Person Count"
          icon={Users}
          value={count == null && fallbackLoading ? "—" : (count ?? 0).toLocaleString()}
          subtext={countSource ? `Count source: ${countSource}` : undefined}
        />
        <StatCard
          title="Crowd Density"
          icon={Sliders}
          value={density == null ? "N/A" : density.toFixed(2)}
          unit={density == null ? undefined : "pers/m²"}
          badge={status || (riskLabel === "Safe" ? "Safe" : riskLabel ? "Elevated" : undefined)}
          badgeColor={riskLabel === "Critical" || riskLabel === "High Risk" ? "red" : riskLabel === "Warning" ? "amber" : "green"}
        />
        <StatCard
          title="Detection Confidence"
          icon={Gauge}
          value={avgConfidence != null ? `${(avgConfidence * 100).toFixed(1)}%` : "N/A"}
          subtext={
            usingLive && result.detections?.length
              ? `Avg. across ${result.detections.length} detections (this frame)`
              : "No live detections"
          }
        />
        <StatCard
          title="Current Risk Score"
          icon={Video}
          value={riskScore != null ? `${Math.round(riskScore)}%` : "N/A"}
          badge={riskLabel}
          badgeColor={riskLabel === "Critical" || riskLabel === "High Risk" ? "red" : riskLabel === "Warning" ? "amber" : "green"}
        />
      </div>

      {/* ── Middle: Live feed / Risk assessment / Camera+inference status ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14, alignItems: "start", marginBottom: 14 }}>
        <LiveFeedCard
          zoneName={result?.cameraId || fallbackData?.zoneName || "Default Zone"}
          streamUrl={cameraService.getStreamUrl()}
          connected={cameraConnected}
          count={count}
          status={status || riskLabel}
          countSource={countSource}
          riskScore={riskScore}
          riskLabel={riskLabel}
          onStart={() => cameraService.startMonitoring()}
          onStop={() => cameraService.stopMonitoring()}
        />
        <RiskAssessmentPanel result={result} stale={stale} />
        <CameraStatusCard result={result} wsConnected={wsConnected} stale={stale} />
      </div>

      {/* ── Lower: Detailed analytics + Active incidents ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, alignItems: "start" }}>
        <AnalyticsPanel result={result} wsConnected={wsConnected} stale={stale} />
        <IncidentFeed alerts={alerts} />
      </div>

    </DashboardLayout>
  );
}