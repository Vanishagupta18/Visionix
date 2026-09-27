import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import VideoPlayer from "../components/common/VideoPlayer";
import CameraOverlayControls from "../components/cameras/CameraOverlayControls";
import EncoderDiagnostics from "../components/cameras/EncoderDiagnostics";
import CameraGrid from "../components/cameras/CameraGrid";
import CameraCard from "../components/cameras/CameraCard";
import { Video, LayoutGrid, CheckCircle } from "lucide-react";

export default function Cameras() {
  const [activeNav, setActiveNav] = useState("Cameras");
  const [mainFeedSrc, setMainFeedSrc] = useState("/webcam1.jpg");

  return (
    <DashboardLayout activeNav={activeNav} onNavSelect={setActiveNav}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ── LEFT COLUMN: Main Feed, Overlay Controls & Encoder Diagnostics (approx 8 cols) ── */}
        <div className="lg:col-span-8 flex flex-col gap-3.5">
          
          {/* Main Feed Card Wrapper */}
          <div className="bg-white rounded-2xl border border-[#e2dcd4] p-3 shadow-xs flex flex-col gap-2.5">
            {/* Main Feed Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-slate-800" />
                <h2 className="font-bold text-slate-800 text-base tracking-tight font-sans">
                  Sector 1 Atrium West Overlook
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>Mount ID: <strong className="text-slate-700 font-medium">MT-401-G1</strong></span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-semibold">PTZ Mot. Active</span>
                <span className="text-slate-300">|</span>
                <span>Enc: <strong className="text-slate-700 font-medium">3840x2160 @ 60p</strong></span>
              </div>
            </div>

            {/* Video Player Component */}
            <VideoPlayer src={mainFeedSrc} />

            {/* Overlay Controls */}
            <CameraOverlayControls />
          </div>

          {/* Encoder Diagnostics Component */}
          <EncoderDiagnostics />

        </div>

        {/* ── RIGHT COLUMN: Dedicated Camera Zones (approx 4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          
          {/* Dedicated Camera Zones Card Header */}
          <div className="bg-white rounded-2xl border border-[#e2dcd4] p-3 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-sans font-bold text-slate-800 text-sm">
              <LayoutGrid size={16} className="text-slate-700" />
              <span>Dedicated Camera Zones</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#eef7f3] border border-[#d2e9dd] font-mono text-[11px] font-bold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>3 Feeds Active</span>
            </div>
          </div>

          {/* Camera Grid list with 3 zone camera cards */}
          <CameraGrid>
            <CameraCard
              title="Zone 1: Main Concourse"
              code="CAM-01-A"
              src="/webcam1.jpg"
              fps="4K - 59.9 FPS"
              focal="FOCAL: 54mm"
              detectedCount="48 Detected"
              resolution="3840x2160"
              bitrate="12.4M"
              onExpand={() => setMainFeedSrc("/webcam1.jpg")}
            />

            <CameraCard
              title="Zone 2: North Turnstile Bank & Egress"
              code="CAM-02-B"
              src="/webcam2.jpg"
              fps="1080p - 60 FPS"
              focal="FOCAL: 28mm"
              detectedCount="23 Detected"
              resolution="1920x1080"
              bitrate="6.8M"
              onExpand={() => setMainFeedSrc("/webcam2.jpg")}
            />

            <CameraCard
              title="Zone 3: West Escalator & Mezzanine"
              code="CAM-03-W"
              src="/webcam3.jpg"
              fps="4K - 30 FPS"
              focal="FOCAL: 70mm"
              detectedCount="14 Detected"
              resolution="3840x2160"
              bitrate="9.2M"
              onExpand={() => setMainFeedSrc("/webcam3.jpg")}
            />
          </CameraGrid>

        </div>

      </div>
    </DashboardLayout>
  );
}
