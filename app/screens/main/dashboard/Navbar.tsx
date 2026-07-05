import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter, useFocusEffect } from "expo-router";
import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import {
  Platform,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Text,
} from "react-native";

import { auth, db } from "@/app/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

import ProfileDropdown from "../../../drawer/Profilepath/ProfileDropdown";

// ✅ IMPORT notifications
import { getNotifications } from "@/app/services/notificationService";

interface NavbarProps {
  onMenuPress?: () => void;
}

const Navbar = ({ onMenuPress }: NavbarProps) => {
  const router = useRouter();
  const navigation = useNavigation();

  const [showProfile, setShowProfile] = useState(false);
  const [fullName, setFullName] = useState("");

  // ✅ NEW: unread state
  const [hasUnread, setHasUnread] = useState(false);

  const topPadding = useMemo(
    () => (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 44),
    [],
  );

  // 🔥 LOAD USER
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setFullName(data.fullName || "");
        }
      }
    );

    return unsubscribe;
  }, []);

  // ✅ LOAD NOTIFICATIONS
  const loadUnread = async () => {
    const data = await getNotifications();
    const unread = data.some(n => n.isUnread);
    setHasUnread(unread);
  };

  // ✅ REFRESH when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadUnread();
    }, [])
  );

  const handleOpenDrawer = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  return (
    <>
      <View className="absolute top-0 left-0 right-0 z-50 bg-white/95 border-b border-slate-100 shadow-sm shadow-slate-100 pb-1">
        <View style={{ height: topPadding }} />

        <View className="flex-row items-center justify-between px-5 h-16">

          {/* LEFT */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleOpenDrawer}
              hitSlop={15}
              className="p-2 mr-3 bg-slate-50 rounded-full border border-slate-100"
            >
              <Feather name="menu" size={20} color="#334155" />
            </TouchableOpacity>

            <View className="bg-blue-600 w-9 h-9 rounded-[12px] items-center justify-center shadow-sm shadow-blue-300 border border-blue-500">
              <MaterialCommunityIcons name="shield-star" size={20} color="white" />
            </View>
            <Text className="ml-2 font-black text-[17px] text-slate-800 tracking-tighter">RapidRelief</Text>
          </View>

          {/* RIGHT */}
          <View className="flex-row items-center gap-x-3">

            {/* 🔔 NOTIFICATION ICON */}
            <TouchableOpacity
              onPress={() => router.push("/drawer/notification")}
              className="relative p-2 bg-slate-50 rounded-full border border-slate-100"
              hitSlop={10}
            >
              <Ionicons name="notifications-outline" size={20} color="#334155" />

              {/* ✅ CONDITIONAL RED DOT */}
              {hasUnread && (
                <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </TouchableOpacity>

            {/* 👤 PROFILE */}
            <TouchableOpacity
              onPress={() => setShowProfile(!showProfile)}
              className={`p-2 rounded-full border ${showProfile ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-100"}`}
            >
              <Feather
                name="user"
                size={20}
                color={showProfile ? "#2563EB" : "#334155"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* PROFILE DROPDOWN */}
      {showProfile && (
        <>
          <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
            <View
              className="absolute inset-0 z-[90] bg-transparent"
              style={{ width: "100%", height: "1000%" }}
            />
          </TouchableWithoutFeedback>

          <ProfileDropdown
            isVisible={showProfile}
            onClose={() => setShowProfile(false)}
            fullName={fullName}
          />
        </>
      )}
    </>
  );
};

export default memo(Navbar);