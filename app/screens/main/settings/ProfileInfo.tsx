import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormInput from '@/app/components/FormInput'; 

interface InfoRowProps {
  icon: string;
  label: string;
  initialValue: string;
  storageKey: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

const InfoRow = React.memo(({ icon, label, initialValue, storageKey, keyboardType = 'default' }: InfoRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const { width, height } = useWindowDimensions();

  // Load saved data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedValue = await AsyncStorage.getItem(storageKey);
        if (savedValue) setValue(savedValue);
      } catch (e) {
        console.error("AsyncStorage Load Error", e);
      }
    };
    loadData();
  }, [storageKey]);

  // FULL RESPONSIVE SCALING: Calculated based on screen width/height
  const styles = useMemo(() => {
    const isSmallDevice = height < 700;
    return {
      rowPadding: isSmallDevice ? 10 : 14,
      iconContainerSize: width * 0.09, // Relative circle/square size
      iconSize: width * 0.045,
      fontSize: Math.min(width * 0.038, 16),
      labelSize: Math.min(width * 0.03, 13),
      btnPaddingX: width * 0.04,
      btnPaddingY: width * 0.015,
      btnText: width * 0.032,
    };
  }, [width, height]);

  const validate = useCallback(() => {
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      Alert.alert("Error", `${label} cannot be empty`);
      return false;
    }
    if (keyboardType === 'phone-pad' && !/^\+?[0-9]{10,15}$/.test(trimmedValue.replace(/\s/g, ''))) {
      Alert.alert("Invalid Number", "Please enter a valid phone number");
      return false;
    }
    if (keyboardType === 'email-address' && !/\S+@\S+\.\S+/.test(trimmedValue)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return false;
    }
    return true;
  }, [value, label, keyboardType]);

  const handleSave = async () => {
    if (isEditing) {
      if (validate()) {
        await AsyncStorage.setItem(storageKey, value);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <View 
      style={{ paddingVertical: styles.rowPadding }}
      className="flex-row items-center justify-between border-b border-slate-50"
    >
      <View className="flex-row items-center flex-1 mr-3">
        {/* Responsive Icon Container */}
        <View 
          style={{ width: styles.iconContainerSize, height: styles.iconContainerSize }}
          className="bg-slate-50 items-center justify-center rounded-xl"
        >
          <Feather name={icon as any} size={styles.iconSize} color="#64748b" />
        </View>

        <View className="ml-3 flex-1">
          {isEditing ? (
            <View className="mt-[-10px]"> 
              {/* FormInput already handles its own labels and icons, 
                  we wrap it to negate the default margins for row alignment */}
              <FormInput
                label="" // Pass empty string to avoid double labels in a row
                placeholder={label}
                iconName={icon}
                value={value}
                onChangeText={setValue}
                keyboardType={keyboardType}
              />
            </View>
          ) : (
            <>
              <Text style={{ fontSize: styles.labelSize }} className="text-slate-400 font-medium">
                {label}
              </Text>
              <Text 
                style={{ fontSize: styles.fontSize }} 
                className="text-slate-800 font-semibold" 
                numberOfLines={1}
              >
                {value}
              </Text>
            </>
          )}
        </View>
      </View>
      
      {/* Dynamic Button */}
      <TouchableOpacity 
        onPress={handleSave}
        style={{ paddingHorizontal: styles.btnPaddingX, paddingVertical: styles.btnPaddingY }}
        className={`rounded-lg border ${
          isEditing ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <Text 
          style={{ fontSize: styles.btnText }}
          className={`font-bold uppercase tracking-tight ${isEditing ? 'text-white' : 'text-slate-600'}`}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const ProfileInfo = () => {
  const { width, height } = useWindowDimensions();

  // Scale the whole card's padding and border radius
  const cardStyles = useMemo(() => ({
    padding: width * 0.05,
    borderRadius: width * 0.08, // Approx 32px on standard screens
    headerIconSize: width * 0.05,
    headerText: width * 0.045,
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
      <View className="flex-row items-center mb-4">
        <View className="bg-blue-100 p-3 rounded-2xl">
          <Feather name="user" size={cardStyles.headerIconSize} color="#2563eb" />
        </View>
        <Text 
          style={{ fontSize: cardStyles.headerText }} 
          className="ml-3 font-extrabold text-slate-800"
        >
          Profile Information
        </Text>
      </View>
      
      {/* Information Rows */}
      <InfoRow icon="user" label="Full Name" initialValue="John Doe" storageKey="@user_name" />
      <InfoRow icon="phone" label="Phone Number" initialValue="+92 300 1234567" storageKey="@user_phone" keyboardType="phone-pad" />
      <InfoRow icon="mail" label="Email" initialValue="john.doe@example.com" storageKey="@user_email" keyboardType="email-address" />
      <InfoRow icon="map-pin" label="Location" initialValue="Gulberg III, Lahore" storageKey="@user_location" />
    </View>
  );
};

export default ProfileInfo;