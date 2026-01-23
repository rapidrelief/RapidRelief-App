import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PrivacySecurity = () => {
  const [locationSharing, setLocationSharing] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  
  // Password Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Visibility States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Helper to check password strength for UI feedback
  const getStrengthUI = (p: string) => {
    if (p.length === 0) return { label: '', color: 'text-slate-400' };
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (strongRegex.test(p)) return { label: 'Strong Security', color: 'text-green-500' };
    if (p.length >= 6) return { label: 'Weak: Add uppercase, number & symbol', color: 'text-orange-500' };
    return { label: 'Too short', color: 'text-red-500' };
  };

  const handlePasswordUpdate = () => {
    const { current, new: newPass, confirm } = passwords;

    // 1. Basic Check
    if (!current || !newPass || !confirm) {
      Alert.alert("Required", "All fields are required.");
      return;
    }

    // 2. Matching Check
    if (newPass !== confirm) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }

    // 3. Strong Password Validation (Regex)
    // Requirements: Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Char
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!strongRegex.test(newPass)) {
      Alert.alert(
        "Security Requirement", 
        "Password must be at least 8 characters and include an uppercase letter, a number, and a special character (@$!%*?&)."
      );
      return;
    }

    // Success Logic
    Alert.alert("Success", "Password updated successfully!");
    setPasswords({ current: '', new: '', confirm: '' });
    setIsModalVisible(false);
  };

  return (
    <View className="bg-white border border-slate-100 rounded-[32px] p-5 mb-6 shadow-sm">
      <View className="flex-row items-center mb-4">
        <View className="bg-purple-100 p-3 rounded-2xl">
          <Feather name="shield" size={20} color="#a855f7" />
        </View>
        <Text className="ml-3 text-lg font-bold text-slate-800">Privacy & Security</Text>
      </View>

      <View className="flex-row items-center justify-between py-4 border-b border-slate-100/50">
        <View className="flex-1 pr-4">
          <Text className="text-slate-900 font-bold">Location Sharing</Text>
          <Text className="text-slate-500 text-xs">Allow emergency contacts to see your location</Text>
        </View>
        <Switch 
          value={locationSharing} 
          onValueChange={setLocationSharing}
          trackColor={{ false: "#e2e8f0", true: "#000000" }}
        />
      </View>

      <View className="flex-row items-center justify-between py-4 border-b border-slate-100/50">
        <View className="flex-row items-center flex-1">
          <View className="bg-slate-50 p-2 rounded-lg">
            <Feather name="lock" size={18} color="#64748b" />
          </View>
          <View className="ml-3">
            <Text className="text-slate-800 font-bold">Change Password</Text>
            <Text className="text-slate-500 text-xs">Update your account password</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setIsModalVisible(true)}
          className="bg-white border border-slate-200 px-4 py-1.5 rounded-lg"
        >
          <Text className="text-slate-600 font-semibold text-xs">Update</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between py-4">
        <View className="flex-1 pr-4">
          <Text className="text-slate-900 font-bold">Two-Factor Authentication</Text>
          <Text className="text-slate-500 text-xs">Add extra security to your account</Text>
        </View>
        <Switch 
          value={twoFactor} 
          onValueChange={setTwoFactor}
          trackColor={{ false: "#e2e8f0", true: "#000000" }}
        />
      </View>

      {/* --- PASSWORD MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="bg-white rounded-t-[40px] p-8"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-800">Change Password</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              {/* CURRENT PASSWORD */}
              <View>
                <Text className="text-slate-500 text-xs font-bold mb-2 uppercase">Current Password</Text>
                <View className="bg-slate-50 flex-row items-center rounded-2xl border border-slate-100 pr-4">
                  <TextInput 
                    secureTextEntry={!showCurrent}
                    className="flex-1 p-4 text-slate-800"
                    placeholder="Current Password"
                    value={passwords.current}
                    onChangeText={(t) => setPasswords({...passwords, current: t})}
                  />
                  <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                    <Feather name={showCurrent ? "eye" : "eye-off"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* NEW PASSWORD */}
              <View>
                <Text className="text-slate-500 text-xs font-bold mb-2 uppercase">New Password</Text>
                <View className="bg-slate-50 flex-row items-center rounded-2xl border border-slate-100 pr-4">
                  <TextInput 
                    secureTextEntry={!showNew}
                    className="flex-1 p-4 text-slate-800"
                    placeholder="New Password"
                    value={passwords.new}
                    onChangeText={(t) => setPasswords({...passwords, new: t})}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    <Feather name={showNew ? "eye" : "eye-off"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
                {/* Strength Helper */}
                <Text className={`text-[10px] mt-1 ml-2 font-bold ${getStrengthUI(passwords.new).color}`}>
                  {getStrengthUI(passwords.new).label}
                </Text>
              </View>

              {/* CONFIRM PASSWORD */}
              <View className="mb-6">
                <Text className="text-slate-500 text-xs font-bold mb-2 uppercase">Confirm New Password</Text>
                <View className="bg-slate-50 flex-row items-center rounded-2xl border border-slate-100 pr-4">
                  <TextInput 
                    secureTextEntry={!showConfirm}
                    className="flex-1 p-4 text-slate-800"
                    placeholder="Confirm New Password"
                    value={passwords.confirm}
                    onChangeText={(t) => setPasswords({...passwords, confirm: t})}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    <Feather name={showConfirm ? "eye" : "eye-off"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handlePasswordUpdate}
                className="bg-blue-600 p-4 rounded-2xl shadow-md shadow-blue-300"
              >
                <Text className="text-white text-center font-bold text-lg">Update Password</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default PrivacySecurity;