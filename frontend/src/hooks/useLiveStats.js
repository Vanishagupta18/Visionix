import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { cameraService } from "../services/cameraService";

function normalizeZones(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.zones)) return response.zones;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.zones)) {
    return response.data.zones;
  }

  return [];
}

function normalizeZone(zone) {
  return {
    zoneId: zone?._id ?? zone?.id,
    zoneName: zone?.name ?? "Default Zone",
    count: zone?.currentCount ?? zone?.count ?? 0,
    status: zone?.currentStatus ?? zone?.status ?? null,
    countSource: zone?.countSource ?? null,
    crowdMode: zone?.crowdMode ?? null,
    density: zone?.density ?? null,
    riskScore: zone?.riskScore ?? null,
    riskLabel: zone?.riskLabel ?? null,
    cameraStatus: zone?.cameraStatus ?? "stopped",
    lastUpdated: zone?.lastUpdated ?? null,
  };
}

export default function useLiveStats() {
  const { latestReading, cameraStatus, connected } = useSocket();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const response = await cameraService.getZones();
        const zones = normalizeZones(response);

        if (!cancelled && zones.length > 0) {
          setData(normalizeZone(zones[0]));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error("Failed to fetch zones:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!latestReading) return;

    setData((previous) => ({
      ...(previous || {}),
      ...latestReading,
      cameraStatus:
        latestReading.cameraStatus ?? cameraStatus,
    }));
  }, [latestReading, cameraStatus]);

  useEffect(() => {
    if (!cameraStatus) return;

    setData((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        cameraStatus,
      };
    });
  }, [cameraStatus]);

  return {
    data,
    loading,
    error,
    socketConnected: connected,
  };
}