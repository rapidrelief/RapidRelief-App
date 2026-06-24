import React, { useState, useMemo, useEffect } from 'react'; 
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Navbar from '../Navbar'; 
import ProfileHeader from './ProfileHeader';
import InfoStatsCard from './InfoStatsCard';
import CustomInputField from './CustomInputField';
import AccountInfo from './AccountInfo';
import { Alert } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from 'react';
import DeleteModal from './_DeleteModal';
import PrivacyModal from './_PrivacyModal';

//firebase import
import { auth, db } from '@/app/config/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser, } from 'firebase/auth';
import Emergency from '../Emergency';
import * as Location from "expo-location";
import { getZonesMap } from '@/app/services/api';
import { getEmergencyContacts, normalizeEmergencyContacts } from '@/app/services/emergencyContactsService';

const PersonalScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [zones, setZones] = useState<any[]>([]);
  const [role, setRole] = useState("");

  //user data
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    emergency: "",
    address: "",
    cnic: "",
  });

  //original values
  const [originalUserInfo, setOriginalUserInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    emergency: "",
    address: "",
    cnic: "",
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<'password' | 'privacy' | null>(null);
  
//Save function
  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) return;

      if (userInfo.emergency.length < 11) {
        Alert.alert(
          "Invalid Number", 
          "Emergency contact must be exactly 11 digits example:033xxxxxxxxx"
        );
        return;
      }
      if (userInfo.emergency.length > 11) {
        Alert.alert(
          "Invalid Number", 
          "Emergency contact cannot exceed 11 digits"
        );
        return;
      }

      const contacts = await getEmergencyContacts();

      await updateDoc(doc(db, "users", currentUser.uid), {
        emergency: userInfo.emergency,
        emergencyContacts: {
          primary: userInfo.emergency,
          secondary: contacts.secondary || [],
        },
        address: userInfo.address,
      });

      setOriginalUserInfo(userInfo);
      setIsEditing(false);

      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.log("Update error:", error);
      Alert.alert("Error", "Could not update profile");
    }
  };
//cancel function
  const handelCancel = () => {
    setUserInfo(originalUserInfo);
    setIsEditing(false);
  }

  const getLocation = async () => {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") return;

          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log("Location error:", error);
    }
  };

  const loadZones = async () => {
    try {
      const data = await getZonesMap();
        setZones(data?.zones || []);
      } catch (error) {
        console.log("Zone load failed:", error);
      setZones([]);
      }
    };

  // Responsive Text Scaling
  const res = useMemo(() => ({
    titleSize: Math.min(width * 0.045, 18),
    textSize: Math.min(width * 0.035, 14),
  }), [width]);

useEffect(() => {
  const fetchUserData = async () => {
    
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.log("No logged in user");
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      console.log("Current UID:", currentUser.uid);
      const userDoc = await getDoc(userDocRef);


      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("Firestore Data:", data);

        setRole(data.role);

        const fetchedData = {
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          emergency: data.role ==="rescuer" ? "" : (normalizeEmergencyContacts(data).primary || ""),
          address: data.address || "",
          cnic: data.cnic || "",
        };
        setUserInfo(fetchedData);
        setOriginalUserInfo(fetchedData);
        setLoading(false)
      } else {
        console.log("User document not found");
      }
    }catch (error) {
      console.log("Error fetching user data:", error);
      setLoading(false);
    }
  };

  fetchUserData();
}, []);

useFocusEffect(
  useCallback(() => {
    getLocation();
    loadZones();
  }, [])
);

  const emergencyError = 
    isEditing &&
    userInfo.emergency.length > 0 &&
    userInfo.emergency.length !== 11;


  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">

      <Navbar />

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: insets.top + 60, 
          paddingBottom: insets.bottom + 20 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          <ProfileHeader isEditing={isEditing} setIsEditing={setIsEditing} onSave={handleSave} onCancle={handelCancel} />
          
          <InfoStatsCard 
          isEditing={isEditing}
          fullName={userInfo.fullName}
          email={userInfo.email}
          userLocation={userLocation}
          zones={zones} />

          {/* Contact Information */}
          <View className="px-6 mb-6">
            <Text style={{ fontSize: res.titleSize }} className="font-extrabold text-[#1E293B] mb-4">
              Contact Information
            </Text>
            <View className="space-y-1">
              <CustomInputField label="Full Name" value={userInfo.fullName} icon="user" editable={false} loading={loading} />
              <CustomInputField label="Email Address" value={userInfo.email} icon="mail" editable={false} loading={loading} />
              <CustomInputField label="Phone Number" value={userInfo.phone}icon="phone" editable={false} loading={loading} />
              {role !== "rescuer" && (
              <CustomInputField label="Emergency Contact" value={userInfo.emergency} icon="shield" required editable={isEditing} loading={loading} keyboardType="phone-pad"
                error={emergencyError}
                errorMessage={
                  userInfo.emergency.length > 11
                    ? "Emergency number cannot exceed 11 digits" 
                    : "Emergency number must be exactly 11 digits"
                }
                onChangeText={(text) => {const cleaned = text.replace(/[^0-9]/g, "");

                  setUserInfo({ ...userInfo, emergency: cleaned });
                
              }}  />
            )}
            </View>
          </View>

          {/* Address Details */}
          <View className="px-6 mb-6">
            <Text style={{ fontSize: res.titleSize }} className="font-extrabold text-[#1E293B] mb-4">
              Address Details
            </Text>
            <View className="space-y-1">
              <CustomInputField label="Street Address" value={userInfo.address} icon="map-pin" editable={isEditing}  onChangeText={(text) => setUserInfo({ ...userInfo, address: text })} loading={loading} />
              <CustomInputField label="City" value="Lahore" icon="map" editable={isEditing} loading={loading} />
              <CustomInputField label="Country" value="Pakistan" icon="globe" editable={false} loading={loading} />
            </View>
          </View>

          <AccountInfo />

          {/* Security Section - Tailwind Optimized */}
          <View className="mx-6 p-5 bg-white border border-[#F1F5F9] rounded-[32px] shadow-sm mb-6">
            <Text style={{ fontSize: res.titleSize }} className="font-extrabold text-[#1E293B] mb-4">
              Security & Privacy
            </Text>
            
            <View className="gap-y-2"> 
              <TouchableOpacity 
                disabled={isEditing} 
                onPress={() => {
                  setPrivacyMode('password');
                  setPrivacyModalVisible(true);
                }}
                className={`w-full py-3.5 border border-[#F1F5F9] rounded-2xl items-center active:bg-slate-50 ${isEditing ? 'opacity-40' : ''}`}
              >
                <Text style={{ fontSize: res.textSize }} className="text-[#1E293B] font-bold">
                  Change Password
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                disabled={isEditing} 
                onPress={() => {
                  setPrivacyMode('privacy');
                  setPrivacyModalVisible(true);
                }}
                className={`w-full py-3.5 border border-[#F1F5F9] rounded-2xl items-center active:bg-slate-50 ${isEditing ? 'opacity-40' : ''}`}
              >
                <Text style={{ fontSize: res.textSize }} className="text-[#1E293B] font-bold">
                  Privacy Settings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                disabled={isEditing}
                onPress={() => setDeleteModalVisible(true)} 
                className={`w-full py-3.5 border border-red-100 bg-red-50 rounded-2xl items-center active:bg-red-100 ${isEditing ? 'opacity-40' : ''}`}
              >
                <Text style={{ fontSize: res.textSize }} className="text-red-500 font-bold">
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <PrivacyModal
        isVisible={privacyModalVisible}
        mode={privacyMode}
        onClose={() => {
          setPrivacyModalVisible(false);
          setPrivacyMode(null);
        }}
      />
      <DeleteModal
        isVisible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      />    
    </SafeAreaView>
  );
};

export default PersonalScreen;
