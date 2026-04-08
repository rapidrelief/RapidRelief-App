import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProfileHeaderProps {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onSave: () => void;
  onCancle: () => void;
}

const ProfileHeader = ({ isEditing, setIsEditing, onSave, onCancle, }: ProfileHeaderProps) => {
  const { width } = useWindowDimensions();

  // Optimized Responsive Scaling
  const res = useMemo(() => {
    // Determine if we are on a very small device
    const isSmall = width < 380;
    
    return {
      containerPadding: width * 0.05,
      iconPadding: width * 0.03,
      iconSize: width * 0.06,
      titleSize: Math.min(width * 0.05, 22),
      btnText: width * 0.03,
      btnPaddingX: width * 0.04,
      btnPaddingY: width * 0.025,
      spacing: width * 0.03,
      minBtnWidth: width * 0.25,
    };
  }, [width]);

  return (
    <View 
      style={{ paddingHorizontal: res.containerPadding }} 
      className="flex-row items-center justify-between mb-8 w-full"
    >
      {/* Left Section: Title and Icon */}
      <View className="flex-row items-center flex-1 mr-2">
        <View 
          style={{ padding: res.iconPadding }} 
          className="bg-[#3B82F6] rounded-2xl mr-3 shadow-sm"
        >
          <Feather name="user" size={res.iconSize} color="white" />
        </View>
        <View className="flex-shrink">
          <Text style={{ fontSize: res.titleSize }} className="font-bold text-[#1E293B]">
            Personal
          </Text>
          <Text 
            style={{ fontSize: res.titleSize, marginTop: -(res.titleSize * 0.1) }} 
            className="font-bold text-[#1E293B]"
          >
            Information
          </Text>
        </View>
      </View>

      {/* Right Section: Buttons */}
      <View>
        {isEditing ? (
          <View className="flex-col items-end">
            <TouchableOpacity 
              onPress={onSave}
              style={{ 
                paddingHorizontal: res.btnPaddingX, 
                paddingVertical: res.btnPaddingY,
                minWidth: res.minBtnWidth,
                marginBottom: 8 
              }}
              className="bg-[#22C55E] flex-row items-center rounded-xl shadow-md justify-center"
            >
              <Feather name="save" size={res.btnText + 2} color="white" />
              <Text style={{ fontSize: res.btnText }} className="text-white font-bold ml-2">
                Save
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onCancle}
              style={{ 
                paddingHorizontal: res.btnPaddingX, 
                paddingVertical: res.btnPaddingY,
                minWidth: res.minBtnWidth 
              }}
              className="bg-white border border-[#E2E8F0] rounded-xl justify-center"
            >
              <Text style={{ fontSize: res.btnText }} className="text-[#1E293B] font-bold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => setIsEditing(true)}
            style={{ 
              paddingHorizontal: res.btnPaddingX, 
              paddingVertical: res.btnPaddingY * 1.25 
            }}
            className="bg-[#2563EB] flex-row items-center rounded-xl shadow-md"
          >
            <Feather name="edit-3" size={res.btnText + 4} color="white" />
            <Text style={{ fontSize: res.btnText }} className="text-white font-bold ml-2">
              Edit Profile
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Optimization: Memoize the header to prevent unnecessary re-renders when other profile fields change
export default React.memo(ProfileHeader);