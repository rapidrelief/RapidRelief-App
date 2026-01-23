import React, { useState, useMemo } from 'react'; 
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Navbar from '../Navbar'; 
import Sidebar from '../Sidebar'; 
import ProfileHeader from './ProfileHeader';
import InfoStatsCard from './InfoStatsCard';
import CustomInputField from './CustomInputField';
import AccountInfo from './AccountInfo';

const PersonalScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Responsive Text Scaling
  const res = useMemo(() => ({
    titleSize: Math.min(width * 0.045, 18),
    textSize: Math.min(width * 0.035, 14),
  }), [width]);

  const handleNavigation = (screenName: string) => {
    setIsMenuOpen(false);
    const routes: Record<string, string> = {
      'Dashboard': '/drawer/dashboard',
      'Alerts': '/drawer/AlertPath',
      'Settings': '/drawer/settingPath',
      'Live Map': '/drawer/LiveMap',
      'Profile': '/drawer/Profile',
    };

    const path = routes[screenName];
    if (path) router.push(path as any);
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
          paddingTop: insets.top + 60, 
          paddingBottom: insets.bottom + 20 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full">
          <ProfileHeader isEditing={isEditing} setIsEditing={setIsEditing} />
          
          <InfoStatsCard isEditing={isEditing} />

          {/* Contact Information */}
          <View className="px-6 mb-6">
            <Text style={{ fontSize: res.titleSize }} className="font-extrabold text-[#1E293B] mb-4">
              Contact Information
            </Text>
            <View className="space-y-1">
              <CustomInputField label="Full Name" value="John Doe" icon="user" editable={isEditing} />
              <CustomInputField label="Email Address" value="john.doe@example.com" icon="mail" editable={isEditing} />
              <CustomInputField label="Phone Number" value="+92 300 1234567" icon="phone" editable={isEditing} />
              <CustomInputField label="Emergency Contact" value="+92 321 7654321" icon="shield" required editable={isEditing} />
            </View>
          </View>

          {/* Address Details */}
          <View className="px-6 mb-6">
            <Text style={{ fontSize: res.titleSize }} className="font-extrabold text-[#1E293B] mb-4">
              Address Details
            </Text>
            <View className="space-y-1">
              <CustomInputField label="Street Address" value="House 123, Street 45, Gulberg III" icon="map-pin" editable={isEditing} />
              <CustomInputField label="City" value="Lahore" icon="map" editable={isEditing} />
              <CustomInputField label="Country" value="Pakistan" icon="globe" editable={isEditing} />
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
                className={`w-full py-3.5 border border-[#F1F5F9] rounded-2xl items-center active:bg-slate-50 ${isEditing ? 'opacity-40' : ''}`}
              >
                <Text style={{ fontSize: res.textSize }} className="text-[#1E293B] font-bold">
                  Change Password
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                disabled={isEditing} 
                className={`w-full py-3.5 border border-[#F1F5F9] rounded-2xl items-center active:bg-slate-50 ${isEditing ? 'opacity-40' : ''}`}
              >
                <Text style={{ fontSize: res.textSize }} className="text-[#1E293B] font-bold">
                  Privacy Settings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                disabled={isEditing} 
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
    </SafeAreaView>
  );
};

export default PersonalScreen;