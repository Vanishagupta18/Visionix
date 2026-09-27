import { LayoutGrid, Download, Mic, AlertOctagon } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between flex-wrap gap-2 px-6 py-2.5 bg-white/90 backdrop-blur-md border-b border-[#e2dcd4] shrink-0 min-h-[52px]">

      {/* Left: Breadcrumbs + Live telemetry badge */}
      <div className="flex items-center gap-2 flex-wrap text-xs">

        {/* Breadcrumb container pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f4f3ee] border border-[#e2dcd4] font-sans font-medium text-slate-700">
          <span className="font-semibold text-slate-900">Cameras</span>
          <span className="text-slate-300">/</span>
          <span>Sector 1</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900">Gate Atrium (4K PTZ Optical)</span>
        </div>

        {/* Telemetry pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eef7f3] border border-[#d2e9dd] font-mono text-[11px] text-slate-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-800">LIVE - 59.9 FPS · 4K HEVC</span>
          <span className="text-emerald-300">|</span>
          <span className="text-emerald-700">14ms Edge Tensor</span>
        </div>

      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Grid View button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs cursor-pointer transition-colors">
          <LayoutGrid size={14} className="text-slate-600" />
          <span>Grid View (9-up)</span>
        </button>

        {/* Export Clip button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs cursor-pointer transition-colors">
          <Download size={14} className="text-slate-600" />
          <span>Export Clip</span>
        </button>

        {/* Audio / Intercom button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs cursor-pointer transition-colors">
          <Mic size={14} className="text-slate-600" />
          <span>Audio / Intercom</span>
        </button>

        {/* Emergency Override red button */}
        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c53030] hover:bg-[#b91c1c] text-white font-bold text-xs shadow-xs cursor-pointer transition-colors">
          <AlertOctagon size={14} className="text-white" />
          <span>Emergency Override</span>
        </button>

      </div>

    </header>
  );
}

