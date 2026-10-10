// Realistic mock data for Visionix Crowd Dynamics & Incident Analytics
// Keeps data strictly separated from UI for easy future API integration.

export const kpiData = [
  {
    id: "total_footfall",
    title: "Total Tracked Footfall",
    value: "184,920",
    iconType: "users",
    trend: {
      direction: "up",
      value: "+8.4%",
      label: "vs prev week"
    }
  },
  {
    id: "peak_density",
    title: "Peak Crowd Density",
    value: "1.42",
    unit: "pers/m²",
    iconType: "density",
    subtext: "Oct 23, 17:45 UTC · Gate 3",
    subtextDotColor: "#f59e0b" // orange/amber dot
  },
  {
    id: "mean_bottleneck",
    title: "Mean Bottleneck Duration",
    value: "4m 12s",
    iconType: "hourglass",
    trend: {
      direction: "down",
      value: "-32s",
      label: "proactive dispatch"
    }
  },
  {
    id: "ai_accuracy",
    title: "AI Anomaly Accuracy",
    value: "98.6%",
    unit: "precision",
    iconType: "shield",
    subtext: "Validated against 142 dispatch events"
  }
];

export const densityTrendData = {
  dateLabel: "Oct 23, 2024",
  safetyThreshold: 1.0,
  timePoints: [
    { time: "06:00", density: 0.05 },
    { time: "07:00", density: 0.25 },
    { time: "08:00", density: 0.78 },
    { time: "08:20", density: 1.14, label: "Morning Peak" },
    { time: "09:00", density: 1.08, isAmPeak: true },
    { time: "10:00", density: 0.72 },
    { time: "11:00", density: 0.61 },
    { time: "12:00", density: 0.58 },
    { time: "13:00", density: 0.59 },
    { time: "14:00", density: 0.65 },
    { time: "15:00", density: 0.76 },
    { time: "16:00", density: 0.92 },
    { time: "17:00", density: 1.28 },
    { 
      time: "17:45", 
      density: 1.42, 
      isSurge: true,
      incident: {
        id: "#INC-892",
        title: "CRITICAL SURGE",
        time: "17:45 UTC",
        description: "Density spike: 1.42 pers/m² at Gate 3 Turnstile Bank.",
        actionText: "Turnstiles unlocked",
        actionLinkText: "Dispatch log ↵"
      } 
    },
    { time: "18:00", density: 1.22 },
    { time: "19:00", density: 0.64 },
    { time: "20:00", density: 0.28 },
    { time: "21:00", density: 0.12 }
  ],
  summaryStats: {
    stdDev: "±0.18 pers/m²",
    morningPeakMax: "1.14 pers/m² (08:20)",
    aggregation: "5-minute rolling average aggregation"
  }
};

export const locationIncidentsData = [
  {
    id: "gate-3",
    name: "Gate 3",
    totalIncidents: 42,
    breakdown: { low: 18, med: 12, high: 8, critical: 4 },
    percentages: { low: 43, med: 28, high: 19, critical: 10 }
  },
  {
    id: "platform-1",
    name: "Platform 1",
    totalIncidents: 38,
    breakdown: { low: 16, med: 11, high: 7, critical: 4 },
    percentages: { low: 42, med: 29, high: 18, critical: 11 }
  },
  {
    id: "north-turnstiles",
    name: "North Turnstiles",
    totalIncidents: 29,
    breakdown: { low: 15, med: 9, high: 3, critical: 2 },
    percentages: { low: 52, med: 31, high: 10, critical: 7 }
  },
  {
    id: "west-escalators",
    name: "West Escalators",
    totalIncidents: 22,
    breakdown: { low: 13, med: 6, high: 3, critical: 0 },
    percentages: { low: 59, med: 27, high: 14, critical: 0 }
  },
  {
    id: "baggage-check",
    name: "Baggage Check",
    totalIncidents: 15,
    breakdown: { low: 12, med: 2, high: 1, critical: 0 },
    percentages: { low: 80, med: 13, high: 7, critical: 0 }
  }
];

export const highFrequencyZone = {
  name: "Gate 3",
  auditLogUrl: "#"
};

// 7 days x 24 hours heatmap matrix
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const generateHeatmapData = () => {
  const result = [];
  days.forEach((day, dIdx) => {
    const row = { day, hours: [] };
    for (let h = 0; h < 24; h++) {
      let val = 0.1;
      const isWeekday = dIdx < 5;
      
      if (isWeekday) {
        if ((h >= 7 && h <= 9) || (h >= 17 && h <= 19)) {
          // Surge hours
          val = h === 17 || h === 8 ? 1.42 : 1.15;
        } else if (h >= 10 && h <= 16) {
          // Moderate day
          val = 0.65;
        } else if (h >= 20 || h <= 5) {
          // Night
          val = 0.12;
        } else {
          val = 0.35;
        }
      } else {
        // Weekend pattern
        if (h >= 12 && h <= 18) {
          val = 0.88;
        } else if (h >= 10 && h <= 21) {
          val = 0.45;
        } else {
          val = 0.1;
        }
      }
      
      row.hours.push({
        hour: h,
        hourLabel: `${String(h).padStart(2, '0')}:00`,
        density: val
      });
    }
    result.push(row);
  });
  return result;
};

export const heatmapMatrixData = generateHeatmapData();
