import React, { useEffect, useRef, useState } from "react";
import { 
  View, Text, Modal, TouchableOpacity, TextInput, Animated, 
  Platform, KeyboardAvoidingView, Pressable, Switch, useWindowDimensions 
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  isVisible: boolean;
  mode: 'password' | 'privacy' | null;
  onClose: () => void;
}

const PrivacyModal = ({ isVisible, mode, onClose }: Props) => {
  const { width, height } = useWindowDimensions();
  const ms = (size: number) => size + (((width / 375) * size) - size) * 0.5;

  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [locationSharing, setLocationSharing] = useState(true);

  // Visibility states for each field
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: height, duration: 350, useNativeDriver: true }),
      ]).start();
      // Reset visibility states when closing
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isVisible, height]);

  const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(passwords.new);
  const canUpdate = passwords.current.length > 0 && isStrong && passwords.new === passwords.confirm;

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="none">
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose}>
          <Animated.View style={{ opacity: fadeAnim, flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
        </Pressable>
        
        <Animated.View 
          style={{ 
            transform: [{ translateY: slideAnim }], 
            maxHeight: height * 0.85,
            paddingBottom: Platform.OS === 'ios' ? 40 : 20 
          }} 
          className="bg-white rounded-t-[40px] p-8 shadow-2xl"
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={20}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ fontSize: ms(22) }} className="font-bold text-slate-800">
                {mode === 'password' ? 'Security' : 'Privacy Settings'}
              </Text>
              <TouchableOpacity onPress={onClose} className="bg-slate-100 p-2 rounded-full active:bg-slate-200">
                <Feather name="x" size={ms(18)} color="#64748b" />
              </TouchableOpacity>
            </View>

            {mode === 'privacy' ? (
              <View className="flex-row items-center justify-between py-4 border-b border-slate-50">
                <View className="flex-1 pr-4">
                  <Text style={{ fontSize: ms(16) }} className="text-slate-900 font-bold">Location Sharing</Text>
                  <Text style={{ fontSize: ms(12) }} className="text-slate-500 mt-1">Allow emergency contacts to see your live coordinates.</Text>
                </View>
                <Switch 
                  value={locationSharing} 
                  onValueChange={setLocationSharing} 
                  trackColor={{ false: "#e2e8f0", true: "#2563eb" }} 
                />
              </View>
            ) : (
              <View className="gap-y-4">
                
                {/* Current Password Field */}
                <View className="relative justify-center">
                  <TextInput 
                    secureTextEntry={!showCurrent}
                    style={{ height: ms(55), fontSize: ms(14) }}
                    className="bg-slate-50 pl-5 pr-12 rounded-2xl border border-slate-100 text-slate-800" 
                    placeholder="Current Password" 
                    value={passwords.current} 
                    onChangeText={(t) => setPasswords({...passwords, current: t})} 
                  />
                  <TouchableOpacity 
                    onPress={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4"
                  >
                    <Feather name={showCurrent ? "eye" : "eye-off"} size={ms(18)} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                
                {/* New Password Field */}
                <View className="relative justify-center">
                  <TextInput 
                    secureTextEntry={!showNew}
                    style={{ height: ms(55), fontSize: ms(14) }}
                    className="bg-slate-50 pl-5 pr-12 rounded-2xl border border-slate-100 text-slate-800" 
                    placeholder="New Password" 
                    value={passwords.new} 
                    onChangeText={(t) => setPasswords({...passwords, new: t})} 
                  />
                  <TouchableOpacity 
                    onPress={() => setShowNew(!showNew)}
                    className="absolute right-4"
                  >
                    <Feather name={showNew ? "eye" : "eye-off"} size={ms(18)} color="#94a3b8" />
                  </TouchableOpacity>
                  {passwords.new.length > 0 && !isStrong && (
                    <Text style={{ fontSize: ms(10) }} className="text-red-400 mt-2 ml-2 font-medium">
                      Requires 8+ chars, 1 Uppercase & 1 Symbol
                    </Text>
                  )}
                </View>

                {/* Confirm Password Field */}
                <View className="relative justify-center">
                  <TextInput 
                    secureTextEntry={!showConfirm}
                    style={{ height: ms(55), fontSize: ms(14) }}
                    className="bg-slate-50 pl-5 pr-12 rounded-2xl border border-slate-100 text-slate-800" 
                    placeholder="Confirm New Password" 
                    value={passwords.confirm} 
                    onChangeText={(t) => setPasswords({...passwords, confirm: t})} 
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4"
                  >
                    <Feather name={showConfirm ? "eye" : "eye-off"} size={ms(18)} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  disabled={!canUpdate} 
                  style={{ height: ms(55) }}
                  className={`rounded-2xl items-center justify-center mt-4 shadow-sm ${canUpdate ? "bg-blue-600" : "bg-slate-200"}`}
                >
                  <Text style={{ fontSize: ms(16) }} className={`font-bold ${canUpdate ? "text-white" : "text-slate-400"}`}>
                    Update Password
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PrivacyModal;