import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Navbar from "../components/RescuerNavbar";
import {
  getZoneDeployment,
  getZonesMap,
  registerGateway,
  registerNode,
  deleteGateway,
  deleteNode,
} from "@/app/services/api";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/app/config/firebase";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const RescuerDeploymentScreen = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [deployment, setDeployment] = useState<any>({ gateways: [], nodes: [] });
  const [gatewayId, setGatewayId] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [nodeGatewayId, setNodeGatewayId] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "gateway" | "node"; id: number } | null>(null);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    if (selectedZoneId) {
      loadDeployment(selectedZoneId);
    }
  }, [selectedZoneId]);

  const loadZones = async () => {
    const data = await getZonesMap();
    const list = data?.zones || [];
    setZones(list);

    if (!selectedZoneId && list.length > 0) {
      setSelectedZoneId(list[0].id);
    }
  };

  const loadDeployment = async (zoneId: number) => {
    const data = await getZoneDeployment(zoneId);
    setDeployment(data || { gateways: [], nodes: [] });

    const firstGateway = data?.gateways?.[0]?.device_id;
    if (firstGateway && !nodeGatewayId) {
      setNodeGatewayId(String(firstGateway));
    }
  };

  const refreshDeployment = async () => {
    try {
      setRefreshing(true);
      await loadZones();

      if (selectedZoneId) {
        await loadDeployment(selectedZoneId);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleRegisterGateway = async () => {
    if (!selectedZoneId || !gatewayId) {
      Alert.alert("Missing Data", "Select a zone and enter a gateway ID.");
      return;
    }

    try {
      setSaving(true);
      const result = await registerGateway({
        device_id: Number(gatewayId),
        zone_id: selectedZoneId,
      });

      if (result?.detail || result?.error) {
        Alert.alert("Gateway Not Registered", String(result.detail || result.error));
        return;
      }

      setGatewayId("");
      await loadDeployment(selectedZoneId);
      Alert.alert("Gateway Registered", `Copy this API key into gateway code:\n${result.api_key}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterNode = async () => {
    if (!selectedZoneId || !nodeId || !nodeGatewayId) {
      Alert.alert("Missing Data", "Enter node ID and gateway ID.");
      return;
    }

    try {
      setSaving(true);
      const result = await registerNode({
        node_id: Number(nodeId),
        gateway_id: Number(nodeGatewayId),
        zone_id: selectedZoneId,
      });

      if (result?.detail || result?.error) {
        Alert.alert("Node Not Registered", String(result.detail || result.error));
        return;
      }

      setNodeId("");
      await loadDeployment(selectedZoneId);
      Alert.alert("Node Registered", `Node ${result.node_id} is assigned to gateway ${result.gateway_id}.`);
    } finally {
      setSaving(false);
    }
  };

  const initiateDelete = (type: "gateway" | "node", id: number) => {
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to permanently delete this ${type} (${id})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeleteTarget({ type, id });
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

      if (deleteTarget?.type === "gateway") {
        const result = await deleteGateway(deleteTarget.id);
        if (result?.error || result?.detail) {
          throw new Error(result.error || result.detail);
        }
        Alert.alert("Success", `Gateway ${deleteTarget.id} deleted successfully.`);
      } else if (deleteTarget?.type === "node") {
        const result = await deleteNode(deleteTarget.id);
        if (result?.error || result?.detail) {
          throw new Error(result.error || result.detail);
        }
        Alert.alert("Success", `Node ${deleteTarget.id} deleted successfully.`);
      }

      setPasswordModalVisible(false);
      setDeleteTarget(null);
      setPassword("");
      if (selectedZoneId) {
        await loadDeployment(selectedZoneId);
      }
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

      <ScrollView
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshDeployment} />
        }
      >
        <View className="px-5">
          <Text className="text-3xl font-extrabold text-gray-900">
            Deployment
          </Text>
          <Text className="text-gray-500 mt-1 mb-5">
            Assign gateways and LoRa nodes to monitoring zones.
          </Text>

          {refreshing && (
            <View className="flex-row items-center justify-center bg-blue-50 border border-blue-100 rounded-2xl py-3 mb-5">
              <ActivityIndicator size="small" color="#2563EB" />
              <Text className="ml-2 text-blue-700 font-semibold">
                Refreshing deployment...
              </Text>
            </View>
          )}

          {/* ZONE TABS SELECTOR */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {zones.map((zone) => {
              const active = selectedZoneId === zone.id;
              return (
                <TouchableOpacity
                  key={zone.id}
                  onPress={() => setSelectedZoneId(zone.id)}
                  className={`mr-2 px-5 py-3 rounded-2xl border ${
                    active 
                      ? "bg-blue-600 border-blue-600 shadow-sm" 
                      : "bg-white border-gray-200/80 shadow-sm"
                  }`}
                >
                  <Text className={`font-bold ${active ? "text-white" : "text-gray-700"}`}>
                    {zone.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* REGISTER GATEWAY CARD */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Register Gateway
            </Text>

            <Input
              label="Gateway Device ID"
              value={gatewayId}
              keyboardType="numeric"
              onChangeText={setGatewayId}
              placeholder="e.g. 101"
            />

            <TouchableOpacity
              disabled={saving}
              onPress={handleRegisterGateway}
              className={`rounded-2xl py-4 mt-2 shadow-sm ${saving ? "bg-gray-400" : "bg-blue-600"}`}
            >
              <Text className="text-white text-center font-bold">
                Register Gateway
              </Text>
            </TouchableOpacity>
          </View>

          {/* REGISTER NODE CARD */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Register Node
            </Text>

            <View className="flex-row gap-4 mb-2">
              <View className="flex-1">
                <Input
                  label="Node ID"
                  value={nodeId}
                  keyboardType="numeric"
                  onChangeText={setNodeId}
                  placeholder="e.g. 201"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Gateway ID"
                  value={nodeGatewayId}
                  keyboardType="numeric"
                  onChangeText={setNodeGatewayId}
                  placeholder="e.g. 101"
                />
              </View>
            </View>

            <TouchableOpacity
              disabled={saving}
              onPress={handleRegisterNode}
              className={`rounded-2xl py-4 mt-2 shadow-sm ${saving ? "bg-gray-400" : "bg-red-600"}`}
            >
              <Text className="text-white text-center font-bold">
                Register Node
              </Text>
            </TouchableOpacity>
          </View>

          {/* GATEWAYS SECTION */}
          <DeviceSection title="Gateways" empty="No gateways deployed">
            {(deployment.gateways || []).map((gateway: any) => (
              <DeviceCard
                key={gateway.device_id}
                title={`Gateway ${gateway.device_id}`}
                status={gateway.status || getDeviceStatus(gateway)}
                zoneOrGatewayLabel="Zone ID"
                zoneOrGatewayValue={gateway.zone_id}
                flood={gateway.flood}
                sos={gateway.sos}
                lastSeen={formatTime(gateway.last_seen)}
                onDelete={() => initiateDelete("gateway", gateway.device_id)}
              />
            ))}
          </DeviceSection>

          {/* NODES SECTION */}
          <DeviceSection title="Nodes" empty="No nodes deployed">
            {(deployment.nodes || []).map((node: any) => (
              <DeviceCard
                key={node.node_id}
                title={`Node ${node.node_id}`}
                status={node.status || getDeviceStatus(node)}
                zoneOrGatewayLabel="Gateway ID"
                zoneOrGatewayValue={node.gateway_id}
                flood={node.flood}
                sos={node.sos}
                lastSeen={formatTime(node.last_seen)}
                onDelete={() => initiateDelete("node", node.node_id)}
              />
            ))}
          </DeviceSection>
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
              Enter your password to permanently delete this {deleteTarget?.type} ({deleteTarget?.id}).
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
                  setDeleteTarget(null);
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
                  <Text className="text-white font-bold text-center">Delete</Text>
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
  <View style={{ marginBottom: 12 }}>
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

const DeviceSection = ({ title, empty, children }: any) => (
  <View className="mb-6">
    <Text className="text-xl font-bold text-gray-900 mb-3">{title}</Text>
    {React.Children.count(children) === 0 ? (
      <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm items-center">
        <Ionicons name="hardware-chip-outline" size={32} color="#94A3B8" />
        <Text className="text-gray-400 font-semibold mt-2 text-center">{empty}</Text>
      </View>
    ) : (
      children
    )}
  </View>
);

const DeviceCard = ({ 
  title, 
  status, 
  zoneOrGatewayLabel, 
  zoneOrGatewayValue, 
  flood, 
  sos, 
  lastSeen, 
  onDelete 
}: any) => (
  <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm">
    <View className="flex-row justify-between items-center">
      <View>
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
        <Text className="text-xs text-gray-500 mt-0.5 font-semibold">
          {zoneOrGatewayLabel}: <Text className="text-gray-800 font-bold">{zoneOrGatewayValue}</Text>
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <View className={`px-2 py-1 rounded-full ${getStatusBg(status)}`}>
          <Text className={`text-[10px] font-extrabold tracking-wider ${getStatusText(status)}`}>
            {formatStatus(status)}
          </Text>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} activeOpacity={0.7} className="p-1">
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>

    <View className="h-[1px] bg-gray-100 my-3" />

    <View className="flex-row justify-between items-center flex-wrap gap-2">
      <View className="flex-row items-center gap-3">
        <View className={`flex-row items-center px-2 py-1 rounded-lg ${flood ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"}`}>
          <Ionicons name="water-outline" size={14} color={flood ? "#EF4444" : "#94A3B8"} />
          <Text className={`text-[10px] font-extrabold ml-1 ${flood ? "text-red-700" : "text-gray-500"}`}>
            FLOOD: {flood ? "YES" : "NO"}
          </Text>
        </View>

        <View className={`flex-row items-center px-2 py-1 rounded-lg ${sos ? "bg-pink-50 border border-pink-100" : "bg-gray-50 border border-gray-100"}`}>
          <Ionicons name="alert-circle-outline" size={14} color={sos ? "#EC4899" : "#94A3B8"} />
          <Text className={`text-[10px] font-extrabold ml-1 ${sos ? "text-pink-700" : "text-gray-500"}`}>
            SOS: {sos ? "YES" : "NO"}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-gray-400 font-semibold">
        🕒 {lastSeen}
      </Text>
    </View>
  </View>
);

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "Never";
  return new Date(timestamp * 1000).toLocaleString();
};

const getDeviceStatus = (device: any) => {
  if (!device?.last_seen) return "NOT_ASSIGNED";
  if (device?.is_lost) return "LOST";
  return "ONLINE";
};

const formatStatus = (status: string) => {
  if (status === "NOT_ASSIGNED") return "NOT ASSIGNED";
  return status;
};

const getStatusBg = (status: string) => {
  if (status === "ONLINE") return "bg-green-50 border border-green-100";
  if (status === "LOST") return "bg-red-50 border border-red-100";
  return "bg-gray-50 border border-gray-100";
};

const getStatusText = (status: string) => {
  if (status === "ONLINE") return "text-green-700";
  if (status === "LOST") return "text-red-700";
  return "text-gray-700";
};

export default RescuerDeploymentScreen;
