import { useState } from "react";
import { ShieldCheck, Flag } from "lucide-react";

export default function VideoPlayer({
  src = "/webcam1.jpg",
  camId = "CAM-01-ATRIUM-N",
  timeUtc = "14:32:08.41",
  focal = "FOCAL: 54mm (2.4x)",
  iris = "IRIS: f/1.8",
  lux = "840 LUX",
  engine = "AI INFERENCE ENGINE 4.2",
  className = ""
}) {
  const [activeSpeed, setActiveSpeed] = useState("1.0x");
  const [isPlaying, setIsPlaying] = useState(true);

  // Check if src is video or image
  const isVideo = typeof src === "string" && (
    src.endsWith(".mp4") || src.endsWith(".webm") || src.startsWith("blob:") || src.includes("stream")
  );

  return (
    <div className={`flex flex-col bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-md ${className}`}>
      {/* ── Main Video Feed Viewport ── */}
      <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-hidden group select-none">
        
        {/* Background Stream Media */}
        {isVideo ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover filter contrast-[1.03] brightness-[0.97]"
          />
        ) : (
          <img
            src={src}
            alt="Surveillance Feed"
            className="w-full h-full object-cover filter contrast-[1.03] brightness-[0.97]"
          />
        )}

        {/* TOP OVERLAY TELEMETRY BAR */}
        <div className="absolute top-0 left-0 right-0 bg-slate-950/85 backdrop-blur-xs px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-200 z-10 border-b border-slate-800/80">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-white tracking-wider">{camId}</span>
            <span className="text-slate-500">|</span>
            <span>UTC {timeUtc}</span>
            <span className="text-slate-500">|</span>
            <span>{focal}</span>
            <span className="text-slate-500">|</span>
            <span>{iris}</span>
            <span className="text-slate-500">|</span>
            <span>{lux}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{engine}</span>
          </div>
        </div>

        {/* BOUNDING BOX 1: Green Box (Person Tracking) */}
        <div className="absolute top-[28%] left-[32%] w-[24%] h-[36%] border-2 border-emerald-400/90 rounded bg-emerald-500/10 pointer-events-none">
          <div className="absolute -top-5 left-0 bg-emerald-600/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-t backdrop-blur-xs whitespace-nowrap">
            OBJ 46912 • 98.4% | 1.3m/s F
          </div>
        </div>

        {/* BOUNDING BOX 2: Orange Box (Zone 1 Convergence) */}
        <div className="absolute top-[40%] left-[50%] w-[20%] h-[30%] border-2 border-amber-500/90 rounded bg-amber-500/15 pointer-events-none">
          <div className="absolute -top-5 left-0 bg-amber-600/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-t backdrop-blur-xs whitespace-nowrap">
            ZONE 1 CONVERGENCE 0.74 p/m²
          </div>
        </div>

        {/* FLOATING BADGE OVERLAY (Facial Obfuscation Policy) */}
        <div className="absolute bottom-3 right-3 z-10">
          <div className="bg-slate-950/85 backdrop-blur-md text-slate-200 border border-slate-700/80 px-3 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 shadow-lg">
            <ShieldCheck size={13} className="text-amber-400 shrink-0" />
            <span>Facial Obfuscation Policy: <strong className="text-emerald-400 font-semibold">ACTIVE (GDPR Art. 9)</strong></span>
          </div>
        </div>

      </div>

      {/* ── TIMELINE SCRUBBING & PLAYBACK SPEED BAR ── */}
      <div className="bg-slate-900 border-t border-slate-800 p-2.5 flex flex-col gap-2 font-mono text-[11px]">
        {/* Timeline Bar with playhead */}
        <div className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden group">
          <div className="h-full bg-slate-500 w-[82%]" />
          <div className="absolute top-0 right-[18%] w-1.5 h-full bg-red-500 shadow-xs" />
        </div>

        {/* Playback info + speed selectors */}
        <div className="flex items-center justify-between text-slate-300 pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Buffer:</span>
            <span className="text-slate-200 font-bold">-02:00:00 / 14:32:08 LIVE</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed selection */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-md border border-slate-800">
              {["0.5x", "1.0x", "2.4x"].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setActiveSpeed(speed)}
                  className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                    activeSpeed === speed
                      ? "bg-emerald-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>

            <span className="text-slate-700">|</span>

            {/* Flag Marker Button */}
            <button className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer text-[10px]">
              <Flag size={11} className="text-amber-400" />
              <span>Flag Marker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
