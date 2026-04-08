import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth, db } from '@/app/config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

const InfoRow = React.memo(({ icon, label, value }: InfoRowProps) => {
  const { width, height } = useWindowDimensions();


  // FULL RESPONSIVE SCALING: Calculated based on screen width/height
  const styles = useMemo(() => {
    const isSmallDevice = height < 700;
    return {
      rowPadding: isSmallDevice ? 12 : 16,
      iconContainerSize: width * 0.09, // Relative circle/square size
      iconSize: width * 0.045,
      fontSize: Math.min(width * 0.038, 16),
      labelSize: Math.min(width * 0.03, 13),
    };
  }, [width, height]);

  return (
    <View 
      style={{ paddingVertical: styles.rowPadding }}
      className="flex-row items-center justify-between border-b border-slate-50"
    >
        <View 
          style={{ 
            width: styles.iconContainerSize, 
            height: styles.iconContainerSize 
          }}
          className="bg-slate-50 items-center justify-center rounded-xl"
        >
          <Feather name={icon as any} size={styles.iconSize} color="#64748b" />
        </View>

        <View className="ml-3 flex-1">
              <Text 
              style={{ fontSize: styles.labelSize }} 
              className="text-slate-400 font-medium">
                {label}
              </Text>
              
              <Text 
                style={{ fontSize: styles.fontSize }} 
                className="text-slate-800 font-semibold" 
                numberOfLines={2}
              >
                {value || 'Not Available'}
              </Text>
        </View>
      </View>
  );
});

const ProfileInfo = () => {
  const router = useRouter();
  const { width} = useWindowDimensions();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const unsubscribe = onSnapshot(
      doc (db, 'user', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          setFullName(data.fullName || '');
          setEmail(data.email || user.email || '');
          setPhone(data.phone || data.locationAddress || '');
        }
      }
    );
    return unsubscribe;
  }, []);


  // Scale the whole card's padding and border radius
  const cardStyles = useMemo(() => ({
    padding: width * 0.05,
    borderRadius: width * 0.08, // Approx 32px on standard screens
    headerIconSize: width * 0.05,
    headerText: width * 0.045,
    buttonText: Math.min(width * 0.032, 12),
  }), [width]);

  return (
    <View 
      style={{ 
        padding: cardStyles.padding, 
        borderRadius: cardStyles.borderRadius 
      }}
      className="bg-white border border-slate-100 mb-6 shadow-sm"
    >
      {/* Header Section */}
      <View className="flex-row items-center justify-between flex-wrap mb-4">
      <View className="flex-row items-center flex-1 min-w-0">
        <View className="bg-blue-100 p-3 rounded-2xl">
          <Feather name="user" size={cardStyles.headerIconSize} color="#2563eb" />
        </View>
        <Text 
          style={{ fontSize: cardStyles.headerText }} 
          className="ml-3 font-extrabold text-slate-800 flex-shrink"
        >
          Profile Information
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => router.push('/drawer/Profile/PersonalInfo')}
        activeOpacity={0.8}
        className="bg-[#EBF3FF] border border-[#DBEAFE] px-4 py-2 rounded-xl ml-2 mt-2"
      >
        <Text
          style={{ fontSize: cardStyles.buttonText }}
          className="text-[#2563EB] font-bold "
        >
          View/Edit
        </Text>
      </TouchableOpacity>
      </View>
      
      {/* Information Rows */}
      <InfoRow icon="user" label="Full Name" value={fullName}/>
      <InfoRow icon="phone" label="Phone Number" value={phone}/>
      <InfoRow icon="mail" label="Email Address" value={email}/>
      <InfoRow icon="map-pin" label="live Location" value={address}/>
    </View>
  );
};

export default ProfileInfo;