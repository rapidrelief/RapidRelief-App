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
  DrawerItem,
} from "@react-navigation/drawer";

import { auth, db } from "@/app/config/firebase";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

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
        setStatus(data.status || "Online"); // 🔥 synced from DB
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
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => (
        <View style={{ flex: 1 }}>

          {/* ================= HEADER ================= */}
          <View style={{
            paddingTop: 60,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: "#E5E7EB",
          }}>

            {loading ? (
              <ActivityIndicator color="#2563EB" />
            ) : (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Rescuer ID: {rescuerId}
              </Text>
            )}

            {/* STATUS + PROFILE */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
              alignItems: "center",
            }}>

              {/* STATUS BUTTON */}
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F3F4F6",
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                }}
              >
                <View style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: getDotColor(),
                  marginRight: 8,
                }} />

                <Text style={{ fontWeight: "600" }}>
                  {status}
                </Text>

                <Ionicons name="chevron-down" size={16} style={{ marginLeft: 6 }} />
              </TouchableOpacity>

              {/* PROFILE */}
              <TouchableOpacity
                onPress={() => router.push("/rescuer/profile")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  backgroundColor: "#F3F4F6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="person" size={22} color="#2563EB" />
              </TouchableOpacity>

            </View>
          </View>

          {/* MENU */}
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>

          {/* LOGOUT */}
          <View style={{ paddingBottom: 30 }}>
            <DrawerItem
              label={() => (
                <View style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  backgroundColor: "#DC2626",
                  paddingVertical: 12,
                  borderRadius: 14,
                  width: 180,
                }}>
                  <Ionicons name="log-out-outline" size={22} color="white" />
                  <Text style={{
                    color: "white",
                    fontWeight: "bold",
                    marginLeft: 8,
                  }}>
                    Logout
                  </Text>
                </View>
              )}
              onPress={() => router.replace("/auth/Login")}
            />
          </View>

          {/* ================= STATUS MODAL ================= */}
          <Modal visible={modalVisible} transparent animationType="fade">
            <View style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              padding: 20,
            }}>

              <View style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 20,
              }}>

                <Text style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 15,
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
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 10,
                      backgroundColor: status === item.label ? "#F3F4F6" : "transparent",
                    }}
                  >
                    <View style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: item.color,
                      marginRight: 10,
                    }} />

                    <Text style={{ fontWeight: "600" }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    marginTop: 10,
                    backgroundColor: "#FEE2E2",
                    padding: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{
                    textAlign: "center",
                    color: "#DC2626",
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
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="complete-profile" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
    </Drawer>
  );
}
