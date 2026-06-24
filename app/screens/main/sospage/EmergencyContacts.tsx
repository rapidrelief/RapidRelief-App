import React, { memo, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import router
import { auth, db } from "@/app/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { normalizeEmergencyContacts } from "@/app/services/emergencyContactsService";

const ContactCard = ({ type, phone, label, color, onCall }: any) => (
  <View className="bg-white p-4 rounded-3xl border border-slate-100 mb-3 flex-row justify-between items-center">
    <View className="flex-1 pr-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-800 font-extrabold">{type}</Text>
        <View className={`px-3 py-1 rounded-lg ${color}`}>
          <Text className="text-[10px] font-bold">{label}</Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <Feather name="phone" size={14} color="#64748B" />
        <Text className="text-slate-600 ml-2 font-semibold">{phone}</Text>
      </View>
    </View>
    <TouchableOpacity
      onPress={() => onCall(phone)}
      style={{
        backgroundColor: '#EFF6FF',
        padding: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#DBEAFE',
      }}
      activeOpacity={0.7}
    >
      <Feather name="phone" size={18} color="#2563EB" />
    </TouchableOpacity>
  </View>
);

const EmergencyContacts = () => {
  const router = useRouter(); // Initialize router
  const [contacts, setContacts] = useState({ primary: "", secondary: [] as string[] });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setContacts(normalizeEmergencyContacts(snap.exists() ? snap.data() : {}));
    });

    return unsub;
  }, []);

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch((err) => {
      console.log("Could not initiate call:", err);
    });
  };

  const hasContacts = contacts.primary || contacts.secondary.length > 0;

  return (
    <View className="mb-6 px-1">
      <View className="flex-row items-center mb-4">
        <View className="bg-blue-100 p-2 rounded-xl mr-3">
          <Feather name="user" size={18} color="#2563EB" />
        </View>
        <Text className="text-lg font-extrabold text-slate-800">Emergency Contacts</Text>
      </View>

      {!hasContacts ? (
        <View className="bg-white p-4 rounded-3xl border border-slate-100 mb-3">
          <Text className="text-slate-500 font-semibold">
            Go to Manage Contacts to add emergency contact.
          </Text>
        </View>
      ) : (
        <>
          {contacts.primary ? (
            <ContactCard type="Primary Contact" phone={contacts.primary} label="Active" color="bg-blue-50" onCall={handleCall} />
          ) : null}

          {contacts.secondary.map((phone, index) => (
            <ContactCard
              key={`${phone}-${index}`}
              type={`Secondary Contact ${index + 1}`}
              phone={phone}
              label="Backup"
              color="bg-slate-50"
              onCall={handleCall}
            />
          ))}
        </>
      )}

      <TouchableOpacity 
        onPress={() => router.push('/drawer/sospath/ManageContacts')} // Navigation trigger
        className="w-full py-4 border border-slate-200 rounded-2xl items-center mt-2 bg-white active:bg-slate-50 shadow-sm"
      >
        <Text className="text-slate-800 font-bold">Manage Contacts</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(EmergencyContacts);
