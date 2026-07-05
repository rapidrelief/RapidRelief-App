import React, { memo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sendUserSOS } from "@/app/services/sosService";

interface SosButtonProps {
  scale?: number;           
  showEmergencyText?: boolean;
  isActive?: boolean;
  activeStartTime?: number | null;
}

const formatTime = (diffInSeconds: number) => {
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s active`;
  } else if (diffInSeconds < 3600) {
    const m = Math.floor(diffInSeconds / 60);
    const s = diffInSeconds % 60;
    return `${m}m ${s}s active`;
  } else if (diffInSeconds < 86400) {
    const h = Math.floor(diffInSeconds / 3600);
    const m = Math.floor((diffInSeconds % 3600) / 60);
    return `${h}h ${m}m active`;
  } else {
    const d = Math.floor(diffInSeconds / 86400);
    const h = Math.floor((diffInSeconds % 86400) / 3600);
    return `${d}d ${h}h active`;
  }
};

const SosButton = ({ scale = 1, showEmergencyText = true, isActive = false, activeStartTime = null }: SosButtonProps) => {
  const { width } = useWindowDimensions();
  const [sending, setSending] = useState(false);
  const [elapsedText, setElapsedText] = useState("0s active");
  
  // RESPONSIVE LOGIC: 
  const baseSize = Math.min(Math.max(width * 0.5, 160), 240) * scale;

  useEffect(() => {
    if (!isActive) return;

    // Default to 'now' if activeStartTime is invalid or too old (e.g. > 1 year)
    let start = activeStartTime;
    const now = Date.now();
    if (!start || isNaN(start) || (now - start) > 31536000000) {
      start = now;
    }

    const calculateTime = () => {
      const diffInSeconds = Math.floor((Date.now() - start!) / 1000);
      if (diffInSeconds < 0) {
        setElapsedText("0s active");
        return;
      }
      setElapsedText(formatTime(diffInSeconds));
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [isActive, activeStartTime]);

  const handleLongPress = async () => {
    if (sending || isActive) return;

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
      {/* Outer Glass Ring 1 */}
      <View 
        style={{ padding: baseSize * 0.08 }} 
        className={`${isActive ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100/50 border-red-200/50'} rounded-full border shadow-sm shadow-red-100`}
      >
        {/* Inner Glass Ring 2 */}
        <View 
          style={{ padding: baseSize * 0.04 }} 
          className={`${isActive ? 'bg-red-500/30 border-red-500/40' : 'bg-red-200/50 border-red-300/50'} rounded-full border shadow-md shadow-red-200`}
        >
          <TouchableOpacity 
            activeOpacity={0.8}
            onLongPress={handleLongPress}
            delayLongPress={3000}
            style={{ width: baseSize, height: baseSize }}
            className={`${sending ? "bg-slate-500 border-slate-400" : isActive ? "bg-[#DC2626] border-red-400" : "bg-[#EF4444] border-red-300"} rounded-full items-center justify-center shadow-2xl border-[3px] overflow-hidden`}
          >
            {/* Glassy Top Highlight (3D reflection) */}
            <View className="absolute top-[2%] left-[15%] right-[15%] h-[30%] bg-white/20 rounded-[100px]" />
            
            <MaterialCommunityIcons 
               name={isActive ? "alert-octagram" : "shield-alert-outline"} 
               size={baseSize * 0.16} 
               color="white" 
            />
            
            <Text 
              style={{ fontSize: baseSize * 0.24 }}
              className="text-white font-black tracking-tighter leading-none mt-2"
            >
              {sending ? "..." : "SOS"}
            </Text>

            {/* Default Emergency Text below SOS when not active */}
            {showEmergencyText && !isActive && (
              <Text 
                style={{ fontSize: baseSize * 0.06 }}
                className="text-white font-bold uppercase tracking-[1px] mt-1 opacity-90"
              >
                EMERGENCY
              </Text>
            )}

            {/* Timer below SOS when active */}
            {isActive && (
              <Text 
                style={{ fontSize: baseSize * 0.07 }}
                className="text-white font-bold uppercase tracking-[1px] mt-2 bg-black/20 border border-white/20 px-3 py-1 rounded-full overflow-hidden"
              >
                {elapsedText}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default memo(SosButton);
