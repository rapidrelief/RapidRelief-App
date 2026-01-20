import React, { useState, memo, useMemo } from 'react';
import { Platform, StatusBar, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProfileDropdown from '../../../drawer/Profilepath/ProfileDropdown';

interface NavbarProps {
  onMenuPress: () => void;
}

const Navbar = ({ onMenuPress }: NavbarProps) => {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  
  // Memoize status bar height calculation
  const topPadding = useMemo(() => 
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44
  , []);

  return (
    <>
      <View 
        className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm"
      >
        <View style={{ height: topPadding }} />

        <View className="flex-row items-center justify-between px-5 h-16">
          {/* Left: Menu & Logo */}
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onMenuPress} hitSlop={15} className="p-1 mr-3">
              <Feather name="menu" size={24} color="#4B5563" />
            </TouchableOpacity>

            <View className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-400">
              <MaterialCommunityIcons name="star" size={20} color="white" />
            </View>
          </View>

          {/* Right: Actions */}
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.push('/screens/main/dashboard/Notification/NotificationScreen')}
              className="mr-4 relative p-1"
              hitSlop={10}
            >
              <Ionicons name="notifications-outline" size={24} color="#4B5563" />
              <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowProfile(!showProfile)} 
              className={`p-1 rounded-full ${showProfile ? 'bg-blue-50' : ''}`}
            >
              <Feather name="user" size={24} color={showProfile ? "#2563EB" : "#4B5563"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showProfile && (
        <>
          <TouchableWithoutFeedback onPress={() => setShowProfile(false)}>
            <View className="absolute inset-0 z-[90] bg-transparent w-full h-full" />
          </TouchableWithoutFeedback>
          <ProfileDropdown isVisible={showProfile} onClose={() => setShowProfile(false)} />
        </>
      )}
    </>
  );
};

export default memo(Navbar);