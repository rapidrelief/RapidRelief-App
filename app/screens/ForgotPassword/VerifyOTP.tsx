import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo, useEffect } from "react";
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

const VerifyOTP = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const { height, width } = useWindowDimensions();

  // Handle Countdown Timer
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Responsive UI Scaling
  const res = useMemo(() => ({
    titleSize: Math.min(width * 0.08, 30),
    subtitleSize: Math.min(width * 0.038, 15),
    topMargin: height * 0.02,
    contentGap: height * 0.04,
    containerPaddingBottom: height * 0.05,
  }), [width, height]);

  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setOtp(numericValue);
  };

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
            {/* Top Content Area */}
            <View style={{ marginTop: res.topMargin }} className="flex-1">
              
              <TouchableOpacity 
                onPress={onBack} 
                className="flex-row items-center mb-6 py-2 active:opacity-60"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
                <Text className="text-white text-base ml-2 font-medium">Back</Text>
              </TouchableOpacity>

              <View style={{ marginBottom: res.contentGap }}>
                <Text 
                  style={{ fontSize: res.titleSize, lineHeight: res.titleSize * 1.2 }} 
                  className="text-white font-bold tracking-tight"
                >
                  Verify OTP
                </Text>
                <Text 
                  style={{ fontSize: res.subtitleSize }} 
                  className="text-white/60 mt-2 font-medium leading-5"
                >
                  Enter the 6-digit code sent to your phone
                </Text>
              </View>

              <View className="w-full">
                <FormInput
                  label="OTP Code"
                  placeholder="123456"
                  iconName="key"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={handleOtpChange}
                  maxLength={6} // Enforces 6-digit limit
                />

                <TouchableOpacity 
                  onPress={() => timer === 0 && setTimer(30)} 
                  disabled={timer > 0}
                  className="mt-6 self-center py-2"
                >
                  <View className="flex-row items-center">
                    <Text className={`text-sm font-semibold tracking-wide ${timer > 0 ? "text-white/30" : "text-white"}`}>
                      {timer > 0 ? "RESEND CODE IN " : "DIDN'T GET THE CODE? "}
                    </Text>
                    {timer > 0 ? (
                      <View className="bg-white/10 px-2 py-0.5 rounded-md ml-1">
                        <Text className="text-white font-bold text-sm">{timer}s</Text>
                      </View>
                    ) : (
                      <Text className="text-[#FFD700] font-bold text-sm underline ml-1">RESEND</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Action Button */}
            <View className="items-center mt-8 mb-4">
              <Button 
                title="Verify OTP" 
                onPress={onNext} 
                disabled={otp.length !== 6} 
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyOTP;