import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import "./global.css";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        <StatusBar style="dark" />
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}
