import React, { memo } from "react";
import { Text, View } from "react-native";

interface WelcomeProps {
  userName?: string;
}

const Welcome = ({ userName = "" }: WelcomeProps) => {
  // Determine text based on presence of userName
  const greeting = userName ? `Welcome Back, ${userName}` : "Welcome Back!";

  return (
    <View className="mb-8">
      <Text
        className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
        numberOfLines={2}
        adjustsFontSizeToFit // Ensures text doesn't break on small devices
      >
        {greeting}
      </Text>
      <Text className="text-lg text-gray-500 font-medium mt-1">
        Stay safe and informed
      </Text>
    </View>
  );
};

export default memo(Welcome);
