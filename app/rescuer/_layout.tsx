import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Drawer } from "expo-router/drawer";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";

import { auth, db } from "@/app/config/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

export default function RescuerLayout() {
  const [status, setStatus] = useState("Online");
  const [modalVisible, setModalVisible] = useState(false);

  const [rescuerId, setRescuerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const uid = auth.currentUser?.uid;

  // ================= REALTIME FIRESTORE LISTENER =================
  useEffect(() => {
    if (!uid) return;

    const ref = doc(db, "users", uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRescuerId(data.rescuerId || "N/A");
        setStatus(data.status || "Online");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  // ================= UPDATE STATUS =================
  const updateStatus = async (newStatus: string) => {
    try {
      setStatus(newStatus);
      if (!uid) return;
      await updateDoc(doc(db, "users", uid), {
        status: newStatus,
      });
      setModalVisible(false);
    } catch (err) {
      console.log("Status update error:", err);
    }
  };

  const getDotColor = () => {
    switch (status) {
      case "Online":
        return "#22C55E";
      case "Busy":
        return "#EAB308";
      case "Offline":
        return "#EF4444";
      default:
        return "#22C55E";
    }
  };

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: "#0F172A", width: 280 },
        drawerActiveBackgroundColor: "rgba(79, 70, 229, 0.2)",
        drawerActiveTintColor: "#818CF8",
        drawerInactiveTintColor: "#94A3B8",
        drawerLabelStyle: { fontWeight: "bold", fontSize: 15, marginLeft: -10 },
      }}
      drawerContent={(props) => (
        <View style={{ flex: 1, backgroundColor: "#0F172A" }}>

          {/* ================= HEADER ================= */}
          <LinearGradient
            colors={["#1E1B4B", "#0F172A"]}
            style={{
              paddingTop: 60,
              paddingBottom: 24,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.05)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#3730A3", justifyContent: "center", alignItems: "center", shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10, elevation: 5 }}>
                <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 13, color: "#818CF8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1 }}>
                  Commander ID
                </Text>
                {loading ? (
                  <ActivityIndicator color="#818CF8" size="small" style={{ alignSelf: "flex-start", marginTop: 4 }} />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 }}>
                    {rescuerId}
                  </Text>
                )}
              </View>
            </View>

            {/* STATUS + PROFILE */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>

              {/* STATUS BUTTON */}
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: getDotColor(),
                  marginRight: 8,
                  shadowColor: getDotColor(),
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 5,
                }} />

                <Text style={{ fontWeight: "bold", color: "#FFFFFF", fontSize: 13 }}>
                  {status}
                </Text>

                <Ionicons name="chevron-down" size={14} color="#94A3B8" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              {/* PROFILE */}
              <TouchableOpacity
                onPress={() => router.push("/rescuer/profile")}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <Ionicons name="person" size={16} color="#FFFFFF" />
              </TouchableOpacity>

            </View>
          </LinearGradient>

          {/* MENU */}
          <DrawerContentScrollView {...props} style={{ paddingTop: 10 }}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>

          {/* LOGOUT */}
          <View style={{ paddingBottom: 40, paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={() => router.replace("/auth/Login")}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                paddingVertical: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(239, 68, 68, 0.3)",
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#F87171" />
              <Text style={{
                color: "#F87171",
                fontWeight: "bold",
                marginLeft: 10,
                fontSize: 15,
                letterSpacing: 0.5,
              }}>
                SECURE LOGOUT
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================= STATUS MODAL ================= */}
          <Modal visible={modalVisible} transparent animationType="fade">
            <View style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              padding: 20,
            }}>

              <View style={{
                backgroundColor: "#1E293B",
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}>

                <Text style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 15,
                  color: "#FFF",
                }}>
                  Update Status
                </Text>

                {[
                  { label: "Online", color: "#22C55E" },
                  { label: "Busy", color: "#EAB308" },
                  { label: "Offline", color: "#EF4444" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => updateStatus(item.label)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 10,
                      backgroundColor: status === item.label ? "rgba(255,255,255,0.1)" : "transparent",
                    }}
                  >
                    <View style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: item.color,
                      marginRight: 10,
                    }} />

                    <Text style={{ fontWeight: "600", color: "#FFF" }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    marginTop: 10,
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    padding: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{
                    textAlign: "center",
                    color: "#F87171",
                    fontWeight: "bold",
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </Modal>

        </View>
      )}
    >
      <Drawer.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="map" options={{ title: "Map" }} />
      <Drawer.Screen name="zones" options={{ title: "Zones" }} />
      <Drawer.Screen name="deployment" options={{ title: "Devices" }} />
      <Drawer.Screen name="logs" options={{ title: "Logs" }} />
      <Drawer.Screen name="sos" options={{ title: "SOS Requests" }} />
      <Drawer.Screen name="messages/index" options={{ title: "Transmissions" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="complete-profile" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
    </Drawer>
  );
}
