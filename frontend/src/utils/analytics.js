// Aggregate confidence across this frame's detections. Returns null (not 0)
// when there are no detections, so callers can show "N/A" instead of a
// misleading 0%. This is a client-computed aggregate of real per-box
// confidences from the model - not a value the model itself outputs, and
// callers should label it as such (see AnalyticsPanel).
export function averageConfidence(detections) {
  if (!detections || detections.length === 0) return null;
  const sum = detections.reduce((acc, d) => acc + (d.confidence ?? 0), 0);
  return sum / detections.length;
}

export function classCounts(detections) {
  if (!detections) return {};
  return detections.reduce((acc, d) => {
    acc[d.className] = (acc[d.className] || 0) + 1;
    return acc;
  }, {});
}

export function formatMs(v) {
  return v == null ? 'N/A' : `${v.toFixed(1)} ms`;
}

export function formatTime(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleTimeString();
}