import React from "react";
import { View, useWindowDimensions } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

interface LogBtnProps {
  onPress?: () => void;
}

const LogBtn: React.FC<LogBtnProps> = ({ onPress }) => {
  const router = useRouter();
  const { height } = useWindowDimensions();

  return (
    <View 
      className="w-full items-center" 
      style={{ marginTop: height * 0.02 }}
    >
      <Button 
        title="Log In" 
        onPress={onPress ?? (() => router.push("/"))} 
      />
    </View>
  );
};

export default LogBtn;