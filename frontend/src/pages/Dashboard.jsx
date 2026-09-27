import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import LiveFeedCard from "../components/dashboard/LiveFeedCard";
import IncidentFeed from "../components/dashboard/IncidentFeed";
import { Users, Sliders, Video, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

  return (
    <DashboardLayout activeNav={activeNav} onNavSelect={setActiveNav}>

      {/* ── 4 Stat Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14,
        marginBottom: 16,
      }}>
        <StatCard
          title="Real-time Person Count"
          icon={Users}
          value="4,829"
          trend="+12% vs 15m avg"
          trendPositive={true}
          progressBar={78}
        />
        <StatCard
          title="Crowd Density Index"
          icon={Sliders}
          value="0.74"
          unit="pers/m²"
          badge="Medium"
          badgeColor="amber"
          subtext="Safe Cap Threshold: 1.20 pers/m² max"
        />
        <StatCard
          title="Active Surveillance Cameras"
          icon={Video}
          value="36 / 36"
          specs={{
            left: "● 100% Telemetry",
            right: "4K – 60 FPS (HEVC)",
          }}
        />
        <StatCard
          title="Current Threat / Risk Index"
          icon={ShieldAlert}
          riskLevel="ELEVATED"
          subtext="Station 04 Trigger • Primary Vector: Gate 3 Turnstile Surge"
        />
      </div>

      {/* ── Feed + Incident panel ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 14,
        alignItems: "start",
      }}>
        <LiveFeedCard />
        <IncidentFeed />
      </div>

    </DashboardLayout>
  );
}
