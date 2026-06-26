import FormInput from "@/app/components/FormInput";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
  Alert,
  Text,
  TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router";
import Button from "../../components/Button";
import AgreeCheckbox from "./AgreeCheckbox";
import SignUpHeader from "./SignUpHeader";

//firebase imports
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "@/app/config/firebase";
import { doc, setDoc } from "firebase/firestore";

const SignUpF = () => {
  const { width, height } = useWindowDimensions();
  const cardPadding = width * 0.04;
  const verticalSpacing = height * 0.02;
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    emergency: "",
    address: "",
    cnic: ""
  });

  const handleInput = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const isFormValid =
    form.fullName.length >= 3 &&
    validateEmail(form.email) &&
    form.phone.length === 11 &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    form.address.trim().length >= 5 &&
    form.cnic.length === 13 &&
    form.emergency.length === 11 &&
    agree;

  const handleContinue = async () => {
    if (!isFormValid) return;

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const uid = userCredential.user.uid;

      // save to firestore as regular user
      await setDoc(doc(db, "users", uid), {
        ...form,
        role: "user",
        status: "Online",
        location: null,
      });

      // sending verification email
      await sendEmailVerification(userCredential.user);

      Alert.alert(
        "Account Created",
        "Please verify your email before logging in.",
        [{ text: "OK", onPress: () => router.replace("/auth/Login") }]
      );

    } catch (err: any) {
      Alert.alert("Signup Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        
        <SignUpHeader 
          title="Create Account" 
          subtitle="Join Rapid Relief to stay protected" 
          onClose={() => router.back()} 
        />

        <View style={{ paddingHorizontal: width * 0.06 }}>
          
          <View className="bg-white/10 p-5 rounded-3xl border border-white/20 mb-6">
            <FormInput label="Full Name" placeholder="John Doe" iconName="person-outline" value={form.fullName} onChangeText={(t) => handleInput("fullName", t)} />

            <FormInput label="Email Address" placeholder="example@mail.com" iconName="mail-outline" keyboardType="email-address" value={form.email} onChangeText={(t) => handleInput("email", t)} />
            {form.email.length > 0 && !validateEmail(form.email) && (
              <Text className="text-yellow-400 text-xs mt-1 ml-2 font-bold mb-3 -top-2">
                Please enter a valid email address
              </Text>
            )}

            <FormInput label="Phone Number" placeholder="03XXXXXXXXX" iconName="call-outline" keyboardType="phone-pad" value={form.phone} onChangeText={(txt) => handleInput("phone", txt)} maxLength={11} />
            {form.phone.length > 0 && form.phone.length !== 11 && (
              <Text className="text-yellow-400 text-xs mt-1 ml-2 font-bold mb-3 -top-2">
                Phone Number must be exactly 11 digits
              </Text>
            )}

            <FormInput label="Password" placeholder="Minimum 6 characters" iconName="lock-closed-outline" isPassword value={form.password} onChangeText={(t) => handleInput("password", t)} />
            {form.password.length > 0 && form.password.length < 6 && (
              <Text className="text-yellow-400 text-xs mt-1 ml-2 font-bold mb-3 -top-2">
                Password must be at least 6 characters
              </Text>
            )}

            <FormInput label="Confirm Password" placeholder="Re-enter Password" iconName="lock-closed-outline" isPassword value={form.confirmPassword} onChangeText={(t) => handleInput("confirmPassword", t)} />
            {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
              <Text className="text-red-400 text-xs mt-1 ml-2 font-bold mb-3 -top-2">
                Passwords do not match
              </Text>
            )}

            <FormInput label="CNIC (13 Digits)" placeholder="42XXXXXXXXXXX" iconName="card-outline" keyboardType="numeric" value={form.cnic} onChangeText={(t) => handleInput("cnic", t)} maxLength={13} />
            {form.cnic.length > 0 && form.cnic.length !== 13 && (
              <Text className="text-yellow-400 text-xs mt-1 ml-2 font-bold mb-3 -top-2">
                CNIC number must be exactly 13 digits
              </Text>
            )}
            
            <FormInput label="Home Address" placeholder="Street, City, Area" iconName="location-outline" value={form.address} onChangeText={(txt) => handleInput("address", txt)} />

            <View className="mt-2 pt-4 border-t border-white/20">
              <Text className="text-white font-bold mb-4">Emergency Setup</Text>
              <FormInput
                label="Emergency Contact"
                placeholder="03XXXXXXXXX"
                iconName="shield-half-outline"
                keyboardType="phone-pad"
                value={form.emergency}
                onChangeText={(txt) => handleInput("emergency", txt)}
                maxLength={11}
              />
              {form.emergency.length > 0 && (
                <>
                  {form.emergency.length !== 11 && (
                    <Text className="text-yellow-400 text-xs mt-1 ml-2 font-bold mb-3 -top-2">
                      Emergency Number must be exactly 11 digits
                    </Text>
                  )}
                  {form.emergency === form.phone && (
                    <Text className="text-yellow-400 text-xs mt-1 ml-2 font-bold mb-3 -top-2">
                      Emergency contact must be different from phone
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>

          <AgreeCheckbox agree={agree} onToggle={() => setAgree(!agree)} />

          <View className="items-center mt-6 w-full">
            <Button
              title={loading ? "Creating Account..." : "Create Account"}
              disabled={!isFormValid || loading}
              onPress={handleContinue}
            />
          </View>

          <View className="items-center mt-6 flex-row justify-center">
            <Text className="text-white/80 text-sm">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/Login")}>
              <Text className="text-white font-black text-sm underline">
                Log In
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpF;