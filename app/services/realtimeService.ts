import { API_BASE_URL, getActiveSOS, getZoneLogs, getZonesMap } from "@/app/services/api";

type Cleanup = () => void;

const getWebSocketUrl = (path: string) => {
  const wsBase = API_BASE_URL.replace(/^http/, "ws");
  return `${wsBase}${path}`;
};

const subscribe = (
  path: string,
  onData: (data: any) => void,
  fallbackLoader: () => Promise<any>,
  fallbackDelay = 5000
): Cleanup => {
  let closed = false;
  let socket: WebSocket | null = null;
  let fallbackTimer: any = null;
  let heartbeatTimer: any = null;

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const startFallback = () => {
    if (closed || fallbackTimer) return;

    const tick = async () => {
      if (closed) return;

      try {
        onData(await fallbackLoader());
      } catch (err) {
        console.log("Realtime fallback error:", err);
      }

      if (!closed) {
        fallbackTimer = setTimeout(tick, fallbackDelay);
      }
    };

    fallbackTimer = setTimeout(tick, fallbackDelay);
  };

  try {
    socket = new WebSocket(getWebSocketUrl(path));

    socket.onopen = () => {
      stopHeartbeat();
      heartbeatTimer = setInterval(() => {
        if (!closed && socket?.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      }, 20000);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onData(message.data);
      } catch (err) {
        console.log("Realtime message error:", err);
      }
    };

    socket.onerror = () => {
      startFallback();
    };

    socket.onclose = () => {
      stopHeartbeat();
      startFallback();
    };
  } catch (err) {
    console.log("Realtime connection error:", err);
    startFallback();
  }

  return () => {
    closed = true;

    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
    }

    stopHeartbeat();

    if (socket) {
      socket.close();
    }
  };
};

export const subscribeToZones = (onData: (data: any) => void) =>
  subscribe("/ws/zones", onData, getZonesMap);

export const subscribeToActiveSOS = (onData: (data: any) => void) =>
  subscribe("/ws/sos/active", onData, getActiveSOS);

export const subscribeToZoneLogs = (zoneId: number, onData: (data: any) => void) =>
  subscribe(`/ws/zones/${zoneId}/logs`, onData, () => getZoneLogs(zoneId));
