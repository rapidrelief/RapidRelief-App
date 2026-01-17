import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ProfileHeader = ({ isEditing, setIsEditing }: any) => (
  <View className="px-6 flex-row items-center justify-between mb-8 w-full">
    {/* flex-1 and flex-shrink-1 are key to keeping the text from pushing buttons off-screen */}
    <View className="flex-row items-center flex-1 mr-2">
      <View className="bg-[#3B82F6] p-3 rounded-2xl mr-3 shadow-sm">
        <Feather name="user" size={24} color="white" />
      </View>
      <View className="flex-shrink">
        <Text className="text-xl font-bold text-[#1E293B]">Personal</Text>
        <Text className="text-xl font-bold text-[#1E293B] -mt-1">Information</Text>
      </View>
    </View>

    <View>
      {isEditing ? (
        <View className="flex-col space-y-2 items-end">
          <TouchableOpacity 
            onPress={() => setIsEditing(false)}
            className="bg-[#22C55E] flex-row items-center px-4 py-2 rounded-xl shadow-md min-w-[100px] justify-center"
          >
            <Feather name="save" size={14} color="white" />
            <Text className="text-white font-bold ml-2 text-xs">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsEditing(false)}
            className="bg-white border border-[#E2E8F0] px-4 py-2 rounded-xl min-w-[100px] justify-center"
          >
            <Text className="text-[#1E293B] font-bold text-xs">Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => setIsEditing(true)}
          className="bg-[#2563EB] flex-row items-center px-4 py-2.5 rounded-xl shadow-md"
        >
          <Feather name="edit-3" size={16} color="white" />
          <Text className="text-white font-bold ml-2 text-xs">Edit Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default ProfileHeader;