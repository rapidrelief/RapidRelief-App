import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { useRouter } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";


function CustomDrawerContent(props: any) {
  const pathname = usePathname();
  const router = useRouter();
  
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const menuItems = [
    { name: "Dashboard", route: "dashboard/index", path: "/drawer/dashboard", icon: "grid" },
    { name: "Map", route: "LiveMap/index", path: "/drawer/LiveMap", icon: "map" },
    { name: "Alerts", route: "AlertPath/index", path: "/drawer/AlertPath", icon: "alert-triangle" },
    { name: "Weather", route: "weatherPath/index", path: "/drawer/weatherPath", icon: "cloud-drizzle" },
    { name: "SOS", route: "sospath/index", path: "/drawer/sospath", icon: "rss" },
    { name: "Notifications", route: "notification/index", path: "/drawer/notification", icon: "bell" },
    { name: "Settings", route: "settingPath/index", path: "/drawer/settingPath", icon: "settings" },
  ];

  return (
    <View className="flex-1 bg-white">
      
      {/* HEADER */}
      <View className="px-6 pt-12 pb-6 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-800">Menu</Text>

        {/* CLOSE BUTTON */}
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <Feather name="x" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* MENU */}
      <ScrollView className="px-3 mt-8">
        {menuItems.map((item, index) => {
          const isActive = pathname.startsWith(item.path);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                props.navigation.navigate(item.route);
                props.navigation.closeDrawer();
              }}
              className={`flex-row items-center p-4 rounded-xl mb-2 border-l-4 ${
                isActive
                  ? "bg-blue-100 border-blue-600"
                  : "border-transparent"
              }`}
            >
              <Feather
                name={item.icon as any}
                size={20}
                color={isActive ? "#2563EB" : "#6B7280"}
              />

              <Text
                className={`ml-4 text-base ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600"
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* FLOATING AI BUTTON */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20, marginTop: 10 }}>
        <Animated.View style={{ transform: [{ translateY: floatAnim }], shadowColor: '#0B1120', shadowOffset: {width: 0, height: 12}, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              props.navigation.navigate("botPath/index");
              props.navigation.closeDrawer();
            }}
          >
            <LinearGradient
              colors={['#0B1120', '#1E1B4B']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={{ paddingVertical: 16, paddingHorizontal: 20, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: 10, borderRadius: 20, marginRight: 14 }}>
                <Feather name="cpu" size={26} color="#60a5fa" />
              </View>
              <View>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Ask AI Assistant</Text>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Weather & Emergency intel</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        onPress={() => {
          props.navigation.closeDrawer();
          router.replace('/auth/Login');
        }}
        className="flex-row items-center p-6 border-t border-gray-100 mb-5"
      >
        <Feather name="log-out" size={20} color="#EF4444" />
        <Text className="ml-4 text-red-500 font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: "front",
        }}
      >
        <Drawer.Screen name="dashboard/index" />
        <Drawer.Screen name="sospath/index" />
        <Drawer.Screen name="LiveMap/index" />
        <Drawer.Screen name="AlertPath/index" />
        <Drawer.Screen name="weatherPath/index" />
        <Drawer.Screen name="botPath/index" />
        <Drawer.Screen name="settingPath/index" />
        <Drawer.Screen name="notification/index" />
      </Drawer>
    </GestureHandlerRootView>
  );
}