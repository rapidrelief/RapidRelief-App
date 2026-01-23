import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { 
  Text, 
  TouchableOpacity, 
  View, 
  useWindowDimensions, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import Button from "../../components/Button";
import FormInput from "../../components/FormInput";

const Reset = ({ navigation, onNext, phoneNumber, setPhoneNumber }: any) => {
  const { height, width } = useWindowDimensions();
  
  const res = useMemo(() => ({
    titleSize: Math.min(width * 0.08, 32),
    subtitleSize: Math.min(width * 0.04, 16),
    topMargin: height * 0.02,
    contentGap: height * 0.04,
    containerPaddingBottom: height * 0.05, 
  }), [width, height]);

  return (
    <SafeAreaView className="flex-1 bg-transparent">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View 
            style={{ paddingBottom: res.containerPaddingBottom }} 
            className="flex-1 px-8"
          >
            <View style={{ marginTop: res.topMargin }} className="flex-1">
              {/* Back Button */}
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="flex-row items-center mb-6 py-2 active:opacity-60"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
                <Text className="text-white text-base ml-2 font-medium">Back</Text>
              </TouchableOpacity>

              {/* Text Content */}
              <View style={{ marginBottom: res.contentGap }}>
                <Text 
                  style={{ fontSize: res.titleSize, lineHeight: res.titleSize * 1.2 }} 
                  className="text-white font-bold tracking-tight"
                >
                  Reset Password
                </Text>
                <Text 
                  style={{ fontSize: res.subtitleSize }}
                  className="text-white/70 mt-2 leading-6"
                >
                  Enter your phone number to receive OTP
                </Text>
              </View>
              
              {/* Input Section */}
              <View className="w-full">
                <FormInput
                  label="Phone Number"
                  placeholder="+92 300 1234567"
                  iconName="call"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {/* ACTION AREA */}
            <View className="items-center mt-8 mb-4"> 
              <Button 
                title="Send OTP" 
                onPress={onNext} // Standard prop from your Button.tsx
                disabled={phoneNumber.length < 10} 
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Reset;