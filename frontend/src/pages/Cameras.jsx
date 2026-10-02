import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import CameraOverlayControls from "../components/cameras/CameraOverlayControls";
import EncoderDiagnostics from "../components/cameras/EncoderDiagnostics";
import VideoZoneTile from "../components/dashboard/VideoZoneTile";
import { Video, LayoutGrid } from "lucide-react";
import cameraService from "../services/cameraService";

// The one real camera (your phone's IP Webcam, via the AI service's MJPEG
// stream) plus the recorded clips that already have YOLO's overlay baked in
// from an earlier multi_zone_monitor.py run. Swap the recorded paths for
// whatever you actually copied into frontend/public/videos/.
const FEEDS = [
  {
    id: "live",
    zoneName: "Zone 1 - Entrance",
    src: cameraService.getStreamUrl(),
    isMjpeg: true,
    live: true,
  },
  {
    id: "zone1",
    zoneName: "Zone 1 - Main Concourse",
    src: "/videos/zone1_v2.mp4",
    isMjpeg: false,
    live: false,
  },
  {
    id: "zone2",
    zoneName: "Zone 2 - North Turnstile Bank & Egress",
    src: "/videos/zone2_v2.mp4",
    isMjpeg: false,
    live: false,
  },
  {
    id: "zone3",
    zoneName: "Zone 3 - West Escalator & Mezzanine",
    src: "/videos/zone3_v2.mp4",
    isMjpeg: false,
    live: false,
  },
];

export default function Cameras() {
  const [activeNav, setActiveNav] = useState("Cameras");
  const [activeFeedId, setActiveFeedId] = useState(FEEDS[0].id);

  const activeFeed = FEEDS.find((f) => f.id === activeFeedId) || FEEDS[0];

  return (
    <DashboardLayout activeNav={activeNav} onNavSelect={setActiveNav}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* ── LEFT COLUMN: Main Feed, Overlay Controls & Encoder Diagnostics ── */}
        <div className="lg:col-span-8 flex flex-col gap-3.5">

          <div className="bg-white rounded-2xl border border-[#e2dcd4] p-3 shadow-xs flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-slate-800" />
                <h2 className="font-bold text-slate-800 text-base tracking-tight font-sans">
                  {activeFeed.zoneName}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                {activeFeed.live ? (
                  <span className="text-red-600 font-semibold">● LIVE</span>
                ) : (
                  <span className="text-slate-500 font-semibold">Recorded footage</span>
                )}
              </div>
            </div>

            {/* Real video/MJPEG feed - no VideoPlayer/<img>-only component here */}
            <VideoZoneTile
              zoneName={activeFeed.zoneName}
              videoSrc={activeFeed.src}
              isMjpeg={activeFeed.isMjpeg}
              live={activeFeed.live}
            />

            <CameraOverlayControls />
          </div>

          <EncoderDiagnostics />

        </div>

        {/* ── RIGHT COLUMN: Dedicated Camera Zones (click to view in main feed) ── */}
        <div className="lg:col-span-4 flex flex-col gap-3">

          <div className="bg-white rounded-2xl border border-[#e2dcd4] p-3 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-sans font-bold text-slate-800 text-sm">
              <LayoutGrid size={16} className="text-slate-700" />
              <span>Dedicated Camera Zones</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#eef7f3] border border-[#d2e9dd] font-mono text-[11px] font-bold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{FEEDS.length} Feeds Available</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {FEEDS.map((feed) => (
              <VideoZoneTile
                key={feed.id}
                zoneName={feed.zoneName}
                videoSrc={feed.src}
                isMjpeg={feed.isMjpeg}
                live={feed.live}
                active={feed.id === activeFeedId}
                onSelect={() => setActiveFeedId(feed.id)}
              />
            ))}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}