import React, { useState, useMemo } from 'react'; 
import { 
  ScrollView, View, Text, TouchableOpacity, 
  useWindowDimensions, Platform, KeyboardAvoidingView 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Internal Components
import Navbar from '../Navbar'; 
import Sidebar from '../Sidebar'; 
import ProfileHeader from './ProfileHeader';
import InfoStatsCard from './InfoStatsCard';
import CustomInputField from './CustomInputField';
import AccountInfo from './AccountInfo';
import PrivacyModal from './_PrivacyModal';
import DeleteModal from './_DeleteModal';

const PersonalScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalMode, setModalMode] = useState<'password' | 'privacy' | 'delete' | null>(null);

  const res = useMemo(() => {
    const scale = width / 375;
    const ms = (size: number, factor = 0.5) => size + (scale * size - size) * factor;

    return {
      titleSize: ms(20),
      textSize: ms(15),
      padding: width * 0.06,
      spacing: ms(16),
      cardRadius: ms(32),
      isTablet: width > 768,
    };
  }, [width]);

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={['top', 'left', 'right']}>
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        currentScreen="Settings" 
        onNavigate={() => setIsMenuOpen(false)} 
      />

      <Navbar onMenuPress={() => setIsMenuOpen(true)} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ 
            paddingTop: Platform.OS === 'ios' ? 70 : 90, 
            paddingBottom: insets.bottom + 40 
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full self-center" style={{ maxWidth: res.isTablet ? 600 : '100%' }}>
            
            <ProfileHeader isEditing={isEditing} setIsEditing={setIsEditing} />
            
            <View style={{ marginBottom: res.spacing }}>
              <InfoStatsCard isEditing={isEditing} />
            </View>

            <View style={{ paddingHorizontal: res.padding }} className="mb-8">
              <Text style={{ fontSize: res.titleSize }} className="font-black text-[#0F172A] mb-4">
                Contact Information
              </Text>
              <View style={{ gap: res.spacing / 2 }}>
                <CustomInputField label="Full Name" value="John Doe" icon="user" editable={isEditing} />
                <CustomInputField label="Email Address" value="john.doe@example.com" icon="mail" editable={isEditing} />
                <CustomInputField label="Phone" value="+92 300 1234567" icon="phone" editable={isEditing} />
              </View>
            </View>

            <AccountInfo />

            <View 
              style={{ 
                marginHorizontal: res.padding, 
                padding: res.padding,
                borderRadius: res.cardRadius,
                marginTop: res.spacing
              }} 
              className="bg-white border border-slate-100 shadow-sm mb-6"
            >
              <Text style={{ fontSize: res.titleSize }} className="font-extrabold text-[#1E293B] mb-5">
                Security & Privacy
              </Text>

              <View style={{ gap: res.spacing }}> 
                <TouchableOpacity 
                  onPress={() => setModalMode('password')}
                  style={{ paddingVertical: res.spacing }}
                  className="w-full border border-slate-100 rounded-2xl items-center active:bg-slate-50"
                >
                  <Text style={{ fontSize: res.textSize }} className="text-[#1E293B] font-bold">Change Password</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => setModalMode('privacy')}
                  style={{ paddingVertical: res.spacing }}
                  className="w-full border border-slate-100 rounded-2xl items-center active:bg-slate-50"
                >
                  <Text style={{ fontSize: res.textSize }} className="text-[#1E293B] font-bold">Privacy Settings</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => setModalMode('delete')}
                  style={{ paddingVertical: res.spacing }}
                  className="w-full bg-red-50 border border-red-100 rounded-2xl items-center"
                >
                  <Text style={{ fontSize: res.textSize }} className="text-red-500 font-bold">Delete Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PrivacyModal 
        isVisible={modalMode === 'password' || modalMode === 'privacy'} 
        mode={modalMode === 'delete' ? null : modalMode} 
        onClose={() => setModalMode(null)} 
      />

      <DeleteModal 
        isVisible={modalMode === 'delete'} 
        onClose={() => setModalMode(null)} 
      />
    </SafeAreaView>
  );
};

export default PersonalScreen;