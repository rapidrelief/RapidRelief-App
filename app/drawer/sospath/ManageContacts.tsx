import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  getEmergencyContacts,
  saveEmergencyContacts,
} from "@/app/services/emergencyContactsService";

const ManageContacts = () => {
  const router = useRouter();
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);

  // 1. ANIMATION SETUP
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadContacts();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadContacts = async () => {
    try {
      const contacts = await getEmergencyContacts();
      setPrimary(contacts.primary || "");
      setSecondary(contacts.secondary.length ? contacts.secondary : [""]);
    } catch (err) {
      console.log("Contact load error:", err);
    }
  };

  // 2. VALIDATION LOGIC
  // Button is enabled only if primary contact has at least 10 digits
  const isFormValid = primary.trim().length >= 10;

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/drawer/settingPath");
    }
  };

  const updateSecondary = (index: number, value: string) => {
    setSecondary((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addSecondary = () => {
    if (secondary.length >= 3) return;
    setSecondary((prev) => [...prev, ""]);
  };

  const removeSecondary = (index: number) => {
    setSecondary((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [""];
    });
  };

  const handleSave = async () => {
    if (!isFormValid) return; // Guard clause

    try {
      setSaving(true);
      await saveEmergencyContacts({
        primary,
        secondary,
      });

      Alert.alert("Success", "Contacts updated successfully!", [
        { text: "OK", onPress: () => handleGoBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not save contacts");
    } finally {
      setSaving(false);
    }
  };

  // 3. RESPONSIVE HEADER HEIGHT
  const headerPadding =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 60;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent />

      {/* Responsive Header */}
      <View
        style={{ paddingTop: headerPadding }}
        className="flex-row items-center px-5 pb-4 border-b border-gray-100 bg-white"
      >
        <TouchableOpacity
          onPress={handleGoBack}
          className="p-2 mr-3 bg-gray-50 rounded-full active:bg-gray-200"
        >
          <Feather name="arrow-left" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Edit Contacts</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            className="px-6"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                flex: 1,
              }}
              className="py-10"
            >
              {/* Illustration Area */}
              <View className="items-center mb-8">
                <View className="bg-blue-50 p-4 rounded-full mb-4">
                  <Feather name="users" size={32} color="#2563eb" />
                </View>
                <Text className="text-lg font-bold text-slate-800">
                  Emergency Contacts
                </Text>
                <Text className="text-gray-500 text-center mt-1 px-4 leading-5">
                  Update the numbers of people you want notified during an
                  emergency.
                </Text>
              </View>

              {/* Form Section */}
              <View>
                <View className="mb-6">
                  <Text className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest ml-1">
                    Primary Contact
                  </Text>
                  <TextInput
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 focus:border-blue-500"
                    placeholder="+92 300 1234567"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={primary}
                    onChangeText={setPrimary}
                  />
                </View>

                {secondary.map((contact, index) => (
                  <View className="mb-4" key={index}>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Secondary Contact {index + 1}
                      </Text>

                      {secondary.length > 1 && (
                        <TouchableOpacity onPress={() => removeSecondary(index)}>
                          <Text className="text-red-500 text-xs font-bold">Remove</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TextInput
                      className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 focus:border-blue-500"
                      placeholder="+92 321 7654321"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      value={contact}
                      onChangeText={(value) => updateSecondary(index, value)}
                    />
                  </View>
                ))}

                {secondary.length < 3 && (
                  <TouchableOpacity
                    onPress={addSecondary}
                    className="py-3 rounded-2xl items-center mb-6 border border-blue-100 bg-blue-50"
                  >
                    <Text className="text-blue-600 font-bold">Add Secondary Contact</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Save Button with Adaptive States */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={!isFormValid || saving}
                activeOpacity={0.7}
                className={`py-4 rounded-2xl items-center mt-auto mb-6 shadow-xl ${
                  isFormValid && !saving
                    ? "bg-blue-600"
                    : "bg-slate-200 shadow-none"
                }`}
              >
                <Text
                  className={`font-semibold text-lg ${
                    isFormValid && !saving ? "text-white" : "text-slate-400"
                  }`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ManageContacts;
