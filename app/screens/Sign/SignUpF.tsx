import FormInput from "@/app/components/FormInput";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
  Keyboard,
  Alert
} from "react-native";
import { useRouter } from "expo-router"; // 1. Import the router
import Button from "../../components/Button";
import AgreeCheckbox from "./AgreeCheckbox";
import SignUpHeader from "./SignUpHeader";

const SignUpF = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter(); // 2. Initialize the router
  
  const horizontalPadding = width * 0.06;
  const verticalSpacing = height * 0.02;
  const cardPadding = width * 0.04;

  const initialState = {
    fullName: "", email: "", phone: "", password: "",
    emergency: "", address: "", cnic: ""
  };

  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState(initialState);

  const handleInput = (key: string, value: string) => {
    if (key === "cnic") {
      const cleaned = value.replace(/[^0-9]/g, "");
      if (cleaned.length <= 13) setForm({ ...form, [key]: cleaned });
    } 
    else if (key === "phone" || key === "emergency") {
      const cleaned = value.replace(/[^0-9]/g, "");
      if (cleaned.length <= 11) setForm({ ...form, [key]: cleaned });
    }
    else {
      setForm({ ...form, [key]: value });
    }
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const isFormValid = 
    form.fullName.trim().length >= 3 && 
    validateEmail(form.email) && 
    form.phone.length === 11 && 
    form.password.length >= 6 && 
    form.emergency.length === 11 && 
    form.emergency !== form.phone && 
    form.address.trim().length >= 5 &&   
    form.cnic.length === 13 &&           
    agree;

  // 3. This function handles the cross button click
  const handleClose = () => {
    if (form.fullName || form.email || form.phone) {
      // Optional: Ask user for confirmation if they've started typing
      Alert.alert("Discard Changes?", "Are you sure you want to go back?", [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() }
      ]);
    } else {
      router.back(); // Simply go back if form is empty
    }
  };

  const handleContinue = () => {
    if (isFormValid) {
      Keyboard.dismiss();
      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully for Rapid Relief.",
        [
          {
            text: "Get Started",
            onPress: () => {
              setForm(initialState);
              setAgree(false);
              router.replace("/screens/Home"); // 4. Navigate to Home after success
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingBottom: Platform.OS === 'android' ? height * 0.12 : height * 0.05 
        }}
      >
        {/* 5. Pass handleClose to the Header */}
        <SignUpHeader onClose={handleClose} />

        <View style={{ paddingHorizontal: horizontalPadding }}>
          <FormInput label="Full Name" placeholder="Full Name" iconName="person-outline" value={form.fullName} onChangeText={(txt) => handleInput("fullName", txt)} />
          <FormInput label="Email Address" placeholder="example@mail.com" iconName="mail-outline" keyboardType="email-address" value={form.email} onChangeText={(txt) => handleInput("email", txt)} />
          <FormInput label="Phone Number" placeholder="03XXXXXXXXX" iconName="call-outline" keyboardType="phone-pad" value={form.phone} onChangeText={(txt) => handleInput("phone", txt)} />
          <FormInput label="Password" placeholder="Minimum 6 characters" iconName="lock-closed-outline" isPassword={true} value={form.password} onChangeText={(txt) => handleInput("password", txt)} />

          <View style={{ padding: cardPadding, marginBottom: verticalSpacing, borderRadius: 16 }} className="bg-white/10 border border-white/20">
            <FormInput label="Emergency Contact" placeholder="03XXXXXXXXX" iconName="shield-outline" keyboardType="phone-pad" value={form.emergency} onChangeText={(txt) => handleInput("emergency", txt)} />
          </View>

          <FormInput label="Home Address" placeholder="Street, City, Area" iconName="location-outline" value={form.address} onChangeText={(txt) => handleInput("address", txt)} />
          <FormInput label="CNIC (13 Digits)" placeholder="42XXXXXXXXXXX" iconName="card-outline" keyboardType="numeric" value={form.cnic} onChangeText={(txt) => handleInput("cnic", txt)} />

          <AgreeCheckbox agree={agree} onToggle={() => setAgree(!agree)} />

          <View className="items-center w-full" style={{ marginTop: verticalSpacing }}>
            <Button title="Continue" disabled={!isFormValid} onPress={handleContinue} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpF;