import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Navbar from "../components/RescuerNavbar";
import { createZone, getZonesMap, deleteZone } from "@/app/services/api";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/app/config/firebase";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const emptyForm = {
  name: "",
  lat: "",
  lng: "",
  radius_m: "",
  priority: "medium",
};

const RescuerZonesScreen = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    const data = await getZonesMap();
    setZones(data?.zones || []);
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateZone = async () => {
    if (!form.name || !form.lat || !form.lng || !form.radius_m) {
      Alert.alert("Missing Data", "Please fill all zone fields.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      lat: Number(form.lat),
      lng: Number(form.lng),
      radius_m: Number(form.radius_m),
      priority: form.priority.trim().toLowerCase() || "medium",
    };

    if (
      Number.isNaN(payload.lat) ||
      Number.isNaN(payload.lng) ||
      Number.isNaN(payload.radius_m)
    ) {
      Alert.alert("Invalid Coordinates", "Latitude, longitude, and radius must be numbers.");
      return;
    }

    try {
      setSaving(true);
      const result = await createZone(payload);

      if (result?.detail || result?.error) {
        Alert.alert("Zone Not Created", String(result.detail || result.error));
        return;
      }

      setForm(emptyForm);
      await loadZones();
      Alert.alert("Zone Created", `${payload.name} is ready for deployment.`);
    } finally {
      setSaving(false);
    }
  };

  const initiateDelete = (zoneId: number, name: string) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to permanently delete the zone "${name}"? All assigned gateways, nodes, and alerts in this zone will be deleted permanently.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeleteTargetId(zoneId);
            setDeleteTargetName(name);
            setPassword("");
            setPasswordModalVisible(true);
          },
        },
      ]
    );
  };

  const handleConfirmDelete = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    try {
      setDeleting(true);

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      if (deleteTargetId !== null) {
        const result = await deleteZone(deleteTargetId);
        if (result?.error || result?.detail) {
          throw new Error(result.error || result.detail);
        }
        Alert.alert("Success", `Zone "${deleteTargetName}" deleted successfully.`);
      }

      setPasswordModalVisible(false);
      setDeleteTargetId(null);
      setDeleteTargetName("");
      setPassword("");
      await loadZones();
    } catch (err: any) {
      console.log("Delete error:", err);
      const msg = err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password"
        ? "Incorrect password. Verification failed."
        : err?.message || "Verification failed. Please try again.";
      Alert.alert("Authentication Failed", msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F4F6FA]">
      <Navbar />

      <ScrollView contentContainerStyle={{ paddingTop: 100, paddingBottom: 40 }}>
        <View className="px-5">
          <Text className="text-3xl font-extrabold text-gray-900">
            Zone Management
          </Text>
          <Text className="text-gray-500 mt-1 mb-5">
            Create flood monitoring zones and review current coverage.
          </Text>

          {/* CREATE ZONE CARD */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Create Zone
            </Text>

            <Input label="Zone Name" value={form.name} onChangeText={(v: string) => updateForm("name", v)} placeholder="e.g. Sector-A Flood Alert" />
            
            <View className="flex-row gap-4 mb-1">
              <View className="flex-1">
                <Input label="Latitude" value={form.lat} keyboardType="decimal-pad" onChangeText={(v: string) => updateForm("lat", v)} placeholder="e.g. 24.8607" />
              </View>
              <View className="flex-1">
                <Input label="Longitude" value={form.lng} keyboardType="decimal-pad" onChangeText={(v: string) => updateForm("lng", v)} placeholder="e.g. 67.0011" />
              </View>
            </View>

            <View className="flex-row gap-4 mb-1" style={{ zIndex: 1000 }}>
              <View className="flex-1">
                <Input label="Radius (meters)" value={form.radius_m} keyboardType="numeric" onChangeText={(v: string) => updateForm("radius_m", v)} placeholder="e.g. 500" />
              </View>
              <View className="flex-1 relative">
                <Text style={{ color: "#475569", fontWeight: "600", marginBottom: 6, fontSize: 14 }}>Priority</Text>
                <TouchableOpacity
                  onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 48,
                  }}
                >
                  <Text style={{ color: "#0F172A", fontSize: 15, textTransform: 'capitalize', fontWeight: '500' }}>
                    {form.priority}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>

                {showPriorityDropdown && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 72,
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      borderRadius: 16,
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 10,
                      elevation: 5,
                      zIndex: 2000,
                      overflow: 'hidden',
                    }}
                  >
                    {["high", "medium", "low"].map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => {
                          updateForm("priority", p);
                          setShowPriorityDropdown(false);
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderBottomWidth: p !== "low" ? 1 : 0,
                          borderBottomColor: '#F1F5F9',
                          backgroundColor: form.priority === p ? '#F1F5F9' : 'white',
                        }}
                      >
                        <Text style={{ fontSize: 15, color: '#0F172A', fontWeight: form.priority === p ? '700' : '500', textTransform: 'capitalize' }}>
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              disabled={saving}
              onPress={handleCreateZone}
              className={`mt-3 rounded-2xl py-4 shadow-sm ${saving ? "bg-gray-400" : "bg-blue-600"}`}
            >
              <Text className="text-white text-center font-bold">
                {saving ? "Creating..." : "Create Zone"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* EXISTING ZONES LIST */}
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Existing Zones
          </Text>

          {zones.length === 0 ? (
            <View className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm items-center">
              <Ionicons name="map-outline" size={48} color="#94A3B8" />
              <Text className="text-gray-400 font-semibold mt-4 text-center">No zones created yet</Text>
            </View>
          ) : (
            zones.map((zone) => (
              <View
                key={zone.id}
                className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="text-lg font-bold text-gray-900">
                      {zone.name}
                    </Text>
                    <Text className="text-gray-500 mt-1 text-xs font-semibold">
                      📍 {Number(zone.lat).toFixed(4)}, {Number(zone.lng).toFixed(4)}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <View 
                      className={`px-3 py-1 rounded-full ${
                        zone.state === "SAFE" ? "bg-green-50 border border-green-100" :
                        zone.state === "FLOOD" || zone.state === "SOS" ? "bg-red-50 border border-red-100" :
                        zone.state === "WARNING" ? "bg-orange-50 border border-orange-100" :
                        zone.state === "LOST" ? "bg-amber-50 border border-amber-100" : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <Text 
                        className={`text-[10px] font-extrabold tracking-wider ${
                          zone.state === "SAFE" ? "text-green-700" :
                          zone.state === "FLOOD" || zone.state === "SOS" ? "text-red-700" :
                          zone.state === "WARNING" ? "text-orange-700" :
                          zone.state === "LOST" ? "text-amber-700" : "text-gray-700"
                        }`}
                      >
                        {zone.state === "SAFE" ? "SAFE" :
                         zone.state === "FLOOD" ? "FLOOD" :
                         zone.state === "SOS" ? "SOS" :
                         zone.state === "WARNING" ? "WARNING" :
                         zone.state === "LOST" ? "LOST" : zone.state || "UNKNOWN"}
                      </Text>
                    </View>

                    <TouchableOpacity 
                      onPress={() => initiateDelete(zone.id, zone.name)} 
                      activeOpacity={0.7}
                      className="p-1"
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="h-[1px] bg-gray-100 my-3" />

                <View className="flex-row justify-between text-xs text-gray-500 font-semibold">
                  <Text className="text-gray-500">
                    Radius: <Text className="text-gray-800 font-bold">{zone.radius_m}m</Text>
                  </Text>
                  <Text className="text-gray-500">
                    Priority: <Text className="text-gray-800 font-bold capitalize">{zone.priority}</Text>
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ================= PASSWORD CONFIRMATION MODAL ================= */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center p-6">
          <View className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Security Verification
            </Text>
            <Text className="text-gray-500 mb-5">
              Enter your password to permanently delete the zone "{deleteTargetName}". This action cannot be undone and will delete all associated alerts and devices.
            </Text>

            <TextInput
              secureTextEntry
              autoFocus
              style={{
                backgroundColor: "#F8FAFC",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: "#0F172A",
                fontSize: 15,
                marginBottom: 20
              }}
              placeholder="Enter password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
            />

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => {
                  setPasswordModalVisible(false);
                  setDeleteTargetId(null);
                  setDeleteTargetName("");
                  setPassword("");
                }}
                className="bg-gray-100 px-5 py-3 rounded-xl"
              >
                <Text className="text-gray-700 font-bold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={deleting}
                onPress={handleConfirmDelete}
                className="bg-red-600 px-5 py-3 rounded-xl flex-row items-center justify-center min-w-[100px]"
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-center">Delete Zone</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Input = ({ label, ...props }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ color: "#475569", fontWeight: "600", marginBottom: 6, fontSize: 14 }}>{label}</Text>
    <TextInput
      {...props}
      style={{
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: "#0F172A",
        fontSize: 15,
      }}
      placeholderTextColor="#94A3B8"
    />
  </View>
);

export default RescuerZonesScreen;
