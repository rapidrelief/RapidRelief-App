import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sendUserSOS } from "@/app/services/sosService";

interface SosButtonProps {
  scale?: number;           
  showEmergencyText?: boolean;
}

const SosButton = ({ scale = 1, showEmergencyText = true }: SosButtonProps) => {
  const { width } = useWindowDimensions();
  const [sending, setSending] = useState(false);
  
  // RESPONSIVE LOGIC: 
  // 1. Take 50% of screen width as a base
  // 2. Clamp it between 160px and 240px so it doesn't break on tablets or tiny phones
  // 3. Apply the 'scale' modifier for Dashboard vs Full Page use
  const baseSize = Math.min(Math.max(width * 0.5, 160), 240) * scale;

  const handleLongPress = async () => {
    if (sending) return;

    try {
      setSending(true);
      const result = await sendUserSOS("USER");

      if (result?.error || result?.detail) {
        Alert.alert("SOS Failed", String(result.error || result.detail));
        return;
      }

      Alert.alert("SOS Sent", "Your request has been sent to rescuers.");
    } catch (err: any) {
      Alert.alert("SOS Failed", err?.message || "Could not send SOS request.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="items-center justify-center">
      {/* Outer Rings - Padding scales with button size */}
      <View style={{ padding: baseSize * 0.08 }} className="bg-red-50 rounded-full">
        <View style={{ padding: baseSize * 0.04 }} className="bg-red-100 rounded-full">
          <TouchableOpacity 
            activeOpacity={0.8}
            onLongPress={handleLongPress}
            delayLongPress={3000}
            style={{ width: baseSize, height: baseSize }}
            className={`${sending ? "bg-gray-500" : "bg-[#EF4444]"} rounded-full items-center justify-center shadow-2xl`}
          >
            <MaterialCommunityIcons 
               name="phone-outline" 
               size={baseSize * 0.16} 
               color="white" 
            />
            
            <Text 
              style={{ fontSize: baseSize * 0.24 }}
              className="text-white font-black tracking-tighter leading-none mt-1"
            >
              {sending ? "..." : "SOS"}
            </Text>

            {showEmergencyText && (
              <Text 
                style={{ fontSize: baseSize * 0.06 }}
                className="text-white font-bold uppercase tracking-[1px] mt-1"
              >
                EMERGENCY
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default memo(SosButton);
