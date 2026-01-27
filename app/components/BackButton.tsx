import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

const BackButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      // FIX: .back() goes to previous screen,
      // "/" ensures they go to the index (Home) screen.
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      className="absolute top-12 left-4 z-50"
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Ionicons name="arrow-back" size={28} color="white" />
    </TouchableOpacity>
  );
};

export default BackButton;
