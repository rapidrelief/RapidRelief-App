import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "@/app/config/firebase";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days (expire after 7 Days)

export const checkSession = async () => {
  try {
    const loginTime = await AsyncStorage.getItem("loginTime");

    if (!loginTime) return false;

    const now = Date.now();

    if (now - parseInt(loginTime) > SESSION_DURATION) {
      // EXPIRED → LOGOUT
      await signOut(auth);
      await AsyncStorage.removeItem("loginTime");
      return false;
    }

    return true;

  } catch (error) {
    return false;
  }
};