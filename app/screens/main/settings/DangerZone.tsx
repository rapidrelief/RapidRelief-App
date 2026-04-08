import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DeleteModal from '../dashboard/Personal/_DeleteModal';

const DangerZone = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <View className="bg-red-50 border border-red-100 rounded-[32px] p-6 mb-10 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="bg-red-600 p-3 rounded-2xl">
            <Feather name="alert-triangle" size={24} color="white" />
          </View>

          <Text className="ml-4 text-xl font-bold text-slate-900">
            Danger Zone
          </Text>
        </View>

        <Text className="text-slate-600 text-sm mb-8 leading-5">
          Once you delete your account, there is no going back. Your profile,
          emergency contacts, alerts, and saved information will be permanently removed.
        </Text>

        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          activeOpacity={0.8}
          className="bg-red-600 py-4 rounded-[20px] items-center shadow-md shadow-red-200"
        >
          <Text className="text-white font-medium text-lg">
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      <DeleteModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default DangerZone;