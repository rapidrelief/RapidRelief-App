import { Ionicons } from "@expo/vector-icons";
import React, { useState, useMemo } from "react";
import { 
  Text, 
  TouchableOpacity, 
  View, 
  useWindowDimensions, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert
} from "react-native";
import Button from "../../components/Button";
import FormInput from "../../components/FormInput";

interface NewPasswordProps {
  onFinish: () => void;
  onBack: () => void;
}

const NewPassword: React.FC<NewPasswordProps> = ({ onFinish, onBack }) => {
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added for Fake Data simulation
  const { height, width } = useWindowDimensions();

  const styles = useMemo(() => {
    const isSmallDevice = height < 700;
    return {
      titleSize: Math.min(width * 0.085, 34), 
      subtitleSize: Math.min(width * 0.042, 17),
      topMargin: height * 0.02,
      contentGap: isSmallDevice ? 15 : height * 0.03, 
      inputSpacing: isSmallDevice ? 10 : 16,
      checklistPadding: isSmallDevice ? 16 : 20,
      checklistMarginTop: isSmallDevice ? 15 : 32,
    };
  }, [width, height]);

  const validations = useMemo(() => ({
    length: pass.length >= 8,
    uppercase: /[A-Z]/.test(pass),
    special: /[0-9!@#$%^&*]/.test(pass),
    match: pass === confirmPass && pass.length > 0,
  }), [pass, confirmPass]);

  const isFormValid = useMemo(() => 
    Object.values(validations).every(Boolean), 
  [validations]);

  // FAKE BACKEND LOGIC
  const handleFakeReset = () => {
    if (!isFormValid) return;

    setIsLoading(true);

    // Simulate a 2-second API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Show a success message before navigating
      Alert.alert(
        "Success",
        "Your password has been reset successfully!",
        [{ text: "OK", onPress: () => onFinish() }]
      );
    }, 2000);
  };

  const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
    <View className="flex-row items-center mb-2.5">
      <Ionicons 
        name={met ? "checkmark-circle" : "ellipse-outline"} 
        size={16} 
        color={met ? "#4ADE80" : "rgba(255,255,255,0.3)"} 
      />
      <Text className={`ml-3 text-[13px] font-medium tracking-wide ${met ? "text-white" : "text-white/40"}`}>
        {label}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} bounces={false}>
        <View className="flex-1 px-8 pb-8">
          <View style={{ marginTop: styles.topMargin }}>
            
            <TouchableOpacity onPress={onBack} disabled={isLoading} className="flex-row items-center mb-7 active:opacity-60">
              <Ionicons name="arrow-back" size={26} color="white" />
              <Text className="text-white text-lg ml-2 font-medium">Back</Text>
            </TouchableOpacity>

            <View style={{ marginBottom: styles.contentGap }}>
              <Text style={{ fontSize: styles.titleSize, lineHeight: styles.titleSize * 1.2 }} className="text-white font-bold tracking-tight">
                New Password
              </Text>
              <Text style={{ fontSize: styles.subtitleSize }} className="text-white/70 mt-2 font-medium leading-6">
                Create a strong new password
              </Text>
            </View>

            <View className="w-full">
              <FormInput 
                label="New Password" 
                placeholder="••••••••" 
                iconName="lock-closed" 
                isPassword={true} 
                value={pass} 
                onChangeText={setPass}
                editable={!isLoading} 
              />
              <View style={{ marginTop: styles.inputSpacing }}>
                <FormInput 
                  label="Confirm Password" 
                  placeholder="••••••••" 
                  iconName="lock-closed" 
                  isPassword={true} 
                  value={confirmPass} 
                  onChangeText={setConfirmPass}
                  editable={!isLoading} 
                />
              </View>
            </View>

            <View style={{ marginTop: styles.checklistMarginTop, padding: styles.checklistPadding }} className="bg-white/5 rounded-2xl border border-white/10">
              <Text className="text-white font-bold mb-4 text-[10px] uppercase tracking-[2.5px] text-white/30">
                Security Checklist
              </Text>
              <ValidationItem label="At least 8 characters" met={validations.length} />
              <ValidationItem label="One uppercase letter" met={validations.uppercase} />
              <ValidationItem label="One number or symbol" met={validations.special} />
              <ValidationItem label="Passwords must match" met={validations.match} />
            </View>
          </View>

          <View className="flex-1 min-h-[30px]" />

          <View className="items-center mt-4">
            {isLoading ? (
              <ActivityIndicator color="#4ADE80" size="large" />
            ) : (
              <Button 
                title="Reset Password" 
                onPress={handleFakeReset} 
                disabled={!isFormValid}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NewPassword;