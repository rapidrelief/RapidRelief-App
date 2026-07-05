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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <Text style={{ color: "#64748B", fontWeight: "bold" }}>No profile data found</Text>
      </View>
    );
  }

  const initial = userData.fullName ? userData.fullName.charAt(0).toUpperCase() : "R";

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
    >
      {/* ================= HEADER ================= */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#94A3B8",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
            borderWidth: 1,
            borderColor: "#F1F5F9"
          }}
        >
          <Ionicons name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
          Commander Profile
        </Text>
        
        <View style={{ width: 44, height: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* ================= AVATAR & INFO ================= */}
        <View style={{ alignItems: "center", marginTop: 24, marginBottom: 32, paddingHorizontal: 24 }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            borderWidth: 4,
            borderColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            shadowColor: "#4F46E5",
            shadowOpacity: 0.2,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6
          }}>
            <Text style={{ fontSize: 40, fontWeight: "900", color: "#4F46E5" }}>{initial}</Text>
          </View>
          
          <Text style={{ fontSize: 26, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5, textAlign: "center" }}>
            {userData.fullName}
          </Text>
          
          <View style={{
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 999,
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center"
          }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#4F46E5", marginRight: 8, shadowColor: "#4F46E5", shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: {width:0, height:0} }} />
            <Text style={{ color: "#4F46E5", fontWeight: "900", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              ID: {userData.rescuerId}
            </Text>
          </View>
        </View>

        {/* ================= QUICK STATS ================= */}
        <View style={{ flexDirection: "row", paddingHorizontal: 24, marginBottom: 24, gap: 16, justifyContent: "space-between" }}>
          <View style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: 20,
            alignItems: "center",
            shadowColor: "#94A3B8",
            shadowOpacity: 0.1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
            borderWidth: 1,
            borderColor: "#F1F5F9"
          }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(16, 185, 129, 0.1)", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            </View>
            <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</Text>
            <Text style={{ color: "#1E293B", fontWeight: "900", marginTop: 4, fontSize: 16 }}>Active Duty</Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: 20,
            alignItems: "center",
            shadowColor: "#94A3B8",
            shadowOpacity: 0.1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
            borderWidth: 1,
            borderColor: "#F1F5F9"
          }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(59, 130, 246, 0.1)", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Ionicons name="business" size={24} color="#3B82F6" />
            </View>
            <Text style={{ fontSize: 11, color: "#64748B", fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>Organization</Text>
            <Text style={{ color: "#1E293B", fontWeight: "900", marginTop: 4, fontSize: 16, textAlign: "center" }} numberOfLines={1}>
              {userData.organization_name || "Independent"}
            </Text>
          </View>
        </View>

        {/* ================= DETAILS ================= */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ color: "#94A3B8", fontWeight: "900", fontSize: 14, marginBottom: 12, marginLeft: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Personal Details
          </Text>
          <View style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            shadowColor: "#94A3B8",
            shadowOpacity: 0.1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
            borderWidth: 1,
            borderColor: "#F1F5F9",
            overflow: "hidden"
          }}>
            <ProfileItem icon="mail" label="Email" value={userData.email} />
            <ProfileItem icon="call" label="Phone" value={userData.phone} />
            <ProfileItem icon="person" label="Role" value={userData.role} />
            <ProfileItem icon="card" label="CNIC" value={userData.cnic} />
            <ProfileItem icon="location" label="Address" value={userData.address} noBorder />
          </View>
        </View>

        {/* ================= ACTIONS ================= */}
        <View style={{ paddingHorizontal: 24, gap: 16 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderWidth: 1,
              borderColor: "rgba(239, 68, 68, 0.2)",
              paddingVertical: 18,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={{ color: "#EF4444", fontWeight: "900", fontSize: 16, marginLeft: 8, letterSpacing: 0.5 }}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              paddingVertical: 18,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#94A3B8" />
            <Text style={{ color: "#94A3B8", fontWeight: "800", fontSize: 14, marginLeft: 8 }}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= DELETE ACCOUNT POPUP ================= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 32, padding: 32, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(239, 68, 68, 0.1)", alignItems: "center", justifyContent: "center", marginBottom: 20, alignSelf: "center" }}>
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>
            
            <Text style={{ fontSize: 22, fontWeight: "900", textAlign: "center", color: "#1E293B", marginBottom: 12 }}>
              Action Disabled
            </Text>

            <Text style={{ color: "#64748B", textAlign: "center", marginBottom: 32, lineHeight: 22, fontWeight: "500" }}>
              Account deletion is strictly disabled in the mobile app for security compliance. Please contact your system administrator to securely terminate your commander profile.
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ backgroundColor: "#1E293B", paddingVertical: 18, borderRadius: 20, shadowColor: "#1E293B", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4} }}
            >
              <Text style={{ color: "white", textAlign: "center", fontWeight: "900", fontSize: 15, textTransform: "uppercase", letterSpacing: 0.5 }}>Understood</Text>
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
    <View style={{ flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: noBorder ? 0 : 1, borderBottomColor: "#F1F5F9" }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(79, 70, 229, 0.1)", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={20} color="#4F46E5" />
      </View>

      <View style={{ marginLeft: 16, flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontSize: 15, fontWeight: "800", color: "#1E293B" }} numberOfLines={1}>{value || "N/A"}</Text>
      </View>
    </View>
  );
};