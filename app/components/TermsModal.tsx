import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, useWindowDimensions, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose }) => {
  const { height } = useWindowDimensions();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View 
          style={{ 
            backgroundColor: '#0F172A', 
            borderTopLeftRadius: 30, 
            borderTopRightRadius: 30, 
            height: height * 0.85,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-bold text-2xl">Terms & Privacy Policy</Text>
            <TouchableOpacity onPress={onClose} className="bg-white/10 p-2 rounded-full">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            
            <Text className="text-white/90 text-base font-semibold mb-2">1. Introduction</Text>
            <Text className="text-white/70 text-sm mb-6 leading-6">
              Welcome to Rapid Relief. This platform connects civilians with rescuers during natural disasters and emergencies. By using our application, you agree to these terms. Please read them carefully.
            </Text>

            <Text className="text-white/90 text-base font-semibold mb-2">2. Emergency Services Disclaimer</Text>
            <Text className="text-white/70 text-sm mb-6 leading-6">
              Rapid Relief is an auxiliary communication tool for disaster response. It does NOT replace official emergency services (like 911 or local emergency numbers). Always contact local authorities directly if you are in immediate life-threatening danger.
            </Text>

            <Text className="text-white/90 text-base font-semibold mb-2">3. Location Tracking & Privacy</Text>
            <Text className="text-white/70 text-sm mb-6 leading-6">
              To provide rescue services, the app requires access to your GPS location. During an active SOS beacon, your real-time location is shared with authorized rescuers. We do not sell your data or track your location when the app is fully closed and no SOS is active.
            </Text>

            <Text className="text-white/90 text-base font-semibold mb-2">4. Acceptable Use</Text>
            <Text className="text-white/70 text-sm mb-6 leading-6">
              You agree not to abuse the SOS feature. False SOS alerts endanger lives by diverting rescuers from real emergencies. Accounts found triggering fake emergencies will be permanently banned.
            </Text>

            <Text className="text-white/90 text-base font-semibold mb-2">5. Offline SOS via SMS</Text>
            <Text className="text-white/70 text-sm mb-6 leading-6">
              Our Offline SOS feature uses standard SMS to transmit encrypted location data to our servers. Standard carrier messaging rates apply. Delivery of these SMS messages depends entirely on your cellular provider's network availability.
            </Text>

            <Text className="text-white/90 text-base font-semibold mb-2">6. Rescuer Verification</Text>
            <Text className="text-white/70 text-sm mb-6 leading-6">
              If you register as a Rescuer, you must provide valid government identification (CNIC) and organizational affiliation. Misrepresentation of authority is strictly prohibited and violates local laws.
            </Text>

          </ScrollView>

          {/* Footer Action */}
          <SafeAreaView edges={['bottom']}>
            <TouchableOpacity 
              onPress={onClose}
              className="bg-[#33B3FF] py-4 rounded-2xl items-center shadow-lg mt-4"
              style={{ shadowColor: '#33B3FF', shadowOpacity: 0.3, shadowRadius: 10 }}
            >
              <Text className="text-white font-bold text-lg">I Understand</Text>
            </TouchableOpacity>
          </SafeAreaView>

        </View>
      </View>
    </Modal>
  );
};

export default TermsModal;
