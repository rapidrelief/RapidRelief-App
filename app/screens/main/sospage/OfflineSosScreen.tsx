import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Network from "expo-network";
import {
  requestOfflinePermissions,
  startMockBleScan,
  simulateConnectToDevice,
  simulateBroadcastOfflineSOS,
  MockBleDevice,
  cancelDeviceConnection,
  getOfflineCoordinates,
} from "@/app/services/offlineSosService";

const OfflineSosScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Steps: 1 = Instructions, 2 = Scanning, 3 = Details Form, 4 = Success
  const [step, setStep] = useState(1);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<MockBleDevice[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<MockBleDevice | null>(null);

  // Form Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fetchingCoords, setFetchingCoords] = useState(false);
  const [sendingSos, setSendingSos] = useState(false);
  const [hasNetwork, setHasNetwork] = useState<boolean | null>(null);

  // Auto-fetch location when entering Form step
  useEffect(() => {
    checkNetwork();
    if (step === 3) {
      fetchCoordinates();
    }
  }, [step]);

  const checkNetwork = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setHasNetwork(state.isConnected && state.isInternetReachable);
    } catch (e) {
      setHasNetwork(false);
    }
  };

  const handleNetworkPillPress = () => {
    if (hasNetwork) {
      Alert.alert(
        "Network is Available",
        "You are currently connected to the internet. Please log in to the app for full features, or continue using offline SOS if you need immediate local assistance."
      );
    } else {
      Alert.alert(
        "No Network Detected",
        "You are not connected to a network. Please use this offline mode to send an emergency SOS directly to nearby rescue nodes."
      );
    }
  };

  const fetchCoordinates = async () => {
    setFetchingCoords(true);
    const position = await getOfflineCoordinates();
    if (position) {
      setCoords(position);
    } else {
      Alert.alert("GPS Error", "Could not fetch satellite coordinates. Verify Location is enabled.");
    }
    setFetchingCoords(false);
  };

  const handleStartScan = async () => {
    const { locationGranted, bluetoothGranted } = await requestOfflinePermissions();
    if (!locationGranted) {
      Alert.alert("Permissions Required", "GPS Location permissions are required to identify nearby nodes.");
      return;
    }
    if (!bluetoothGranted) {
      Alert.alert("Permissions Required", "Bluetooth permissions are required to scan for nearby nodes.");
      return;
    }

    setDevices([]);
    setScanning(true);
    setStep(2);

    try {
      const stopScan = startMockBleScan((discovered) => {
        setDevices(discovered);
      });

      // Automatically stop scan after 8 seconds
      setTimeout(() => {
        stopScan();
        setScanning(false);
      }, 8000);
    } catch (e: any) {
      setScanning(false);
      Alert.alert("BLE Not Supported", e.message || "Failed to start BLE scan. You may need to create a development build.");
    }
  };

  const handleConnect = async (device: MockBleDevice) => {
    setConnectingId(device.id);
    const success = await simulateConnectToDevice(device.id);
    setConnectingId(null);

    if (success) {
      setConnectedDevice(device);
      setStep(3);
    } else {
      Alert.alert("Connection Failed", `Could not connect to ${device.name}. Stand closer and try again.`);
    }
  };

  const handleSendSOS = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing Info", "Please fill in your name and phone number.");
      return;
    }
    if (!coords) {
      Alert.alert("No Location", "Waiting for GPS coordinates. Please wait or retry.");
      return;
    }
    if (!connectedDevice) return;

    setSendingSos(true);
    const success = await simulateBroadcastOfflineSOS({
      deviceId: connectedDevice.id,
      name: name.trim(),
      phone: phone.trim(),
      lat: coords.latitude,
      lng: coords.longitude,
    });
    setSendingSos(false);

    if (success) {
      // Disconnect immediately so the node can broadcast to others
      await cancelDeviceConnection(connectedDevice.id);
      setStep(4);
    } else {
      Alert.alert("Transmission Failed", "Bluetooth transmission failed. Stand closer to the node.");
    }
  };

  // Cleanup connection if user navigates away before finishing
  useEffect(() => {
    return () => {
      if (connectedDevice && step !== 4) {
        cancelDeviceConnection(connectedDevice.id);
      }
    };
  }, [connectedDevice, step]);

  const getRssiColor = (rssi: number) => {
    if (rssi >= -60) return "text-green-600";
    if (rssi >= -75) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <View className="flex-1 bg-[#F5F7FB]">
      {/* HEADER BAR */}
      <View className="pt-12 pb-4 px-5 bg-white flex-row items-center border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => router.replace("/")} className="p-1 mr-3">
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-gray-900 flex-1">
          Offline SOS Mode
        </Text>
        <TouchableOpacity 
          onPress={handleNetworkPillPress}
          className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${hasNetwork ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}
        >
          <View className={`w-2 h-2 rounded-full ${hasNetwork ? 'bg-green-500' : 'bg-red-500'}`} />
          <Text className={`font-extrabold text-[10px] tracking-wider uppercase ${hasNetwork ? 'text-green-700' : 'text-red-700'}`}>
            {hasNetwork === null ? "Checking..." : hasNetwork ? "Network Available" : "No Network"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="p-5">

          {/* STEP 1: INSTRUCTIONS */}
          {step === 1 && (
            <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <View className="items-center mb-5">
                <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
                  <Ionicons name="bluetooth" size={32} color="#2563EB" />
                </View>
                <Text className="text-2xl font-black text-gray-900 mt-4 text-center">
                  Direct Node Connect
                </Text>
                <Text className="text-gray-500 text-center text-sm mt-1 font-semibold leading-5">
                  Send emergency details directly to a rescue node using local Bluetooth.
                </Text>
              </View>

              {/* Graphic Flowchart */}
              <View className="flex-row items-center justify-between px-2 mb-6 mt-2">
                <View className="items-center">
                  <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-1 border border-blue-200">
                    <Ionicons name="phone-portrait-outline" size={20} color="#2563EB" />
                  </View>
                  <Text className="text-[10px] font-bold text-gray-500">You</Text>
                </View>
                
                <View className="flex-1 items-center flex-row justify-center space-x-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <Ionicons name="bluetooth" size={16} color="#2563EB" className="mx-1" />
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <View className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                </View>

                <View className="items-center">
                  <View className="w-12 h-12 rounded-full bg-indigo-100 items-center justify-center mb-1 border border-indigo-200">
                    <Ionicons name="hardware-chip-outline" size={20} color="#4F46E5" />
                  </View>
                  <Text className="text-[10px] font-bold text-gray-500">Node</Text>
                </View>
              </View>

              <View className="h-[1px] bg-gray-100 my-4" />

              {/* Steps List */}
              <View className="space-y-4">
                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mt-0.5">
                    <Text className="text-white text-xs font-black">1</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-extrabold text-gray-800 text-base">Stand Near a Node</Text>
                    <Text className="text-gray-500 text-xs font-semibold leading-4 mt-0.5">
                      Ensure you are within 15 meters of any active RapidRelief pole/device.
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3 mt-4">
                  <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mt-0.5">
                    <Text className="text-white text-xs font-black">2</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-extrabold text-gray-800 text-base">Enable Bluetooth & GPS</Text>
                    <Text className="text-gray-500 text-xs font-semibold leading-4 mt-0.5">
                      Bluetooth communicates with the node. GPS tracks your coordinates offline using satellites.
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3 mt-4">
                  <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mt-0.5">
                    <Text className="text-white text-xs font-black">3</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-extrabold text-gray-800 text-base">Transmit Information</Text>
                    <Text className="text-gray-500 text-xs font-semibold leading-4 mt-0.5">
                      Submit details. The node broadcasts it to rescuers via LoRa radio mesh.
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleStartScan}
                className="bg-blue-600 p-4 rounded-2xl mt-8 shadow-sm flex-row items-center justify-center gap-2"
              >
                <Ionicons name="search" size={20} color="white" />
                <Text className="text-white font-extrabold text-base">
                  Search Nearby Nodes
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: BLE DEVICE SCANNER */}
          {step === 2 && (
            <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm min-h-[400px]">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-bold text-gray-900 tracking-tight">
                  Discovered Nodes
                </Text>
                {scanning && <ActivityIndicator size="small" color="#2563EB" />}
              </View>

              {devices.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                  <Ionicons name="radio-outline" size={48} color="#94A3B8" className="mb-4" />
                  <Text className="text-gray-400 font-bold text-base text-center">
                    {scanning ? "Scanning for active nodes..." : "No nodes discovered"}
                  </Text>
                  <Text className="text-gray-400 text-xs text-center font-semibold mt-1">
                    Make sure you are standing close to a Node pole.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={devices}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isConnecting = connectingId === item.id;
                    return (
                      <TouchableOpacity
                        disabled={connectingId !== null}
                        onPress={() => handleConnect(item)}
                        className="p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-3 flex-row justify-between items-center"
                      >
                        <View className="flex-1 pr-3">
                          <Text className="font-extrabold text-gray-800 text-base">
                            {item.name}
                          </Text>
                          <View className="flex-row items-center mt-1 gap-1.5">
                            <Ionicons name="wifi" size={14} className={getRssiColor(item.rssi)} />
                            <Text className={`text-xs font-bold ${getRssiColor(item.rssi)}`}>
                              Signal Strength: {item.rssi} dBm
                            </Text>
                          </View>
                        </View>

                        {isConnecting ? (
                          <ActivityIndicator size="small" color="#2563EB" />
                        ) : (
                          <View className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                            <Text className="text-blue-600 font-bold text-xs">
                              Connect
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  scrollEnabled={false}
                />
              )}

              {!scanning && (
                <TouchableOpacity
                  onPress={handleStartScan}
                  className="bg-gray-100 p-4 rounded-2xl mt-6 flex-row items-center justify-center gap-2"
                >
                  <Ionicons name="refresh" size={18} color="#475569" />
                  <Text className="text-gray-700 font-bold text-base">
                    Rescan Devices
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* STEP 3: DETAILS FORM */}
          {step === 3 && connectedDevice && (
            <View className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <View className="flex-row items-center gap-2 mb-4 bg-blue-50 px-4 py-3 rounded-2xl border border-blue-100">
                <Ionicons name="link-sharp" size={20} color="#2563EB" />
                <Text className="text-blue-700 font-bold text-sm">
                  Connected to {connectedDevice.name}
                </Text>
              </View>

              <Text className="text-xl font-bold text-gray-900 mb-5">
                Emergency Details
              </Text>

              {/* Form Input fields */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: "#475569", fontWeight: "600", marginBottom: 6, fontSize: 14 }}>
                  Full Name
                </Text>
                <TextInput
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
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#475569", fontWeight: "600", marginBottom: 6, fontSize: 14 }}>
                  Contact Number
                </Text>
                <TextInput
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
                  placeholder="Enter phone number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* GPS Coordinates Box */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ color: "#475569", fontWeight: "600", marginBottom: 6, fontSize: 14 }}>
                  Location Status
                </Text>
                <View className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="location" size={20} color={coords ? "#10B981" : "#64748B"} />
                    <View>
                      {fetchingCoords ? (
                        <Text className="text-gray-500 font-semibold text-xs">
                          Acquiring GPS location...
                        </Text>
                      ) : coords ? (
                        <>
                          <Text className="text-gray-800 font-bold text-sm">
                            Coordinates Acquired
                          </Text>
                          <Text className="text-gray-500 text-xs mt-0.5 font-semibold">
                            Lat: {coords.latitude.toFixed(5)}, Lng: {coords.longitude.toFixed(5)}
                          </Text>
                        </>
                      ) : (
                        <Text className="text-red-500 font-bold text-xs">
                          GPS Offline
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    disabled={fetchingCoords}
                    onPress={fetchCoordinates}
                    className="p-2 bg-white rounded-xl border border-gray-200"
                  >
                    <Ionicons name="refresh" size={16} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                disabled={sendingSos}
                onPress={handleSendSOS}
                className="bg-red-600 p-4 rounded-2xl shadow-sm flex-row items-center justify-center gap-2"
              >
                {sendingSos ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="megaphone-outline" size={20} color="white" />
                    <Text className="text-white font-extrabold text-base">
                      Send Offline SOS
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: SUCCESS MODAL/BANNER */}
          {step === 4 && (
            <View className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm items-center">
              <View className="w-20 h-20 bg-green-50 rounded-full border border-green-100 items-center justify-center mb-6">
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>

              <Text className="text-2xl font-black text-gray-900 text-center">
                SOS Broadcasted
              </Text>
              <Text className="text-gray-500 text-center text-sm font-semibold mt-3 leading-5 px-3">
                Your emergency details and GPS coordinates were successfully transmitted to the node.
              </Text>

              <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 my-6 w-full flex-row gap-3">
                <Ionicons name="information-circle-outline" size={24} color="#2563EB" className="mt-0.5" />
                <Text className="text-blue-700 text-xs font-semibold flex-1 leading-5">
                  The node is now routing your request over the local mesh network. Rescuer dashboards will receive the alert shortly.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.replace("/")}
                className="w-full bg-blue-600 p-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
              >
                <Text className="text-white font-extrabold text-base">
                  Back to Home
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
};

export default OfflineSosScreen;
