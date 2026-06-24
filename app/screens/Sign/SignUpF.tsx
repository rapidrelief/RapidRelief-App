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
  Text,
  TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router"; // 1. Import the router
import Button from "../../components/Button";
import AgreeCheckbox from "./AgreeCheckbox";
import SignUpHeader from "./SignUpHeader";

//firebase imports
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/app/config/firebase"
import { db } from "@/app/config/firebase";
import { doc, setDoc } from "firebase/firestore";

const SignUpF = () => {
  const { width, height } = useWindowDimensions();
  const cardPadding = width * 0.04;
const verticalSpacing = height * 0.02;
  const router = useRouter(); // 2. Initialize the router
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"user" | "rescuer">("user");



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
    (role === "rescuer" || form.emergency.length === 11) &&
    agree;

  // generate rescuer id
  const generateRescuerId = () => {
    return "RES-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

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

      const uid = userCredential.user.uid;

      let rescuerId = null;

      if (role === "rescuer") {
        rescuerId = generateRescuerId();
      }

      //save to firestore
      await setDoc(doc(db, "users", uid), {
        ...form,
        role,
        rescuerId,
        status: "Online",
        location: null,
      });

      //sending verification email
      await sendEmailVerification(userCredential.user);

      Alert.alert(
        "Account Created",
        role === "rescuer"
          ? `Your Rescuer ID: ${rescuerId}\nUse it to login.`
          : "Verify your email before login.",
        [{ text: "OK", onPress: () => router.replace("/screens/Home") }]
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
    style={{ flex: 1 }}
  >
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 30, }}>
      
      <SignUpHeader />

      <View style={{ paddingHorizontal: width * 0.06 }}>

        {/* Role Toggle */}
        <View className="flex-row justify-center mb-4">
          <TouchableOpacity
            onPress={() => setRole("user")}
            className={`flex-1 p-3 mr-2 rounded-xl ${
              role === "user" ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Text className="text-center text-white">User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRole("rescuer")}
            className={`flex-1 p-3 ml-2 rounded-xl ${
              role === "rescuer" ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Text className="text-center text-white">Rescuer</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <FormInput label="Full Name" placeholder="Full Name" iconName="person-outline" value={form.fullName} onChangeText={(t) => handleInput("fullName", t)} />

        <FormInput label="Email Address" placeholder="example@mail.com" iconName="mail-outline" keyboardType="email-address" value={form.email} onChangeText={(t) => handleInput("email", t)} />
        {form.email.length > 0 && !validateEmail(form.email) && (
          <Text className="text-yellow-400 text-rs mt-1">
            Please enter a valid email address
          </Text>
        )}

        <FormInput label="Phone Number" placeholder="03XXXXXXXXX" iconName="call-outline" keyboardType="phone-pad" value={form.phone} onChangeText={(txt) => handleInput("phone", txt)} />
        {form.phone.length > 0 && form.phone.length < 11 && (
          <Text className="text-yellow-400 text-rs mt-1">
            Phone Number must be at least 11 digits
          </Text>
        )}

        <FormInput label="Password" placeholder="Minimum 6 characters" iconName="lock-closed-outline" isPassword value={form.password} onChangeText={(t) => handleInput("password", t)} />
        {form.password.length > 0 && form.password.length < 6 && (
          <Text className="text-yellow-400 text-rs mt-1">
            Password must be at least 6 characters
          </Text>
        )}

        <FormInput label="Confirm Password" placeholder="Re-enter Password" iconName="lock-closed-outline" isPassword value={form.confirmPassword} onChangeText={(t) => handleInput("confirmPassword", t)} />
        {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
          <Text className="text-red-400 text-rs mt-1">
            Passwords do not match
          </Text>
        )}

        <FormInput label="CNIC (13 Digits)" placeholder="42XXXXXXXXXXX" iconName="card-outline" keyboardType="numeric" value={form.cnic} onChangeText={(t) => handleInput("cnic", t)} />
        {form.cnic.length > 0 && form.cnic.length < 13 && (
          <Text className="text-yellow-400 text-rs mt-1">
            CNIC number must be at least 13 digits
          </Text>
        )}

        {/* ✅ Emergency ONLY for user */}
        {role === "user" && (
          <View
            style={{ padding: cardPadding, marginBottom: verticalSpacing, borderRadius: 16 }}
            className="bg-white/10 border border-white/20 mt-4"
          >
            <FormInput
              label="Emergency Contact"
              placeholder="03XXXXXXXXX"
              iconName="shield-outline"
              keyboardType="phone-pad"
              value={form.emergency}
              onChangeText={(txt) => handleInput("emergency", txt)}
            />

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
        )}

        <FormInput label="Home Address" placeholder="Street, City, Area" iconName="location-outline" value={form.address} onChangeText={(txt) => handleInput("address", txt)} />

        <AgreeCheckbox agree={agree} onToggle={() => setAgree(!agree)} />

{/* Login Link */}
<View className="items-center mt-0 mb-0">
  <TouchableOpacity onPress={() => router.push("/auth/Login")}>
    <Text className="text-white text-sm">
      Have an account?{" "}
      <Text className="text-blue-400 font-semibold">
        Login
      </Text>
    </Text>
  </TouchableOpacity>
</View>

<View className="items-center w-full" style={{ marginTop: verticalSpacing }}>
  <Button
    title={loading ? "Signing up..." : "Continue"}
    disabled={!isFormValid}
    onPress={handleContinue}
  />
</View>

      </View>
    </ScrollView>
  </KeyboardAvoidingView>
);
};

export default SignUpF;