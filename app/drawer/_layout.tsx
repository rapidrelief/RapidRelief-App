import Sidebar from "@/app/screens/main/dashboard/Sidebar";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DrawerLayout() {
  const [currentScreen, setCurrentScreen] = React.useState("Dashboard");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => (
          <Sidebar
            {...props}
            isOpen={true}
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onClose={() => props.navigation.closeDrawer()}
          />
        )}
        screenOptions={{
          headerShown: false,
          drawerType: "front",
        }}
      >
        <Drawer.Screen name="dashboard/index" />
        <Drawer.Screen name="sospath/index" />
        <Drawer.Screen name="LiveMap/index" />
        <Drawer.Screen name="AlertPath/index" />
        <Drawer.Screen name="settingPath/index" />

        {/* ✅ ADD THIS LINE */}
        <Drawer.Screen name="notification/index" />
      </Drawer>
    </GestureHandlerRootView>
  );
}
