import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

// Firebase
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/config/firebase";

const Reset = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleReset = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        "Reset Email Sent",
        "Check your email to reset your password",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error: any) {
      let message = "Something went wrong";

      if (error.code === "auth/user-not-found") {
        message = "No account found with this email";
      }

      Alert.alert("Error", message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: width * 0.06, paddingBottom: 50 }} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mt-6 mb-8 border border-white/20"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* FORM CARD */}
      <View className="bg-white/10 p-6 rounded-3xl border border-white/20">
        <Text className="text-white text-3xl font-bold mb-2">
          Reset Password
        </Text>

        <Text className="text-white/70 mb-8 font-medium">
          Enter your email to receive a reset link
        </Text>

        {/* INPUT */}
        <FormInput
          label="Email Address"
          placeholder="example@mail.com"
          iconName="mail-outline"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {email.length > 0 && !validateEmail(email) && (
          <Text className="text-yellow-400 text-xs font-bold mb-3 -top-2 ml-2">
            Enter a valid email address
          </Text>
        )}

        {/* BUTTON */}
        <View className="items-center mt-4">
          <Button
            title={loading ? "Sending..." : "Send Reset Email"}
            onPress={handleReset}
            disabled={!validateEmail(email) || loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Reset;