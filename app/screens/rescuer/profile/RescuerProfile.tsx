import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>No profile data found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView>
       {/* ================= HEADER ================= */}
<View
  style={{
    backgroundColor: "#2563EB",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  }}
>
  {/* TOP ROW */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {/* MENU BUTTON */}
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="menu" size={24} color="white" />
    </TouchableOpacity>

    <Text
      style={{
        color: "white",
        fontSize: 22,
        fontWeight: "bold",
      }}
    >
      Profile
    </Text>

    {/* Empty spacer to center title */}
    <View style={{ width: 40 }} />
  </View>

  {/* USER INFO */}
  <View
    style={{
      marginTop: 16,
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
    }}
  >
    <Text
      style={{
        color: "white",
        fontSize: 17,
        fontWeight: "bold",
      }}
    >
      {userData.fullName}
    </Text>

    <Text
      style={{
        color: "#DBEAFE",
        fontSize: 13,
        marginTop: 2,
      }}
    >
      Rescuer ID: {userData.rescuerId}
    </Text>
  </View>
</View>
        {/* ================= DETAILS CARD ================= */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 18,
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <ProfileItem
              icon="mail-outline"
              label="Email"
              value={userData.email}
            />

            <ProfileItem
              icon="call-outline"
              label="Phone"
              value={userData.phone}
            />

            <ProfileItem
              icon="person-outline"
              label="Role"
              value={userData.role}
            />

            <ProfileItem
              icon="card-outline"
              label="CNIC"
              value={userData.cnic}
            />

            <ProfileItem
              icon="location-outline"
              label="Address"
              value={userData.address}
            />

            <ProfileItem
              icon="pulse-outline"
              label="Status"
              value="Active Rescuer"
            />

            {/* ================= DELETE ACCOUNT ================= */}
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                marginTop: 20,
                backgroundColor: "#111827",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Delete Account
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#6B7280",
                textAlign: "center",
              }}
            >
              Account deletion requests must be handled by an administrator.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ================= LOGOUT BAR ================= */}
      <View
        style={{
          backgroundColor: "#C10F0F",
          paddingVertical: 20,
          paddingHorizontal: 20,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        }}
      >
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#fff" />

          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              marginLeft: 2,
              fontSize: 16,
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            textAlign: "center",
            color: "#FECACA",
            marginTop: 6,
            fontSize: 12,
          }}
        >
          Press to securely logout of your account
        </Text>
      </View>

      {/* ================= DELETE ACCOUNT POPUP ================= */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Delete Account
            </Text>

            <Text
              style={{
                color: "#6B7280",
                lineHeight: 22,
              }}
            >
              Account deletion is not available from the mobile application.
              Please contact the system administrator to permanently remove
              your account.
            </Text>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 20,
                backgroundColor: "#2563EB",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ================= REUSABLE ROW =================

const ProfileItem = ({ icon, label, value }: any) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
      }}
    >
      <Ionicons name={icon} size={20} color="#2563EB" />

      <View
        style={{
          marginLeft: 12,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: "#6B7280",
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {value || "N/A"}
        </Text>
      </View>
    </View>
  );
};