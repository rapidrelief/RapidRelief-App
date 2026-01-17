import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";

const LogF = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const canContinue = identity.trim().length > 0 && password.length >= 6 && isChecked;

  return (
    <View style={{ paddingHorizontal: width * 0.08, width: '100%' }}>
      <FormInput 
        label="Phone Number or Email" 
        placeholder="Enter your name" 
        iconName="phone-in-talk" 
        iconType="material" 
        value={identity} 
        onChangeText={setIdentity} 
      />
      <FormInput 
        label="Password" 
        placeholder="Enter password" 
        iconName="lock-closed-outline" 
        isPassword={true} 
        value={password} 
        onChangeText={setPassword} 
      />

      <View className="flex-row items-center justify-between w-full" style={{ marginTop: 5 }}>
        <TouchableOpacity onPress={() => setIsChecked(!isChecked)} className="flex-row items-center" activeOpacity={0.8}>
          <View style={{ 
            width: width * 0.055, height: width * 0.055, 
            borderColor: 'white', borderWidth: 2, borderRadius: 4, 
            backgroundColor: isChecked ? 'white' : 'transparent', 
            justifyContent: 'center', alignItems: 'center' 
          }}>
            {isChecked && <Ionicons name="checkmark" size={width * 0.04} color="#1A4BCC" />}
          </View>
          <Text style={{ color: 'white', marginLeft: 8, fontSize: width * 0.035 }}>Remember me</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push("/auth/Login/forgotPass")}>
          <Text style={{ fontSize: width * 0.035 }} className="text-white underline font-medium">Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center" style={{ marginTop: height * 0.04 }}>
        <Button 
          title="Log In" 
          onPress={() => router.push("/drawer/dashboard")} 
          disabled={!canContinue} 
        />
      </View>
    </View>
  );
};

export default LogF;