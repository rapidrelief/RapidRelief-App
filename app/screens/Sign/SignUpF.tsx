import FormInput from "@/app/components/FormInput";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
  Keyboard,
  Alert,
  Text
} from "react-native";
import { useRouter } from "expo-router"; // 1. Import the router
import Button from "../../components/Button";
import AgreeCheckbox from "./AgreeCheckbox";
import SignUpHeader from "./SignUpHeader";

//firebase imports
import { createUserWithEmailAndPassword,sendEmailVerification } from "firebase/auth";
import { auth } from "@/app/config/firebase"

const SignUpF = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter(); // 2. Initialize the router
  const [loading, setLoading] = useState(false);
  
  
  const horizontalPadding = width * 0.06;
  const verticalSpacing = height * 0.02;
  const cardPadding = width * 0.04;

  const initialState = {
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
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
    form.password === form.confirmPassword &&
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

  const handleContinue = async () => {
    if (!isFormValid) return;
    
    try { //creating firebase user
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      //sending verification email
      await sendEmailVerification(userCredential.user);

    
      //sending extra data to backend
      const res = await fetch("http://192.168.18.135:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          emergency: form.emergency,
          address: form.address,
          cnic: form.cnic,
        }),
      });

      //debug log
      console.log("Status:", res.status);

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok) {
        throw new Error("Server error");
      }

      if (data.status && data.status !== "success") {
        throw new Error(data.message || "Backend Error");
      }
      // const data = await res.json();

      // if (data.status !== "success") {
      //   throw new Error(data.message || "Backend Error");
      // }

      Alert.alert(
        "Registration Successful. Verify Your Email",
        "A verification email has been sent. Please verify before login.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/screens/Home"),
          },
        ]
      );

      

    } catch (error: any) {
      Alert.alert("Signup Error", error.message);
    } finally {
      setLoading(false);
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
          
          <View>
          
          <FormInput label="Email Address" placeholder="example@mail.com" iconName="mail-outline" keyboardType="email-address" value={form.email} onChangeText={(txt) => handleInput("email", txt)} />
            {form.email.length > 0 && !validateEmail(form.email) && (
              <Text className="text-yellow-400 text-rs mt-1">
                Please enter a valid email address
              </Text>
            )}
          
            <FormInput label="Phone Number" placeholder="03XXXXXXXXX" iconName="call-outline" keyboardType="phone-pad" value={form.phone} onChangeText={(txt) => handleInput("phone", txt)} />
            {form.phone.length> 0 && form.phone.length < 11  && (
              <Text className="text-yellow-400 text-rs mt-1">
                Phone Number must be at least 11 digits
              </Text>
          )}    

            <FormInput label="Password" placeholder="Minimum 6 characters" iconName="lock-closed-outline" isPassword={true} value={form.password} onChangeText={(txt) => handleInput("password", txt)} />
            {form.password.length> 0 && form.password.length < 6  && (
              <Text className="text-yellow-400 text-rs mt-1">
                Password must be at least 6 characters
              </Text>
          )}    
      
            <FormInput label="Confirm Password" placeholder="Re-enter Password" iconName="lock-closed-outline" isPassword={true} value={form.confirmPassword} onChangeText={(txt) => handleInput("confirmPassword", txt)} />
            {form.confirmPassword.length> 0 && form.password !== form.confirmPassword && (
              <Text className="text-red-400 text-rs mt-1">
                Passwords do not match
              </Text>
          )}

            <FormInput label="CNIC (13 Digits)" placeholder="42XXXXXXXXXXX" iconName="card-outline" keyboardType="numeric" value={form.cnic} onChangeText={(txt) => handleInput("cnic", txt)} />
              {form.cnic.length> 0 && form.cnic.length < 13  && (
              <Text className="text-yellow-400 text-rs mt-1">
                CNIC number must be at least 13 digits
              </Text>
          )}    
      

          </View>

          <View style={{ padding: cardPadding, marginBottom: verticalSpacing, borderRadius: 16 }} className="bg-white/10 border border-white/20">
            <FormInput label="Emergency Contact" placeholder="03XXXXXXXXX" iconName="shield-outline" keyboardType="phone-pad" value={form.emergency} onChangeText={(txt) => handleInput("emergency", txt)} />
              {form.emergency.length > 0 && (
              <>
                {form.emergency.length < 11 && (
                  <Text className="text-yellow-400 text-rs mt-1">
                    Emergency Number must be at least 11 digits
                  </Text>
                )}

                {form.emergency === form.phone && (
                  <Text className="text-yellow-400 text-rs mt-1">
                    Emergency number should not be the same as phone number
                  </Text>
                )}
              </>
              )}
          </View>


          <FormInput label="Home Address" placeholder="Street, City, Area" iconName="location-outline" value={form.address} onChangeText={(txt) => handleInput("address", txt)} />
          
          <AgreeCheckbox agree={agree} onToggle={() => setAgree(!agree)} />

          <View className="items-center w-full" style={{ marginTop: verticalSpacing }}>
            <Button title={loading ? "Signing up..." : "Continue"} 
            disabled={!isFormValid} 
            onPress={handleContinue} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpF;