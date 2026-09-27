import { Activity, ShieldCheck, Thermometer, Sparkles, Cpu, HardDrive } from "lucide-react";

export default function EncoderDiagnostics() {
  // Mock heights for 20 bitrate bars matching screenshot
  const barHeights = [
    45, 60, 75, 55, 68, 80, 85, 72, 90, 88, 95, 78, 85, 92, 98, 100, 70, 85, 90, 95
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#e2dcd4] p-4 shadow-xs flex flex-col gap-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-slate-700" />
          <h3 className="font-semibold text-slate-800 text-sm tracking-tight">
            Bitrate Continuity &amp; Encoder Diagnostics
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
          <span>Profile: <strong className="text-slate-700 font-medium">H.265 Main 10 @ L5.1</strong></span>
          <span className="text-slate-300">|</span>
          <span>GOP: <strong className="text-slate-700 font-medium">30 Frames</strong></span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Nominal 12.4 Mbps
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-[#f6f8f6] rounded-xl border border-[#e1e9e3] p-3 flex flex-col justify-between h-28 overflow-hidden">
        {/* Top right chart metadata */}
        <div className="flex justify-end items-center gap-2 text-[11px] font-mono text-slate-600 z-10">
          <span>Packet Loss: <strong className="text-emerald-700 font-bold">0.00%</strong></span>
          <span className="text-slate-300">|</span>
          <span>Jitter: <strong className="text-slate-700 font-medium">1.2ms</strong></span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="flex items-end justify-between gap-1.5 h-16 pt-2 px-1">
          {barHeights.map((height, i) => (
            <div key={i} className="flex-1 bg-slate-200 rounded-xs h-full flex items-end">
              <div
                className="w-full rounded-xs transition-all duration-300"
                style={{
                  height: `${height}%`,
                  background: i > 12 
                    ? "linear-gradient(to top, #15803d, #22c55e)" 
                    : "linear-gradient(to top, #2d5a52, #498276)",
                  opacity: 0.85 + (i / 100)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4 Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
        {/* Card 1: Sensor Temp */}
        <div className="bg-[#fcfdfd] border border-[#e5ece8] rounded-xl p-2.5 flex flex-col gap-1">
          <span className="text-[11px] text-slate-500 font-medium">Sensor Temp</span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-slate-800 text-sm font-mono">41°C</span>
            <span className="text-[11px] font-semibold text-emerald-600">(Optimal)</span>
          </div>
        </div>

        {/* Card 2: Glass Dome Cleanliness */}
        <div className="bg-[#fcfdfd] border border-[#e5ece8] rounded-xl p-2.5 flex flex-col gap-1">
          <span className="text-[11px] text-slate-500 font-medium">Glass Dome Cleanliness</span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-slate-800 text-sm font-mono">100%</span>
            <span className="text-[11px] font-semibold text-emerald-600">(Clear)</span>
          </div>
        </div>

        {/* Card 3: PTZ Stepper Motor */}
        <div className="bg-[#fcfdfd] border border-[#e5ece8] rounded-xl p-2.5 flex flex-col gap-1">
          <span className="text-[11px] text-slate-500 font-medium">PTZ Stepper Motor</span>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="font-bold text-emerald-600 text-xs font-mono">Calibrated</span>
            <span className="text-[10px] text-slate-500 font-mono">(0.02° drift)</span>
          </div>
        </div>

        {/* Card 4: Storage Pool */}
        <div className="bg-[#fcfdfd] border border-[#e5ece8] rounded-xl p-2.5 flex flex-col gap-1">
          <span className="text-[11px] text-slate-500 font-medium">Storage Pool</span>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-slate-800 text-xs font-mono">NAS-02-SEC1</span>
            <span className="text-[10px] text-slate-400 font-mono">(RAID-6)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
