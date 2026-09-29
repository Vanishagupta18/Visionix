import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";
import { API_BASE_URL } from "../services/api";

export const SocketContext = createContext(null);

function getSocketUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

const SOCKET_URL = getSocketUrl();

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [latestReading, setLatestReading] = useState(null);
  const [latestAlert, setLatestAlert] = useState(null);
  const [cameraStatus, setCameraStatus] = useState("stopped");

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      console.info("Socket.IO connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
      setConnected(false);
      console.warn("Socket.IO disconnected:", reason);
    };

    const handleConnectError = (error) => {
      console.error("Socket.IO connection error:", error.message);
    };

    const handleReading = (payload) => {
      if (payload && typeof payload === "object") {
        setLatestReading(payload);
      }
    };

    const handleAlert = (payload) => {
      if (payload && typeof payload === "object") {
        setLatestAlert(payload);
      }
    };

    const handleCameraStatus = (payload) => {
      if (payload?.cameraStatus) {
        setCameraStatus(payload.cameraStatus);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reading:update", handleReading);
    socket.on("alert:new", handleAlert);
    socket.on("camera:status", handleCameraStatus);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reading:update", handleReading);
      socket.off("alert:new", handleAlert);
      socket.off("camera:status", handleCameraStatus);

      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const value = {
    connected,
    latestReading,
    latestAlert,
    cameraStatus,
    socket: socketRef.current,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
}

export default SocketContext;