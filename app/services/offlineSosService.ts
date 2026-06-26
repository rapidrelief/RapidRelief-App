import * as Location from "expo-location";
import { Platform, PermissionsAndroid } from "react-native";
import { BleManager } from "react-native-ble-plx";

let manager: BleManager | null = null;
const getManager = (): BleManager => {
  if (!manager) {
    try {
      manager = new BleManager();
    } catch (e) {
      console.warn("BleManager initialization failed. Native module missing?", e);
      throw new Error("BLE is not supported in this environment. Please create a development build (e.g., npx expo run:android).");
    }
  }
  return manager;
};

export interface MockBleDevice {
  id: string;
  name: string;
  rssi: number;
}

export const requestOfflinePermissions = async () => {
  let locationGranted = false;
  let bluetoothGranted = false;

  try {
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    locationGranted = locStatus === "granted";

    if (Platform.OS === "android") {
      if (Platform.Version >= 31) {
        // Use Promise.race to prevent indefinite hanging if Android swallows the request
        const permissionPromise = PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        ]);
        
        const timeoutPromise = new Promise<{ [key: string]: string }>((_, reject) => 
          setTimeout(() => reject(new Error("Permission request timed out")), 2000)
        );

        const results = await Promise.race([permissionPromise, timeoutPromise]);
        
        bluetoothGranted =
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const permissionPromise = PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const timeoutPromise = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error("Permission request timed out")), 2000)
        );
        
        const fineLocationGranted = await Promise.race([permissionPromise, timeoutPromise]);
        bluetoothGranted = fineLocationGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } else {
      // iOS permissions are handled via app.json configuration automatically
      bluetoothGranted = true;
    }
  } catch (err) {
    console.warn("Permission request failed or timed out:", err);
    locationGranted = false;
    bluetoothGranted = false;
  }

  return {
    locationGranted,
    bluetoothGranted,
  };
};

export const startMockBleScan = (onDeviceFound: (devices: MockBleDevice[]) => void): () => void => {
  const discovered: { [id: string]: MockBleDevice } = {};
  const serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

  console.log("Starting real BLE scan for UUID:", serviceUUID);
  try {
    const mgr = getManager();
    mgr.startDeviceScan(
      [serviceUUID],
      null,
      (error, device) => {
        if (error) {
          console.log("BLE scanning failed:", error);
          return;
        }
        if (device) {
          const id = device.id;
          const name = device.name || "RapidRelief Node";
          const rssi = device.rssi || -100;
          
          discovered[id] = { id, name, rssi };
          onDeviceFound(Object.values(discovered));
        }
      }
    );
  } catch (e) {
    console.warn("Error starting BLE scan. Native module might be missing:", e);
    // In production, we don't inject mock nodes. The UI will just show "No nodes discovered" after the timeout.
  }

  return () => {
    console.log("Stopping BLE scan.");
    try {
      getManager().stopDeviceScan();
    } catch(e) {
      // Ignore if manager wasn't initialized
    }
  };
};

export const simulateConnectToDevice = async (deviceId: string): Promise<boolean> => {
  try {
    console.log("Connecting to BLE device:", deviceId);
    const mgr = getManager();
    const device = await mgr.connectToDevice(deviceId);
    await device.discoverAllServicesAndCharacteristics();
    console.log("BLE Services and Characteristics discovered successfully.");
    return true;
  } catch (err) {
    console.log("BLE connection failed:", err);
    return false;
  }
};

export const getOfflineCoordinates = async () => {
  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (err) {
    console.log("Offline coordinates fetch error:", err);
    return null;
  }
};

export const simulateBroadcastOfflineSOS = async (payload: {
  deviceId: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
}): Promise<boolean> => {
  try {
    const serviceUUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
    const characteristicUUID = "beb54811-36e1-4688-b7f5-ea07361b26a8";

    // Prepare CSV data payload: Name,Phone,Lat,Lng
    const csvString = `${payload.name},${payload.phone},${payload.lat.toFixed(5)},${payload.lng.toFixed(5)}`;
    console.log("Writing BLE raw CSV string:", csvString);

    // Convert to base64
    const base64Payload = btoa(csvString);

    const mgr = getManager();
    await mgr.writeCharacteristicWithResponseForDevice(
      payload.deviceId,
      serviceUUID,
      characteristicUUID,
      base64Payload
    );
    console.log("Successfully wrote payload to BLE characteristic.");

    // Local fallback reporting in case the device has network connectivity
    try {
      const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";
      await fetch(`${backendUrl}/api/sos/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "AUTO",
          zone_id: payload.deviceId.includes("101") ? 1 : null,
          user_name: `${payload.name} (OFFLINE BLE via ${payload.deviceId})`,
          user_phone: payload.phone,
          lat: payload.lat,
          lng: payload.lng,
        }),
      });
    } catch (err) {
      console.log("Local fallback API request failed (normal for offline):", err);
    }

    return true;
  } catch (err) {
    console.log("BLE transmission error:", err);
    return false;
  }
};

export const cancelDeviceConnection = async (deviceId: string) => {
  try {
    const mgr = getManager();
    await mgr.cancelDeviceConnection(deviceId);
    console.log("Successfully disconnected from BLE device:", deviceId);
  } catch (err) {
    console.log("Failed to disconnect from BLE device:", err);
  }
};
