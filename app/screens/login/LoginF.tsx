import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";
import TermsModal from "../../components/TermsModal";

//firebase imports
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

const LogF = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const canContinue =
    (identity.includes("@") ? validateEmail(identity) : identity.length > 0) &&
    password.length >= 6 &&
    isChecked;

  const handelLogin = async () => {
    if (!canContinue) return;

    try {
      setLoading(true);
      let emailToUse = identity;

      if (!identity.includes("@")) {
        const q = await getDocs(
          query(collection(db, "users"), where("rescuerId", "==", identity))
        );

        if (q.empty) {
          Alert.alert("Invalid ID");
          return;
        }

        emailToUse = q.docs[0].data().email;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailToUse,
        password
      );

      const user = userCredential.user;

      await AsyncStorage.setItem("loginTime", Date.now().toString());

      if (!user.emailVerified) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in.",
          [
            {
              text: "Resend Email",
              onPress: async () => {
                await sendEmailVerification(user);
                Alert.alert("Verification Email sent again");
              },
            },
            { text: "OK" },
          ]
        );
        return;
      }

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        Alert.alert("Error", "User data not found");
        return;
      }

      const role = userDoc.data().role;
      const normalizedRole = role ? role.toLowerCase() : "user";

      if (normalizedRole === "rescuer") {
        if (!userDoc.data().cnic || userDoc.data().cnic.trim() === "") {
          router.replace("/rescuer/complete-profile");
        } else {
          router.replace("/rescuer/dashboard");
        }
      } else if (normalizedRole === "org_admin" || normalizedRole === "super_admin") {
        Alert.alert(
          "Access Denied", 
          "Organization Admins and Super Admins must use the Web Dashboard to manage the system. The mobile app is only for Rescuers and Civilians."
        );
        await auth.signOut();
        return;
      } else {
        router.replace("/drawer/dashboard");
      }

    } catch (error: any) {
      let message = "Login Failed";
      switch (error.code) {
        case "auth/user-not-found":
          message = "No account found with this email";
          break;
        case "auth/wrong-password":
          message = "Incorrect Email or Password";
          break;
        case "auth/invalid-email":
          message = "Invalid email format";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Try again later";
          break;
        default:
          message = error.message;
      }
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: width * 0.08, width: '100%' }}>
      
      {/* Glassmorphic Form Container */}
      <View className="bg-white/10 p-5 rounded-3xl border border-white/20 mb-6">
        
        <FormInput 
          label="Email or Rescuer ID" 
          placeholder="example@mail.com" 
          iconName="mail-outline" 
          keyboardType="email-address" 
          value={identity} 
          onChangeText={setIdentity} 
        />
        {identity.includes("@") && !validateEmail(identity) && (
          <Text className="text-yellow-400 text-xs ml-2 font-bold mb-3 -top-2">
            Enter a valid email address
          </Text>
        )}

        <FormInput 
          label="Password" 
          placeholder="Enter password" 
          iconName="lock-closed-outline" 
          isPassword={true} 
          value={password} 
          onChangeText={setPassword} 
        />
        {password.length > 0 && password.length < 6 && (
          <Text className="text-yellow-400 text-xs ml-2 font-bold mb-3 -top-2">
            Minimum 6 characters required
          </Text>
        )}

        {/* Remember / Terms */}
        <View className="flex-row items-center justify-between w-full mt-2">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setIsChecked(!isChecked)} activeOpacity={0.8}>
              <View 
                style={{ 
                  width: 22, 
                  height: 22, 
                  borderColor: 'rgba(255,255,255,0.5)', 
                  borderWidth: 2, 
                  borderRadius: 6, 
                  backgroundColor: isChecked ? 'white' : 'transparent', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}
              >
                {isChecked && <Ionicons name="checkmark" size={16} color="#1A4BCC" />}
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowTerms(true)}>
              <Text className="text-white ml-2 text-sm font-medium underline">
                Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={() => router.push("/auth/Login/forgotPass")}>
            <Text className="text-white/80 underline text-sm font-medium">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Primary Action Button */}
      <View className="items-center w-full">
        <Button 
          title={loading ? "Logging in..." : "Log In"} 
          onPress={handelLogin} 
          disabled={!canContinue || loading} 
        />
      </View>

      {/* Back & Signup Links */}
      <View className="flex-row justify-between items-center mt-6 px-2">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="flex-row items-center bg-white/10 px-4 py-2 rounded-full border border-white/20"
        >
          <Ionicons name="arrow-back" size={18} color="white" />
          <Text className="text-white ml-2 text-sm font-medium">Back</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/auth/SignUp")} className="flex-row items-center">
          <Text className="text-white/80 text-sm">
            New here?{" "}
            <Text className="text-white font-bold underline">
              Sign Up
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
    </View>
  );
};

export default LogF;