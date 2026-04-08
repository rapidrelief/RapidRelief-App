import React, { useEffect, useRef, useState } from "react";
import { 
  View, Text, Modal, TouchableOpacity, TextInput, Animated, 
  Platform, KeyboardAvoidingView, Pressable, Switch, useWindowDimensions, Alert,
  ScrollView, TouchableWithoutFeedback, Keyboard 
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { auth } from "@/app/config/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";


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

  const isStrong = passwords.new.length >= 6;
  const canUpdate = passwords.current.length > 0 && isStrong && passwords.new === passwords.confirm;

  const handleUpdatePassword = async () => {
  try {
    const user = auth.currentUser;

    if (!user || !user.email) {
      Alert.alert("Error", "No logged in user found");
      return;
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      passwords.current
    );

    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, passwords.new);

    Alert.alert("Success", "Password updated successfully");

    setPasswords({
      current: "",
      new: "",
      confirm: "",
    });

    onClose();
  } catch (error: any) {
    console.log(error);

    if (error.code === "auth/wrong-password") {
      Alert.alert("Error", "Current password is incorrect");
    } else {
      Alert.alert("Error", "Could not update password");
    }
  }
};

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose} animationType="none">
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose}>
          <Animated.View style={{ opacity: fadeAnim, flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
        </Pressable>
        
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            style={{ justifyContent: "flex-end" }}
          >
          <Animated.View 
            style={{ 
              transform: [{ translateY: slideAnim }], 
              maxHeight: mode === 'password' ? height * 0.72 : height * 0.4,
              minHeight: mode === 'password' ? height * 0.55 : height * 0.3,
              paddingBottom: Platform.OS === 'ios' ? 30 : 20 
          }} 
          className="bg-white rounded-t-[40px] p-8 shadow-2xl"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{
                  paddingBottom: 50,
                }}
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
                    placeholderTextColor="#c0c7d1ec" 
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
                    placeholderTextColor="#c0c7d1ec" 
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
                      Password must be at least 6 characters
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
                    placeholderTextColor="#f288758f" 
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
                  onPress={handleUpdatePassword}
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

              </ScrollView>
            
            </TouchableWithoutFeedback>
        </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default PrivacyModal;