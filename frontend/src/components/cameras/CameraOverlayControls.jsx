import { useState } from "react";
import { Pause, Play, Camera, Volume2, VolumeX, Lock, Unlock, Maximize2, Check } from "lucide-react";

export default function CameraOverlayControls({
  isPlaying = true,
  onTogglePlay,
  isMuted = false,
  onToggleMute,
  isLocked = true,
  onToggleLock,
  onSnapshot,
  onFullscreen
}) {
  const [toggles, setToggles] = useState({
    heatmapFlow: true,
    trajectories: true,
    velocityVectors: false,
    facialObfuscation: true
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-[#e2dcd4] rounded-xl shadow-2xs text-xs">
      {/* Left Media Control Icon Buttons */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>

        {/* Camera / Snapshot Button */}
        <button
          onClick={onSnapshot}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Take Snapshot"
        >
          <Camera size={15} />
        </button>

        {/* Audio / Mute Button */}
        <button
          onClick={onToggleMute}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        {/* Lock Button */}
        <button
          onClick={onToggleLock}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title={isLocked ? "Unlock PTZ" : "Lock PTZ"}
        >
          {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={onFullscreen}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          title="Fullscreen"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* Right AI Layer Overlay Checkboxes */}
      <div className="flex items-center gap-4 flex-wrap font-sans text-slate-700 font-medium text-[11px]">
        {/* Heatmap Flow */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={toggles.heatmapFlow}
            onChange={() => handleToggle("heatmapFlow")}
            className="hidden"
          />
          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
            toggles.heatmapFlow ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
          }`}>
            {toggles.heatmapFlow && <Check size={11} strokeWidth={3} />}
          </span>
          <span>Heatmap Flow</span>
        </label>

        {/* Trajectories */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={toggles.trajectories}
            onChange={() => handleToggle("trajectories")}
            className="hidden"
          />
          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
            toggles.trajectories ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
          }`}>
            {toggles.trajectories && <Check size={11} strokeWidth={3} />}
          </span>
          <span>Trajectories</span>
        </label>

        {/* Velocity Vectors */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={toggles.velocityVectors}
            onChange={() => handleToggle("velocityVectors")}
            className="hidden"
          />
          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
            toggles.velocityVectors ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
          }`}>
            {toggles.velocityVectors && <Check size={11} strokeWidth={3} />}
          </span>
          <span>Velocity Vectors</span>
        </label>

        {/* Facial Obfuscation */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={toggles.facialObfuscation}
            onChange={() => handleToggle("facialObfuscation")}
            className="hidden"
          />
          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
            toggles.facialObfuscation ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
          }`}>
            {toggles.facialObfuscation && <Check size={11} strokeWidth={3} />}
          </span>
          <span>Facial Obfuscation</span>
        </label>
      </div>
    </div>
  );
}
