import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

const PrivacySecurity = () => {
  const [locationSharing, setLocationSharing] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  // Modal & Animation States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Password States
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Animation Logic ---
  const toggleModal = (show: boolean) => {
    if (show) {
      setIsModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setIsModalVisible(false));
    }
  };

  // --- Validation Logic ---
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const isStrong = strongRegex.test(passwords.new);
  const isMatching =
    passwords.new === passwords.confirm && passwords.confirm !== "";
  const canUpdate = passwords.current.length > 0 && isStrong && isMatching;

  const getStrengthUI = (p: string) => {
    if (p.length === 0) return { label: "", color: "text-slate-400" };
    if (strongRegex.test(p))
      return { label: "Strong Security", color: "text-green-500" };
    if (p.length >= 6)
      return {
        label: "Weak: Add uppercase, number & symbol",
        color: "text-orange-500",
      };
    return { label: "Too short", color: "text-red-500" };
  };

  const handlePasswordUpdate = () => {
    if (!canUpdate) return;
    Alert.alert("Success", "Password updated successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
    toggleModal(false);
  };

  return (
    <View className="bg-white border border-slate-100 rounded-[32px] p-5 mb-6 shadow-sm">
      {/* Header Section */}
      <View className="flex-row items-center mb-4">
        <View className="bg-purple-100 p-3 rounded-2xl">
          <Feather name="shield" size={20} color="#a855f7" />
        </View>
        <Text className="ml-3 text-lg font-bold text-slate-800">
          Privacy & Security
        </Text>
      </View>

      {/* Rows */}
      <View className="flex-row items-center justify-between py-4 border-b border-slate-100/50">
        <View className="flex-1 pr-4">
          <Text className="text-slate-900 font-bold">Location Sharing</Text>
          <Text className="text-slate-500 text-xs">
            Allow emergency contacts to see your location
          </Text>
        </View>
        <Switch
          value={locationSharing}
          onValueChange={setLocationSharing}
          trackColor={{ false: "#e2e8f0", true: "#2563eb" }} // Set to blue match
        />
      </View>

      <View className="flex-row items-center justify-between py-4 border-b border-slate-100/50">
        <View className="flex-row items-center flex-1">
          <View className="bg-slate-50 p-2 rounded-lg">
            <Feather name="lock" size={18} color="#64748b" />
          </View>
          <View className="ml-3">
            <Text className="text-slate-800 font-bold">Change Password</Text>
            <Text className="text-slate-500 text-xs">
              Update your account password
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => toggleModal(true)}
          className="bg-white border border-slate-200 px-4 py-1.5 rounded-lg active:bg-slate-50"
        >
          <Text className="text-slate-600 font-semibold text-xs">Update</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-between py-4">
        <View className="flex-1 pr-4">
          <Text className="text-slate-900 font-bold">
            Two-Factor Authentication
          </Text>
          <Text className="text-slate-500 text-xs">
            Add extra security to your account
          </Text>
        </View>
        <Switch
          value={twoFactor}
          onValueChange={setTwoFactor}
          trackColor={{ false: "#e2e8f0", true: "#2563eb" }}
        />
      </View>

      {/* --- CUSTOM ANIMATED PASSWORD MODAL --- */}
      <Modal
        transparent
        visible={isModalVisible}
        onRequestClose={() => toggleModal(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0"
            onPress={() => toggleModal(false)}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            />
          </Pressable>

          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className="bg-white rounded-t-[40px] shadow-2xl"
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="p-8"
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-slate-800">
                  Change Password
                </Text>
                <TouchableOpacity
                  onPress={() => toggleModal(false)}
                  className="bg-slate-100 p-2 rounded-full"
                >
                  <Feather name="x" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="space-y-4">
                {/* Inputs */}
                <View>
                  <Text className="text-slate-500 text-[10px] font-bold mb-2 uppercase tracking-widest ml-1">
                    Current Password
                  </Text>
                  <View className="bg-slate-50 flex-row items-center rounded-2xl border border-slate-100 pr-4">
                    <TextInput
                      secureTextEntry={!showCurrent}
                      className="flex-1 p-4 text-slate-800"
                      placeholder="••••••••"
                      value={passwords.current}
                      onChangeText={(t) =>
                        setPasswords({ ...passwords, current: t })
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrent(!showCurrent)}
                    >
                      <Feather
                        name={showCurrent ? "eye" : "eye-off"}
                        size={18}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Text className="text-slate-500 text-[10px] font-bold mb-2 uppercase tracking-widest ml-1">
                    New Password
                  </Text>
                  <View
                    className={`bg-slate-50 flex-row items-center rounded-2xl border pr-4 ${isStrong ? "border-green-100" : "border-slate-100"}`}
                  >
                    <TextInput
                      secureTextEntry={!showNew}
                      className="flex-1 p-4 text-slate-800"
                      placeholder="••••••••"
                      value={passwords.new}
                      onChangeText={(t) =>
                        setPasswords({ ...passwords, new: t })
                      }
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                      <Feather
                        name={showNew ? "eye" : "eye-off"}
                        size={18}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text
                    className={`text-[10px] mt-1.5 ml-1 font-bold ${getStrengthUI(passwords.new).color}`}
                  >
                    {getStrengthUI(passwords.new).label}
                  </Text>
                </View>

                <View className="mb-6">
                  <Text className="text-slate-500 text-[10px] font-bold mb-2 uppercase tracking-widest ml-1">
                    Confirm New Password
                  </Text>
                  <View
                    className={`bg-slate-50 flex-row items-center rounded-2xl border pr-4 ${isMatching ? "border-green-100" : "border-slate-100"}`}
                  >
                    <TextInput
                      secureTextEntry={!showConfirm}
                      className="flex-1 p-4 text-slate-800"
                      placeholder="••••••••"
                      value={passwords.confirm}
                      onChangeText={(t) =>
                        setPasswords({ ...passwords, confirm: t })
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirm(!showConfirm)}
                    >
                      <Feather
                        name={showConfirm ? "eye" : "eye-off"}
                        size={18}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  {passwords.confirm.length > 0 && !isMatching && (
                    <Text className="text-red-500 text-[10px] mt-1 ml-1 font-bold">
                      Passwords do not match
                    </Text>
                  )}
                </View>

                {/* Save Button - Matches Blue-600 Theme */}
                <TouchableOpacity
                  onPress={handlePasswordUpdate}
                  disabled={!canUpdate}
                  activeOpacity={0.7}
                  className={`py-4 rounded-2xl items-center shadow-xl ${
                    canUpdate
                      ? "bg-blue-600"
                      : "bg-slate-200 shadow-none"
                  }`}
                >
                  <Text
                    className={`font-bold text-lg ${canUpdate ? "text-white" : "text-slate-400"}`}
                  >
                    Update Password
                  </Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default PrivacySecurity;
