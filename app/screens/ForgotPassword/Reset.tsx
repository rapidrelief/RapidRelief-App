import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
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
    <View style={{ flex: 1, paddingHorizontal: width * 0.08 }}>

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center mt-6 mb-6"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text className="text-white ml-2 text-base">Back</Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text className="text-white text-3xl font-bold">
        Reset Password
      </Text>

      <Text className="text-white/70 mt-2 mb-6">
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
        <Text className="text-yellow-400 text-xs mt-1">
          Enter a valid email
        </Text>
      )}

      {/* BUTTON */}
      <View className="items-center mt-8">
        <Button
          title={loading ? "Sending..." : "Send Reset Email"}
          onPress={handleReset}
          disabled={!validateEmail(email) || loading}
        />
      </View>
    </View>
  );
};

export default Reset;