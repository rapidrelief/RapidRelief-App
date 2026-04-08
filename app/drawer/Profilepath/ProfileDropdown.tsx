import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileDropdownProps {
  isVisible: boolean;
  onClose: () => void;
  fullName?: string;
}

const ProfileDropdown = ({ isVisible, onClose, fullName = "" }: ProfileDropdownProps) => {
  const router = useRouter();

  if (!isVisible) return null;

  const handleNavigateToProfile = () => {
    onClose(); 
    // This points to your current Personal Information screen
    router.push('/drawer/Profile/PersonalInfo'); 
  };

  // 1. ADDED HANDLER FOR SETTINGS
  const handleNavigateToSettings = () => {
    onClose();
    // Path identified from your explorer: app/drawer/settingPath
    router.push('/drawer/settingPath'); 
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return "U";

    const nameParts = name.trim().split(" ").filter(Boolean);

    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }

    return (
      nameParts[0][0].toUpperCase() +
      nameParts[1][0].toUpperCase()
    );
  };

  const displayName = useMemo(() => {
    return fullName?.trim() ? fullName : "User";
  }, [fullName]);

  return (
    <View 
      className="absolute right-4 top-[105px] w-64 bg-white rounded-3xl border border-slate-100 z-[100]"
      style={styles.dropdownShadow}
    >
      {/* Blue Header Section */}
      <View className="bg-[#EBF3FF] p-4 flex-row items-center rounded-t-3xl">
        <View className="w-12 h-12 bg-[#2563EB] rounded-full items-center justify-center shadow-sm">
          <Text className="text-white font-bold text-lg">
            {getInitials(displayName)}
            </Text>
        </View>

        <View className="ml-3 flex-1">
          <Text 
          numberOfLines={1}
          className="font-bold text-slate-900 text-base">
            {displayName}
            </Text>
          <Text className="text-slate-500 text-xs font-medium">Citizen</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="p-2">
        <TouchableOpacity 
          onPress={handleNavigateToProfile}
          activeOpacity={0.6}
          className="flex-row items-center p-3 rounded-2xl active:bg-slate-50"
        >
          <View className="w-8 h-8 items-center justify-center">
             <Feather name="user" size={18} color="#64748B" />
          </View>
          <View className="ml-1">
            <Text className="font-semibold text-slate-800 text-sm">Personal Information</Text>
            <Text className="text-slate-400 text-[10px]">View and edit your profile</Text>
          </View>
        </TouchableOpacity>

        {/* 2. UPDATED SETTINGS BUTTON */}
        <TouchableOpacity 
          onPress={handleNavigateToSettings} // Link the handler here
          activeOpacity={0.6}
          className="flex-row items-center p-3 rounded-2xl active:bg-slate-50"
        >
           <View className="w-8 h-8 items-center justify-center">
             <Feather name="settings" size={18} color="#64748B" />
          </View>
          <View className="ml-1">
            <Text className="font-semibold text-slate-800 text-sm">Settings</Text>
            <Text className="text-slate-400 text-[10px]">App preferences</Text>
          </View>
        </TouchableOpacity>

        <View className="h-[1px] bg-slate-100 my-1 mx-3" />

        <TouchableOpacity 
          activeOpacity={0.6}
          onPress={() => {
            onClose();
            router.replace('/auth/Login'); // Added basic logout navigation
          }}
          className="flex-row items-center p-3 rounded-2xl active:bg-red-50"
        >
          <View className="w-8 h-8 items-center justify-center">
            <MaterialCommunityIcons name="logout-variant" size={18} color="#EF4444" />
          </View>
          <View className="ml-1">
            <Text className="font-semibold text-red-500 text-sm">Logout</Text>
            <Text className="text-red-300 text-[10px]">Sign out of your account</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  }
});

export default ProfileDropdown;