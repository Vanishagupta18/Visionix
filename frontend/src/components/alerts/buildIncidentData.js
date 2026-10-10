import { incidentDetailData as defaultData } from "./alertsData";

const STREAM_URL = "http://localhost:8000/stream/live";
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString("en-GB") : "");

// ============================================================
// SIGNAL REGISTRY: naya model aaye to bas yahan ek entry jodo.
// alwaysShow: true  -> card hamesha dikhega (model chal raha hai)
// alwaysShow: false -> card tabhi dikhega jab alert mein signal aaye
// ============================================================
const SIGNALS = {
  weapon: {
    name: "Weapon Detection (YOLO)",
    color: "#7c3aed",
    priority: 100,
    critical: true,
    title: "Weapon Detected in Monitored Zone",
    eventTitle: "Weapon Detected",
    alwaysShow: true,
    subtext: (s) => (s ? `${s.label || "Weapon"} detected in frame` : "No weapon detected"),
  },
  fight: {
    name: "Fight Detection (C3D)",
    color: "#ea580c",
    priority: 90,
    critical: true,
    title: "Fight / Violence Detected",
    eventTitle: "Fight Detected",
    alwaysShow: false, // C3D model ready hone par true kar dena
    subtext: (s) => (s ? "Aggressive motion / fight pattern detected" : "No fight detected"),
  },
};

const pct = (c) => (c === undefined || c === null ? null : Math.round(Number(c) * 100));

export function buildIncidentData(alert) {
  if (!alert) return null;

  const zoneName = alert.zone?.name || "Unknown Zone";
  const sev = alert.severity || "";
  const density = Number(alert.density ?? 0).toFixed(2);
  const count = alert.count ?? 0;
  const signals = alert.signals || {};
  const csrActive = alert.crowdMode === "CSRNET";

  // jo signals active hain, priority ke hisaab se
  const active = Object.keys(signals)
    .filter((k) => signals[k] && signals[k].detected && SIGNALS[k])
    .sort((a, b) => SIGNALS[b].priority - SIGNALS[a].priority);

  const isCritical =
    active.some((k) => SIGNALS[k].critical) || sev === "Critical" || sev === "Dangerous";

  let title = "Crowd Density Warning";
  if (active.length) title = SIGNALS[active[0]].title;
  else if (isCritical) title = "Critical Crowd Density";
  else if (sev === "High Risk") title = "High Crowd Density";

  let status = "UNDER REVIEW";
  if (alert.status === "resolved" || alert.status === "dismissed") status = "RESOLVED";
  else if (alert.acknowledged) status = "ACKNOWLEDGED";

  // ---- model cards ----
  const modelConfidences = [
    {
      id: "yolo", modelName: "YOLOv8n (Person Detection & Count)", confidence: null,
      subtext: `${count} persons counted in ${zoneName}`, color: "#2563eb", badge: null, isTrigger: false,
    },
    {
      id: "csrnet", modelName: "CSRNet (Crowd Density Estimation)", confidence: null,
      subtext: csrActive ? `${density} persons/m² (dense-crowd mode active)` : "Standby - activates at 40+ people",
      color: "#dc2626", badge: csrActive ? "TRIGGER" : null, isTrigger: csrActive,
    },
  ];

  Object.keys(SIGNALS).forEach((k) => {
    const cfg = SIGNALS[k];
    const s = signals[k];
    const isActive = !!(s && s.detected);
    if (!cfg.alwaysShow && !isActive) return;
    modelConfidences.push({
      id: k, modelName: cfg.name, confidence: isActive ? pct(s.confidence) : null,
      subtext: cfg.subtext(isActive ? s : null), color: cfg.color,
      badge: isActive ? "TRIGGER" : null, isTrigger: isActive,
    });
  });

  modelConfidences.push({
    id: "risk", modelName: "Risk Engine (Density Risk Score)", confidence: alert.riskScore ?? 0,
    subtext: `${density} persons/m² - ${sev}`, color: "#ea580c", badge: null, isTrigger: false,
  });

  // ---- timeline: sirf asli events ----
  const eventTimeline = [
    {
      id: "e-created", timestamp: `${fmtTime(alert.createdAt)} - INCIDENT TRIGGER`,
      title: "Incident Triggered", description: alert.message || `${zoneName} is ${sev}`,
      type: isCritical ? "critical" : "warning", isTrigger: true,
    },
  ];
  active.forEach((k) => {
    eventTimeline.push({
      id: `e-${k}`, timestamp: fmtTime(alert.updatedAt), title: SIGNALS[k].eventTitle,
      description: SIGNALS[k].subtext(signals[k]), type: "critical", isTrigger: false,
    });
  });
  if (alert.acknowledgedAt) {
    eventTimeline.push({
      id: "e-ack", timestamp: fmtTime(alert.acknowledgedAt), title: "Operator Acknowledgement",
      description: "Incident acknowledged by operator.", type: "info", isTrigger: false,
    });
  }
  if (alert.dismissedAt) {
    eventTimeline.push({
      id: "e-dismiss", timestamp: fmtTime(alert.dismissedAt), title: "Dismissed as False Positive",
      description: "Operator marked this incident as a false positive.", type: "info", isTrigger: false,
    });
  }
  if (alert.resolvedAt) {
    eventTimeline.push({
      id: "e-resolved", timestamp: fmtTime(alert.resolvedAt), title: "Auto-Resolved",
      description: "Zone returned to Safe level.", type: "info", isTrigger: false,
    });
  }

  return {
    alertId: alert._id,
    incidentId: `#INC-${String(alert._id).slice(-6).toUpperCase()}`,
    title,
    severity: isCritical ? "CRITICAL" : "WARNING",
    status,
    location: { sector: zoneName, gate: "", fullLocation: zoneName, code: "" },
    timestamp: alert.createdAt,
    evidenceFeed: {
      title: `Live Evidence Feed - ${zoneName}`,
      fps: "LIVE",
      fov: "N/A",
      imageSrc: STREAM_URL,
      cameraDetails: `${zoneName} - ${count} people - ${density} people/m² - source: ${alert.countSource || "YOLO"}`,
      statusBadge: "AI PIPELINE ACTIVE",
      videoOverlayHeader: `${fmtTime(alert.updatedAt)} - ${zoneName.toUpperCase()}`,
      densityBanner: `${(sev || "ELEVATED").toUpperCase()} DENSITY ZONE: ${density} p/m²`,
      detailTag: `${alert.countSource || "YOLO"} - ${count}`,
      stallBanner: null,
      showOverlayBoxes: false,
    },
    modelConfidences,
    ensembleVersion: "YOLOv8 + CSRNet" + (Object.keys(SIGNALS).some((k) => SIGNALS[k].alwaysShow) ? " + Weapon" : ""),
    temporalScrub: defaultData.temporalScrub, // abhi mock
    eventTimeline,
  };
}