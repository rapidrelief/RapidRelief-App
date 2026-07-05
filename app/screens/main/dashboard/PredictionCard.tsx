import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PredictionCard = () => {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/prediction/zone/1`);
      if (res.ok) {
        const data = await res.json();
        if (data.forecast && data.forecast.length > 0) {
          setPrediction(data.forecast[0]); 
        }
      }
    } catch (e) {
      console.log('Error fetching prediction:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  if (loading) {
    return (
      <View className="bg-white rounded-[20px] p-4 mb-3 shadow-sm shadow-slate-200/50">
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text className="text-center text-slate-500 text-xs mt-2">Loading AI Forecast...</Text>
      </View>
    );
  }

  if (!prediction) return null;

  const isHighRisk = prediction.risk_level === 'HIGH';
  const isMediumRisk = prediction.risk_level === 'MEDIUM';

  const bgColor = isHighRisk ? 'bg-red-50' : isMediumRisk ? 'bg-amber-50' : 'bg-emerald-50';
  const borderColor = isHighRisk ? 'border-red-200' : isMediumRisk ? 'border-amber-200' : 'border-emerald-200';
  const textColor = isHighRisk ? 'text-red-700' : isMediumRisk ? 'text-amber-700' : 'text-emerald-700';
  const iconColor = isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500';
  const chevronColor = isHighRisk ? '#b91c1c' : isMediumRisk ? '#b45309' : '#047857';

  const gradientColors = isHighRisk 
    ? ["#FFFFFF", "#FEF2F2"] as const
    : isMediumRisk 
    ? ["#FFFFFF", "#FFFBEB"] as const
    : ["#FFFFFF", "#F0FDF4"] as const;

  const shadowColor = isHighRisk ? "#EF4444" : isMediumRisk ? "#F59E0B" : "#10B981";

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        padding: 16,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: isHighRisk ? "#FECACA" : isMediumRisk ? "#FDE68A" : "#A7F3D0",
        shadowColor: shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand} className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className={`w-10 h-10 rounded-full ${iconColor} items-center justify-center mr-3 shadow-sm`}>
            <Text className="text-white font-bold text-xs">AI</Text>
          </View>
          <View className="flex-1">
            <Text className={`font-bold text-[16px] ${textColor}`}>AI Risk: {prediction.risk_level}</Text>
            <Text className={`${textColor} opacity-80 text-[12px]`}>Based on machine learning models</Text>
          </View>
        </View>
        <View className="bg-white/30 rounded-full p-1">
          <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color={chevronColor} />
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View className="mt-3 pt-3 border-t border-black/5">
          <View className="flex-row justify-between mb-2">
            <View className="items-center flex-1">
              <Text className={`${textColor} opacity-70 text-[11px] uppercase tracking-wider mb-1`}>Prob</Text>
              <Text className={`font-bold text-[17px] ${textColor}`}>{prediction.flood_probability}%</Text>
            </View>
            <View className="items-center flex-1 border-x border-black/5">
              <Text className={`${textColor} opacity-70 text-[11px] uppercase tracking-wider mb-1`}>Rain</Text>
              <Text className={`font-bold text-[17px] ${textColor}`}>{prediction.rainfall_mm}mm</Text>
            </View>
            <View className="items-center flex-1">
              <Text className={`${textColor} opacity-70 text-[11px] uppercase tracking-wider mb-1`}>River</Text>
              <Text className={`font-bold text-[17px] ${textColor}`}>{prediction.river_level_m}m</Text>
            </View>
          </View>

          {isHighRisk && (
            <View className="mt-2 bg-white/50 p-2.5 rounded-xl border border-red-200">
              <Text className="text-red-800 text-[11px] font-bold text-center">
                ⚠️ High risk of flooding today. Prepare your emergency kit.
              </Text>
            </View>
          )}
        </View>
      )}
    </LinearGradient>
  );
};

export default PredictionCard;
