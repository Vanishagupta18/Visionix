import { useEffect, useRef, useState } from 'react';
import cameraService from '../services/cameraService';

// If no message arrives for this long, the connection may still be "open"
// (browsers are slow to notice a dead socket) but the data is no longer
// live - flag it as stale rather than silently showing an old frame's
// numbers as current.
const STALE_AFTER_MS = 5000;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10000;

// Connects directly to the AI service's /ws/live and exposes its full
// unified per-frame payload (detections with confidence, risk breakdown,
// inference timing, model availability). This is intentionally separate
// from useLiveStats (which reads the throttled, Node/Mongo-backed path) -
// see the architecture note in cameraService.getWsUrl().
export default function useAiAnalytics() {
  const [result, setResult] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [stale, setStale] = useState(false);
  const [lastMessageAt, setLastMessageAt] = useState(null);

  const wsRef = useRef(null);
  const reconnectDelayRef = useRef(RECONNECT_BASE_MS);
  const reconnectTimerRef = useRef(null);
  const closedByUsRef = useRef(false);

  useEffect(() => {
    closedByUsRef.current = false;

    function connect() {
      let ws;
      try {
        ws = new WebSocket(cameraService.getWsUrl());
      } catch {
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        reconnectDelayRef.current = RECONNECT_BASE_MS;
      };
      ws.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          setResult(payload);
          setLastMessageAt(Date.now());
          setStale(false);
        } catch {
          // malformed frame - ignore, keep the last good result on screen
        }
      };
      ws.onclose = () => {
        setWsConnected(false);
        if (!closedByUsRef.current) scheduleReconnect();
      };
      ws.onerror = () => {
        ws.close();
      };
    }

    function scheduleReconnect() {
      reconnectTimerRef.current = setTimeout(() => {
        if (!closedByUsRef.current) connect();
      }, reconnectDelayRef.current);
      reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, RECONNECT_MAX_MS);
    }

    connect();

    return () => {
      closedByUsRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, []);

  // Staleness watchdog runs independently of the connection state - a
  // websocket can stay technically "open" while the inference loop on the
  // server has stalled, so `wsConnected` alone isn't a reliable freshness signal.
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastMessageAt && Date.now() - lastMessageAt > STALE_AFTER_MS) {
        setStale(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastMessageAt]);

  return { result, wsConnected, stale, lastMessageAt };
}