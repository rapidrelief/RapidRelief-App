import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/app/config/firebase";

export type EmergencyContactsData = {
  primary: string;
  secondary: string[];
};

export const normalizeEmergencyContacts = (data: any): EmergencyContactsData => {
  const saved = data?.emergencyContacts || {};
  const primary = saved.primary || data?.emergency || "";
  const secondary = Array.isArray(saved.secondary)
    ? saved.secondary.filter(Boolean).slice(0, 3)
    : [];

  return {
    primary,
    secondary,
  };
};

export const getEmergencyContacts = async () => {
  const user = auth.currentUser;
  if (!user) return { primary: "", secondary: [] };

  const snap = await getDoc(doc(db, "users", user.uid));
  return normalizeEmergencyContacts(snap.exists() ? snap.data() : {});
};

export const saveEmergencyContacts = async (contacts: EmergencyContactsData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User is not logged in");

  const primary = contacts.primary.trim();
  const secondary = contacts.secondary
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  await updateDoc(doc(db, "users", user.uid), {
    emergency: primary,
    emergencyContacts: {
      primary,
      secondary,
    },
  });

  return { primary, secondary };
};
