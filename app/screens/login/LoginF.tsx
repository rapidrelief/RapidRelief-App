import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View, useWindowDimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";

//firebase imports
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebase";

const LogF = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  //const [identity, setIdentity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState("");

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



      //saving login time
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

// 🔥 ROLE BASED NAVIGATION
if (role === "rescuer") {
  router.replace("/rescuer/dashboard");
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

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center mt-4 mb-4 self-start"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text className="text-white ml-2 text-base">Back</Text>
      </TouchableOpacity>

      {/*Email*/}
      <FormInput 
        label="Email Address or Rescuer ID" 
        placeholder="example@mail.com or RES-xxxxxx" 
        iconName="mail-outline" 
        keyboardType="email-address" 
        value={identity} 
        onChangeText={setIdentity} 
      />

      {identity.includes("@") && !validateEmail(identity) && (
        <Text className="text-yellow-400 text-xs mt-1">
          Enter a valid email
        </Text>
      )}

      {/*Password*/}
      <FormInput 
        label="Password" 
        placeholder="Enter password" 
        iconName="lock-closed-outline" 
        isPassword={true} 
        value={password} 
        onChangeText={setPassword} 
      />

      {password.length > 0 && password.length < 6 && (
        <Text className="text-yellow-400 text-xs mt-1">
          Minium 6 characters required
        </Text>
      )}

      {/*Remember*/}
      <View className="flex-row items-center justify-between w-full" style={{ marginTop: 5 }}>
        <TouchableOpacity onPress={() => setIsChecked(!isChecked)} className="flex-row items-center" activeOpacity={0.8}>
          <View 
          style={{ 
            width: width * 0.055, 
            height: width * 0.055, 
            borderColor: 'white', 
            borderWidth: 2, 
            borderRadius: 4, 
            backgroundColor: isChecked ? 'white' : 'transparent', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
          >
            {isChecked && <Ionicons name="checkmark" size={width * 0.04} color="#1A4BCC" />}
          </View>

          <Text className="text-white ml-2 text-sm">
            Terms & Conditions
            </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => router.push("/auth/Login/forgotPass")}>
          <Text className="text-white underline text-sm">Forgot Password?</Text>
        </TouchableOpacity>
      </View>


      {/*Button*/}
      <View className="items-center mt-6" >
        <Button 
          title={loading ? "Logging in..." : "Log In"} 
          onPress={handelLogin} 
          disabled={!canContinue || loading} 
        />
      </View>

      {/*Signup option*/}
      <View className="items-center mt-4" >
        <TouchableOpacity onPress={() => router.push("/screens/Sign/SignUpScreen")}>
          <Text className="text-white text-sm">
            Dont't have an account?{" "}
            <Text className="font-bold">
             SignUp Now
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default LogF;