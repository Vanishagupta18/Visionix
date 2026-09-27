import { UserCheck, Maximize2, Camera } from "lucide-react";

export default function CameraCard({
  title = "Zone 1: Main Concourse",
  code = "CAM-01-A",
  src = "/webcam1.jpg",
  fps = "4K - 59.9 FPS",
  focal = "FOCAL: 54mm",
  detectedCount = "48 Detected",
  resolution = "3840x2160",
  bitrate = "12.4M",
  onExpand,
  onSnapshot
}) {
  const isVideo = typeof src === "string" && (
    src.endsWith(".mp4") || src.endsWith(".webm") || src.startsWith("blob:") || src.includes("stream")
  );

  return (
    <div className="bg-white rounded-2xl border border-[#e2dcd4] p-3 shadow-xs flex flex-col gap-2 transition-all hover:shadow-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between font-sans text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block" />
          <span className="truncate">{title}</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 font-medium shrink-0 ml-1">
          {code}
        </span>
      </div>

      {/* Video / Feed Container */}
      <div className="relative w-full aspect-[16/9] bg-slate-900 rounded-xl overflow-hidden group">
        {isVideo ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter contrast-[1.02] brightness-[0.98]"
          />
        ) : (
          <img
            src={src}
            alt={title}
            className="w-full h-full object-cover filter contrast-[1.02] brightness-[0.98]"
          />
        )}

        {/* Top-left Badges Overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 font-mono text-[9px] z-10">
          <span className="bg-slate-950/80 backdrop-blur-xs text-slate-200 px-2 py-0.5 rounded border border-slate-800">
            {fps}
          </span>
          <span className="bg-slate-950/80 backdrop-blur-xs text-emerald-400 font-semibold px-2 py-0.5 rounded border border-slate-800">
            {focal}
          </span>
        </div>

        {/* Bottom-right Overlay Badge (Detected Count) */}
        <div className="absolute bottom-2 right-2 z-10">
          <div className="bg-emerald-900/90 text-emerald-100 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-700/60 shadow-xs">
            <UserCheck size={12} className="text-emerald-300" />
            <span>{detectedCount}</span>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry & Controls */}
      <div className="flex items-center justify-between pt-1 font-mono text-[11px] text-slate-500">
        <div>
          <span>Res: <strong className="text-slate-700 font-medium">{resolution}</strong></span>
          <span className="mx-1 text-slate-300">-</span>
          <span>Bitrate: <strong className="text-slate-700 font-medium">{bitrate}</strong></span>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <button
            onClick={onExpand}
            className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Expand Feed"
          >
            <Maximize2 size={13} />
          </button>
          <button
            onClick={onSnapshot}
            className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Snapshot"
          >
            <Camera size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
