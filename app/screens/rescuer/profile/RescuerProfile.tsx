import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@/app/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function RescuerProfile() {
  const router = useRouter();
  const navigation: any = useNavigation();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (err) {
        console.log("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/auth/Login");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500 font-bold">No profile data found</Text>
      </View>
    );
  }

  const initial = userData.fullName ? userData.fullName.charAt(0).toUpperCase() : "R";

  return (
    <SafeAreaView 
      className="flex-1 bg-gray-50" 
      style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      {/* ================= HEADER ================= */}
      <View className="px-6 py-4 flex-row justify-between items-center bg-gray-50">
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 items-center justify-center shadow-sm"
        >
          <Ionicons name="menu" size={24} color="#111827" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-gray-900 tracking-tight">
          My Profile
        </Text>
        
        <View className="w-10 h-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* ================= AVATAR & INFO ================= */}
        <View className="items-center mt-6 mb-8 px-6">
          <View className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white shadow-sm items-center justify-center mb-4">
            <Text className="text-4xl font-black text-blue-600">{initial}</Text>
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 tracking-tight text-center">
            {userData.fullName}
          </Text>
          <View className="bg-blue-50 px-3 py-1 rounded-full mt-2 border border-blue-100 flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <Text className="text-blue-700 font-bold text-xs uppercase tracking-wider">
              ID: {userData.rescuerId}
            </Text>
          </View>
        </View>

        {/* ================= QUICK STATS ================= */}
        <View className="flex-row px-6 mb-6 justify-between gap-4">
          <View className="flex-1 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm items-center">
            <View className="w-12 h-12 rounded-2xl bg-green-50 items-center justify-center mb-3">
              <Ionicons name="shield-checkmark" size={24} color="#22C55E" />
            </View>
            <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status</Text>
            <Text className="text-gray-900 font-black mt-1 text-base">Active Duty</Text>
          </View>

          <View className="flex-1 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm items-center">
            <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mb-3">
              <Ionicons name="business" size={24} color="#3B82F6" />
            </View>
            <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider">Organization</Text>
            <Text className="text-gray-900 font-black mt-1 text-base text-center" numberOfLines={1}>
              {userData.organization_name || "Independent"}
            </Text>
          </View>
        </View>

        {/* ================= DETAILS ================= */}
        <View className="px-6 mb-6">
          <Text className="text-gray-900 font-bold text-lg mb-4 ml-1">Personal Details</Text>
          <View className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <ProfileItem icon="mail" label="Email" value={userData.email} />
            <ProfileItem icon="call" label="Phone" value={userData.phone} />
            <ProfileItem icon="person" label="Role" value={userData.role} />
            <ProfileItem icon="card" label="CNIC" value={userData.cnic} />
            <ProfileItem icon="location" label="Address" value={userData.address} noBorder />
          </View>
        </View>

        {/* ================= ACTIONS ================= */}
        <View className="px-6 space-y-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full bg-red-50 border border-red-200 py-4 rounded-2xl flex-row items-center justify-center gap-2 mb-3"
          >
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text className="text-red-600 font-extrabold text-base">Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2"
          >
            <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
            <Text className="text-gray-400 font-bold text-sm">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= DELETE ACCOUNT POPUP ================= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-white rounded-3xl p-6 shadow-xl">
            <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mb-4 self-center">
              <Ionicons name="warning" size={24} color="#DC2626" />
            </View>
            
            <Text className="text-xl font-bold text-center text-gray-900 mb-2">
              Cannot Delete Account
            </Text>

            <Text className="text-gray-500 text-center mb-6 leading-relaxed">
              Account deletion is strictly disabled in the mobile app for security compliance. Please contact your system administrator to securely terminate your rescuer profile.
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-gray-900 py-4 rounded-2xl w-full"
            >
              <Text className="text-white text-center font-bold text-base">Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ================= REUSABLE ROW =================
const ProfileItem = ({ icon, label, value, noBorder = false }: any) => {
  return (
    <View className={`flex-row items-center p-4 ${noBorder ? "" : "border-b border-gray-50"}`}>
      <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
        <Ionicons name={icon} size={18} color="#2563EB" />
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</Text>
        <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>{value || "N/A"}</Text>
      </View>
    </View>
  );
};