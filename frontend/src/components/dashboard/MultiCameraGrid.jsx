import VideoZoneTile from "./VideoZoneTile";
import cameraService from "../../services/cameraService";

// Recorded clips. These already have YOLO's overlay baked in from an
// earlier multi_zone_monitor.py run - labeled "Recorded footage" rather
// than "LIVE", since they aren't. Swap these paths for whichever files you
// actually copied into frontend/public/videos/.
const RECORDED_ZONES = [
  { zoneName: "Zone 1 - Main Concourse", src: "/videos/annotated_Zone_1.mp4" },
  { zoneName: "Zone 2 - North Turnstile Bank", src: "/videos/annotated_Zone_2.mp4" },
  { zoneName: "Zone 3 - West Escalator & Mezzanine", src: "/videos/annotated_Zone_3.mp4" },
];

export default function MultiCameraGrid({ includeLiveCamera = true }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
      {includeLiveCamera && (
        <VideoZoneTile
          zoneName="Zone 1 - Entrance"
          videoSrc={cameraService.getStreamUrl()}
          isMjpeg
          live
        />
      )}
      {RECORDED_ZONES.map((z) => (
        <VideoZoneTile key={z.zoneName} zoneName={z.zoneName} videoSrc={z.src} />
      ))}
    </div>
  );
}