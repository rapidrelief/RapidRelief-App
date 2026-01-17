import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react'; // Added useState
import { Platform, StatusBar, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import ProfileDropdown from '../../../drawer/Profilepath/ProfileDropdown'; // Import the dropdown component

interface NavbarProps {
  onMenuPress: () => void;
}

const Navbar = ({ onMenuPress }: NavbarProps) => {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false); // State to toggle dropdown
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 44; 

  return (
    <>
      {/* 1. STICKY NAVBAR CONTAINER */}
      <View 
        style={{ top: 0 }} 
        className="absolute left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm"
      >
        <View style={{ height: statusBarHeight }} />

        <View className="flex-row items-center justify-between px-5 h-16">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onMenuPress} className="p-1 mr-3">
              <Feather name="menu" size={24} color="#4B5563" />
            </TouchableOpacity>

            <View className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-400">
              <MaterialCommunityIcons name="star" size={20} color="white" />
            </View>
          </View>

          <View className="flex-row items-center">
            {/* Notification Icon */}
            <TouchableOpacity 
              onPress={() => router.push('/screens/main/dashboard/Notification/NotificationScreen')}
              className="mr-4 relative p-1"
            >
              <Ionicons name="notifications-outline" size={24} color="#4B5563" />
              <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
            
            {/* 2. PROFILE ICON (Triggers Dropdown) */}
            <TouchableOpacity 
              onPress={() => setShowProfile(!showProfile)} 
              className={`p-1 rounded-full ${showProfile ? 'bg-blue-50' : ''}`}
            >
              <Feather name="user" size={24} color={showProfile ? "#2563EB" : "#4B5563"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. DROPDOWN OVERLAY & MENU */}
      {showProfile && (
        <>
          {/* Transparent backdrop to catch clicks outside the menu to close it */}
          <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
            <View className="absolute inset-0 z-[90] h-[2000px] w-full" />
          </TouchableWithoutFeedback>
          
          <ProfileDropdown isVisible={showProfile} onClose={() => setShowProfile(false)} />
        </>
      )}
    </>
  );
};

export default Navbar;