export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000"
).replace(/\/$/, "");

const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const getZonesMap = async () => {
    try{
        const res = await fetch(apiUrl(`/api/zones/map?_t=${Date.now()}`));
        const json = await res.json();
        return json;
    }catch (err) {
        console.log("API ERROR", err);
        return { zones: [] };
    }
};

export const getDashboardData = async () => {
    try{
        const res = await fetch(apiUrl(`/api/zones/map?_t=${Date.now()}`));
        const json = await res.json();
        return json;
    }catch (err) {
        console.log("Dashboard API ERROR", err);
        return [];
    }
};

export const createSOS = async (payload: any) => {
  try {
    const res = await fetch(apiUrl("/api/sos/create"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    console.log("SOS create error:", err);
    return { error: "Could not create SOS" };
  }
};

export const getActiveSOS = async () => {
  try {
    const res = await fetch(apiUrl("/api/sos/active"));
    return await res.json();
  } catch (err) {
    console.log("SOS fetch error:", err);
  }
};

export const completeSOS = async (id: number, payload: any = {}) => {
  try {
    const res = await fetch(apiUrl(`/api/sos/complete/${id}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    console.log("SOS complete error:", err);
    return { error: "Could not complete SOS" };
  }
};

export const clearZoneSOS = async (zoneId: number, payload: any = {}) => {
  try {
    const res = await fetch(apiUrl(`/api/sos/zone/${zoneId}/clear`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    console.log("Zone SOS clear error:", err);
    return { error: "Could not clear zone SOS" };
  }
};

export const getSOSHistory = async () => {
  try {
    const res = await fetch(apiUrl("/api/sos/history"));
    return await res.json();
  } catch (err) {
    console.log("SOS history error:", err);
    return { sos: [] };
  }
};

export const getUserSOSHistory = async (userId: string) => {
  try {
    const res = await fetch(apiUrl(`/api/sos/history/user/${userId}`));
    return await res.json();
  } catch (err) {
    console.log("User SOS history error:", err);
    return { sos: [] };
  }
};

export const clearUserSOSHistory = async (userId: string) => {
  try {
    const res = await fetch(apiUrl(`/api/sos/history/user/${userId}/clear`), {
      method: "POST",
    });
    return await res.json();
  } catch (err) {
    console.log("Clear user SOS history error:", err);
    return { error: "Could not clear history" };
  }
};

export const getZones = async () => {
    try{
        const res = await fetch(apiUrl("/api/zones"));
        return await res.json();
    }catch (err) {
        console.log("Zones API ERROR", err);
        return { zones: [] };
    }
};

export const createZone = async (payload: any) => {
  try {
    const res = await fetch(apiUrl("/api/zones"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    console.log("Zone create error:", err);
    return { error: "Could not create zone" };
  }
};

export const registerGateway = async (payload: any) => {
  try {
    const res = await fetch(apiUrl("/api/devices/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "gateway",
        location: "Zone Gateway",
        ...payload,
      }),
    });

    return await res.json();
  } catch (err) {
    console.log("Gateway register error:", err);
    return { error: "Could not register gateway" };
  }
};

export const registerNode = async (payload: any) => {
  try {
    const res = await fetch(apiUrl("/api/nodes/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    console.log("Node register error:", err);
    return { error: "Could not register node" };
  }
};

export const getZoneDeployment = async (zoneId: number) => {
  try {
    const res = await fetch(apiUrl(`/api/zones/${zoneId}/deployment`));
    return await res.json();
  } catch (err) {
    console.log("Deployment fetch error:", err);
    return { gateways: [], nodes: [] };
  }
};

export const getZoneLogs = async (zoneId: number) => {
  try {
    const res = await fetch(apiUrl(`/api/zones/${zoneId}/logs`));
    return await res.json();
  } catch (err) {
    console.log("Logs fetch error:", err);
    return { events: [], sos: [] };
  }
};

export const deleteGateway = async (deviceId: number) => {
  try {
    const res = await fetch(apiUrl(`/api/devices/${deviceId}`), {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.log("Gateway delete error:", err);
    return { error: "Could not delete gateway" };
  }
};

export const deleteNode = async (nodeId: number) => {
  try {
    const res = await fetch(apiUrl(`/api/nodes/${nodeId}`), {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.log("Node delete error:", err);
    return { error: "Could not delete node" };
  }
};

export const deleteZone = async (zoneId: number) => {
  try {
    const res = await fetch(apiUrl(`/api/zones/${zoneId}`), {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.log("Zone delete error:", err);
    return { error: "Could not delete zone" };
  }
};

import { auth } from "../config/firebase";

const getAuthHeaders = async () => {
  if (!auth.currentUser) return {};
  const token = await auth.currentUser.getIdToken();
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
};

export const getMessagesInbox = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(apiUrl("/api/messages/inbox"), { headers });
    return await res.json();
  } catch (err) {
    console.log("Inbox fetch error:", err);
    return { messages: [] };
  }
};

export const getMessagesSent = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(apiUrl("/api/messages/sent"), { headers });
    return await res.json();
  } catch (err) {
    console.log("Sent fetch error:", err);
    return { messages: [] };
  }
};

export const sendMessage = async (payload: any) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(apiUrl("/api/messages/send"), {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.log("Send message error:", err);
    return { error: "Could not send message" };
  }
};

export const markMessageRead = async (messageId: number) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(apiUrl(`/api/messages/${messageId}/read`), {
      method: "POST",
      headers
    });
    return await res.json();
  } catch (err) {
    console.log("Mark read error:", err);
    return { error: "Could not mark as read" };
  }
};
