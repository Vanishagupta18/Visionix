import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { alertService } from "../services/alertService";

function normalizeAlerts(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.alerts)) return response.alerts;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.results)) return response.results;

  if (Array.isArray(response?.data?.alerts)) {
    return response.data.alerts;
  }

  return [];
}

export default function useIncidentAlerts() {
  const { latestAlert } = useSocket();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlerts() {
      try {
        const response = await alertService.getAlerts();

        if (!cancelled) {
          setAlerts(normalizeAlerts(response));
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);

        if (!cancelled) {
          setAlerts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAlerts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!latestAlert?._id) return;

    setAlerts((previousAlerts) => {
      const currentAlerts = normalizeAlerts(previousAlerts);

      const alreadyExists = currentAlerts.some(
        (alert) => alert?._id === latestAlert._id
      );

      if (alreadyExists) return currentAlerts;

      return [latestAlert, ...currentAlerts];
    });
  }, [latestAlert]);

  return { alerts, loading };
}