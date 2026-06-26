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
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
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
      await cancelDeviceConnection(connectedDevice.id);
      setStep(4);
    } else {
      Alert.alert("Transmission Failed", "Bluetooth transmission failed. Stand closer to the node.");
    }
  };

  useEffect(() => {
    return () => {
      if (connectedDevice && step !== 4) {
        cancelDeviceConnection(connectedDevice.id);
      }
    };
  }, [connectedDevice, step]);

  const getRssiColor = (rssi: number) => {
    if (rssi >= -60) return "text-green-400";
    if (rssi >= -75) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E3A8A', '#1A4BCC']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        
        {/* HEADER BAR */}
        <View className="pb-4 px-5 flex-row items-center border-b border-white/10 mt-2">
          <TouchableOpacity onPress={() => router.replace("/")} className="p-2 mr-2 bg-white/10 rounded-full">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-white flex-1">
            Offline SOS
          </Text>
          <TouchableOpacity 
            onPress={handleNetworkPillPress}
            className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 ${hasNetwork ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}
          >
            <View className={`w-2 h-2 rounded-full ${hasNetwork ? 'bg-green-400' : 'bg-red-400'}`} />
            <Text className={`font-extrabold text-[10px] tracking-wider uppercase ${hasNetwork ? 'text-green-400' : 'text-red-400'}`}>
              {hasNetwork === null ? "Checking..." : hasNetwork ? "Network Available" : "No Network"}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="p-5">

              {/* STEP 1: INSTRUCTIONS */}
              {step === 1 && (
                <View className="bg-white/10 rounded-3xl p-6 border border-white/20 shadow-sm">
                  <View className="items-center mb-5">
                    <View className="w-16 h-16 rounded-full bg-blue-500/20 items-center justify-center border border-blue-400/30">
                      <Ionicons name="bluetooth" size={32} color="#60A5FA" />
                    </View>
                    <Text className="text-2xl font-black text-white mt-4 text-center">
                      Direct Node Connect
                    </Text>
                    <Text className="text-white/70 text-center text-sm mt-1 font-semibold leading-5">
                      Send emergency details directly to a rescue node using local Bluetooth.
                    </Text>
                  </View>

                  {/* Graphic Flowchart */}
                  <View className="flex-row items-center justify-between px-2 mb-6 mt-2">
                    <View className="items-center">
                      <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center mb-1 border border-blue-400/30">
                        <Ionicons name="phone-portrait-outline" size={20} color="#60A5FA" />
                      </View>
                      <Text className="text-[10px] font-bold text-white/50">You</Text>
                    </View>
                    
                    <View className="flex-1 items-center flex-row justify-center space-x-1">
                      <View className="w-1.5 h-1.5 rounded-full bg-blue-300/40" />
                      <View className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
                      <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <Ionicons name="bluetooth" size={16} color="#60A5FA" className="mx-1" />
                      <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <View className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
                      <View className="w-1.5 h-1.5 rounded-full bg-blue-300/40" />
                    </View>

                    <View className="items-center">
                      <View className="w-12 h-12 rounded-full bg-indigo-500/20 items-center justify-center mb-1 border border-indigo-400/30">
                        <Ionicons name="hardware-chip-outline" size={20} color="#818CF8" />
                      </View>
                      <Text className="text-[10px] font-bold text-white/50">Node</Text>
                    </View>
                  </View>

                  <View className="h-[1px] bg-white/10 my-4" />

                  {/* Steps List */}
                  <View className="space-y-4">
                    <View className="flex-row items-start gap-3">
                      <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center mt-0.5 border border-white/30">
                        <Text className="text-white text-xs font-black">1</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-extrabold text-white text-base">Stand Near a Node</Text>
                        <Text className="text-white/60 text-xs font-semibold leading-4 mt-0.5">
                          Ensure you are within 15 meters of any active RapidRelief pole/device.
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-start gap-3 mt-4">
                      <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center mt-0.5 border border-white/30">
                        <Text className="text-white text-xs font-black">2</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-extrabold text-white text-base">Enable Bluetooth & GPS</Text>
                        <Text className="text-white/60 text-xs font-semibold leading-4 mt-0.5">
                          Bluetooth communicates with the node. GPS tracks your coordinates offline using satellites.
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-start gap-3 mt-4">
                      <View className="w-6 h-6 rounded-full bg-white/20 items-center justify-center mt-0.5 border border-white/30">
                        <Text className="text-white text-xs font-black">3</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-extrabold text-white text-base">Transmit Information</Text>
                        <Text className="text-white/60 text-xs font-semibold leading-4 mt-0.5">
                          Submit details. The node broadcasts it to rescuers via LoRa radio mesh.
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleStartScan}
                    className="bg-[#33B3FF] p-4 rounded-2xl mt-8 shadow-sm flex-row items-center justify-center gap-2"
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
                <View className="bg-white/10 rounded-3xl p-6 border border-white/20 shadow-sm min-h-[400px]">
                  <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-xl font-bold text-white tracking-tight">
                      Discovered Nodes
                    </Text>
                    {scanning && <ActivityIndicator size="small" color="#60A5FA" />}
                  </View>

                  {devices.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                      <Ionicons name="radio-outline" size={48} color="rgba(255,255,255,0.3)" className="mb-4" />
                      <Text className="text-white/50 font-bold text-base text-center">
                        {scanning ? "Scanning for active nodes..." : "No nodes discovered"}
                      </Text>
                      <Text className="text-white/40 text-xs text-center font-semibold mt-1">
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
                            className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-3 flex-row justify-between items-center"
                          >
                            <View className="flex-1 pr-3">
                              <Text className="font-extrabold text-white text-base">
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
                              <ActivityIndicator size="small" color="#60A5FA" />
                            ) : (
                              <View className="bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-400/30">
                                <Text className="text-blue-300 font-bold text-xs">
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
                      className="bg-white/10 p-4 rounded-2xl mt-6 flex-row items-center justify-center gap-2 border border-white/20"
                    >
                      <Ionicons name="refresh" size={18} color="white" />
                      <Text className="text-white font-bold text-base">
                        Rescan Devices
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* STEP 3: DETAILS FORM */}
              {step === 3 && connectedDevice && (
                <View className="bg-white/10 rounded-3xl p-6 border border-white/20 shadow-sm">
                  <View className="flex-row items-center gap-2 mb-4 bg-blue-500/20 px-4 py-3 rounded-2xl border border-blue-400/30">
                    <Ionicons name="link-sharp" size={20} color="#60A5FA" />
                    <Text className="text-blue-200 font-bold text-sm">
                      Connected to {connectedDevice.name}
                    </Text>
                  </View>

                  <Text className="text-xl font-bold text-white mb-5">
                    Emergency Details
                  </Text>

                  {/* Form Input fields */}
                  <View style={{ marginBottom: 14 }}>
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600", marginBottom: 6, fontSize: 14 }}>
                      Full Name
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.2)",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: "white",
                        fontSize: 15,
                      }}
                      placeholder="Enter your name"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600", marginBottom: 6, fontSize: 14 }}>
                      Contact Number
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.2)",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: "white",
                        fontSize: 15,
                      }}
                      placeholder="Enter phone number"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>

                  {/* GPS Coordinates Box */}
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600", marginBottom: 6, fontSize: 14 }}>
                      Location Status
                    </Text>
                    <View className="bg-white/5 border border-white/10 p-4 rounded-2xl flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Ionicons name="location" size={20} color={coords ? "#34D399" : "#94A3B8"} />
                        <View>
                          {fetchingCoords ? (
                            <Text className="text-white/60 font-semibold text-xs">
                              Acquiring GPS location...
                            </Text>
                          ) : coords ? (
                            <>
                              <Text className="text-white font-bold text-sm">
                                Coordinates Acquired
                              </Text>
                              <Text className="text-white/50 text-xs mt-0.5 font-semibold">
                                Lat: {coords.latitude.toFixed(5)}, Lng: {coords.longitude.toFixed(5)}
                              </Text>
                            </>
                          ) : (
                            <Text className="text-red-400 font-bold text-xs">
                              GPS Offline
                            </Text>
                          )}
                        </View>
                      </View>

                      <TouchableOpacity
                        disabled={fetchingCoords}
                        onPress={fetchCoordinates}
                        className="p-2 bg-white/10 rounded-xl border border-white/20"
                      >
                        <Ionicons name="refresh" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    disabled={sendingSos}
                    onPress={handleSendSOS}
                    className="bg-red-500/20 border border-red-500/30 p-4 rounded-2xl shadow-sm flex-row items-center justify-center gap-2"
                  >
                    {sendingSos ? (
                      <ActivityIndicator size="small" color="#FCA5A5" />
                    ) : (
                      <>
                        <Ionicons name="megaphone-outline" size={20} color="#FCA5A5" />
                        <Text className="text-red-200 font-extrabold text-base">
                          Send Offline SOS
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 4: SUCCESS MODAL/BANNER */}
              {step === 4 && (
                <View className="bg-white/10 rounded-3xl p-8 border border-white/20 shadow-sm items-center">
                  <View className="w-20 h-20 bg-green-500/20 rounded-full border border-green-400/30 items-center justify-center mb-6">
                    <Ionicons name="checkmark-circle" size={48} color="#34D399" />
                  </View>

                  <Text className="text-2xl font-black text-white text-center">
                    SOS Broadcasted
                  </Text>
                  <Text className="text-white/70 text-center text-sm font-semibold mt-3 leading-5 px-3">
                    Your emergency details and GPS coordinates were successfully transmitted to the node.
                  </Text>

                  <View className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4 my-6 w-full flex-row gap-3">
                    <Ionicons name="information-circle-outline" size={24} color="#60A5FA" className="mt-0.5" />
                    <Text className="text-blue-200 text-xs font-semibold flex-1 leading-5">
                      The node is now routing your request over the local mesh network. Rescuer dashboards will receive the alert shortly.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => router.replace("/")}
                    className="w-full bg-[#33B3FF] p-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
                  >
                    <Text className="text-white font-extrabold text-base">
                      Back to Home
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default OfflineSosScreen;
