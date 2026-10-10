// Realistic mock data for Visionix Alerts & Incident Detail Page
// Separates data strictly from UI logic for API readiness.

export const incidentDetailData = {
  incidentId: "#INC-8942",
  title: "Rapid Crowd Surge & Turnstile Bottleneck",
  severity: "CRITICAL", // CRITICAL | WARNING | INFO
  status: "UNDER REVIEW", // UNDER REVIEW | ACKNOWLEDGED | RESOLVED
  location: {
    sector: "Sector 1",
    gate: "South Gate 3",
    fullLocation: "Sector 1 - South Gate 3",
    code: "DRIVE_FILE_..."
  },
  timestamp: "2024-10-25 14:26:18 UTC",
  
  evidenceFeed: {
    title: "Optical Evidence Feed - Turnstile Bank 03",
    fps: "60 FPS",
    fov: "114° ULTRA-WIDE",
    imageSrc: "/crowd_feed.jpg", // Realistic crowd feed image from public
    cameraDetails: "Camera 03 (South Concourse) - 2024-10-25 14:26:18 UTC - Resolution 3840x2160 - ISO 400 - Shutter 1/250s",
    statusBadge: "AI PIPELINE ACTIVE",
    videoOverlayHeader: "0-25 14:44:32 CST - STADIUM ENTRANCE",
    detections: [
      {
        id: "d1",
        label: "PERSON",
        text: "CRITICAL SURGE DENSITY ZONE: 1.38 p/m²",
        type: "critical",
        boxStyle: { top: "35%", left: "30%", width: "38%", height: "28%" }
      },
      {
        id: "d2",
        label: "VECTOR STALL - -0.42 m/s",
        tag: "30C - 0.96",
        type: "warning",
        boxStyle: { top: "52%", left: "44%", width: "24%", height: "18%" }
      }
    ]
  },

  modelConfidences: [
    {
      id: "yolo",
      modelName: "YOLOv9 (Subject Detection & Count)",
      confidence: 96.4,
      subtext: "142 individual persons detected in target zone",
      color: "#2563eb",
      badge: null
    },
    {
      id: "csrnet",
      modelName: "CSRNet (Crowd Density Estimation)",
      confidence: 94.8,
      subtext: "1.38 persons/m² (Nominal threshold: 1.0)",
      color: "#dc2626",
      badge: "TRIGGER",
      isTrigger: true
    },
    {
      id: "c3d",
      modelName: "C3D / SlowFast (Temporal Anomaly)",
      confidence: 91.2,
      subtext: "Abnormal bidirectional counter-flow & bottleneck stall",
      color: "#ea580c",
      badge: null
    }
  ],
  ensembleVersion: "v4.8 Ensemble",

  temporalScrub: {
    windowLabel: "T-Window: -60s to +30s",
    peakTime: "14:26:18",
    thumbnails: [
      {
        id: "t1",
        timeLabel: "-60s",
        timestamp: "14:25:18",
        density: "0.72 p/m²",
        label: "0.72 p/m² · Nomi...",
        imageSrc: "/webcam1.jpg",
        isPeak: false
      },
      {
        id: "t2",
        timeLabel: "-30s",
        timestamp: "14:25:48",
        density: "0.98 p/m²",
        label: "0.98 p/m² · Slow...",
        imageSrc: "/webcam2.jpg",
        isPeak: false
      },
      {
        id: "t3",
        timeLabel: "0s (PEAK)",
        timestamp: "14:26:18",
        density: "1.38 p/m²",
        label: "1.38 p/m² · PEAK",
        imageSrc: "/crowd_feed.jpg",
        isPeak: true
      },
      {
        id: "t4",
        timeLabel: "+30s",
        timestamp: "14:26:48",
        density: "1.32 p/m²",
        label: "1.32 p/m² · Stag...",
        imageSrc: "/webcam3.jpg",
        isPeak: false
      }
    ]
  },

  eventTimeline: [
    {
      id: "e1",
      timestamp: "14:25:02 UTC",
      title: "Density Drift Detected",
      description: "Initial density drift detected above nominal baseline (0.75 p/m²).",
      type: "info",
      isTrigger: false
    },
    {
      id: "e2",
      timestamp: "14:26:18 UTC - INCIDENT TRIGGER",
      title: "Critical Surge & Flow Stall",
      description: "Critical density surge (1.38 p/m²) & flow stall detected at Gate 3 Turnstile Bank.",
      type: "critical",
      isTrigger: true
    },
    {
      id: "e3",
      timestamp: "14:26:22 UTC",
      title: "Dispatch Recommendation Generated",
      description: "Automated AI dispatch recommendation generated for Field Security Team Alpha.",
      type: "warning",
      isTrigger: false
    },
    {
      id: "e4",
      timestamp: "14:27:00 UTC",
      title: "Operator Acknowledgement",
      description: "Operator acknowledgement logged by Station 4 Lead (Officer Elena Vance).",
      type: "info",
      isTrigger: false
    }
  ]
};
