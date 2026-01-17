import React, { useState } from 'react'; 
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // Use Expo Router
import Navbar from '../Navbar'; 
import Sidebar from '../Sidebar'; 
import ProfileHeader from './ProfileHeader';
import InfoStatsCard from './InfoStatsCard';
import CustomInputField from './CustomInputField';
import AccountInfo from './AccountInfo';

const PersonalScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter(); // Initialize router
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Updated navigation logic to match your 'app/drawer' folder structure
  const handleNavigation = (screenName: string) => {
    setIsMenuOpen(false);
    
    // Mapping sidebar names to your actual folder paths
    const routes: Record<string, string> = {
      'Dashboard': '/drawer/dashboard',
      'Alerts': '/drawer/AlertPath',
      'Settings': '/drawer/settingPath',
      'Live Map': '/drawer/LiveMap',
      'Profile': '/drawer/Profile',
    };

    const path = routes[screenName];
    if (path) {
      router.push(path as any);
    } else {
      console.warn(`Path for ${screenName} not found`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        currentScreen="Settings" 
        onNavigate={handleNavigation} 
      />

      <Navbar onMenuPress={() => setIsMenuOpen(true)} />

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: insets.top + 70, 
          paddingBottom: insets.bottom + 60 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          <ProfileHeader isEditing={isEditing} setIsEditing={setIsEditing} />
          
          <InfoStatsCard isEditing={isEditing} />

          {/* Contact Information */}
          <View className="px-6 mb-8">
            <Text className="text-lg font-extrabold text-[#1E293B] mb-4">Contact Information</Text>
            <CustomInputField label="Full Name" value="John Doe" icon="user" editable={isEditing} />
            <CustomInputField label="Email Address" value="john.doe@example.com" icon="mail" editable={isEditing} />
            <CustomInputField label="Phone Number" value="+92 300 1234567" icon="phone" editable={isEditing} />
            <CustomInputField label="Emergency Contact" value="+92 321 7654321" icon="shield" required editable={isEditing} />
          </View>

          {/* Address Details */}
          <View className="px-6 mb-10">
            <Text className="text-lg font-extrabold text-[#1E293B] mb-4">Address Details</Text>
            <CustomInputField label="Street Address" value="House 123, Street 45, Gulberg III" icon="map-pin" editable={isEditing} />
            <CustomInputField label="City" value="Lahore" icon="map" editable={isEditing} />
            <CustomInputField label="Country" value="Pakistan" icon="globe" editable={isEditing} />
          </View>

          <AccountInfo />

          {/* Security Section */}
          <View className="mx-6 bg-white p-6 rounded-[32px] border border-[#F1F5F9] shadow-sm mb-10">
            <Text className="text-lg font-extrabold text-[#1E293B] mb-5">Security & Privacy</Text>
            <TouchableOpacity disabled={isEditing} className={`w-full py-4 border border-[#F1F5F9] rounded-2xl items-center mb-3 ${isEditing ? 'opacity-40' : ''}`}>
              <Text className="text-[#1E293B] font-bold">Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={isEditing} className={`w-full py-4 border border-[#F1F5F9] rounded-2xl items-center mb-3 ${isEditing ? 'opacity-40' : ''}`}>
              <Text className="text-[#1E293B] font-bold">Privacy Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={isEditing} className={`w-full py-4 border border-red-100 bg-red-50 rounded-2xl items-center ${isEditing ? 'opacity-40' : ''}`}>
              <Text className="text-red-500 font-bold">Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalScreen;