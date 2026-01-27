import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';

const DeleteModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  const { width } = useWindowDimensions();
  const [confirm, setConfirm] = useState('');

  // Responsive Scaling Utility
  const ms = (size: number) => size + (((width / 375) * size) - size) * 0.5;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center px-8">
        <View className="bg-white rounded-[32px] p-8 shadow-2xl">
          <Text style={{ fontSize: ms(20) }} className="font-black text-center text-slate-900">
            Delete Account?
          </Text>
          <Text style={{ fontSize: ms(12) }} className="text-slate-500 text-center mt-2 mb-6">
            This action is permanent. Type <Text className="font-bold text-red-500">DELETE</Text> to confirm.
          </Text>
          
          <TextInput 
            className="bg-red-50 p-4 rounded-2xl text-center mb-6 font-bold text-red-600 border border-red-100" 
            placeholder="DELETE" 
            value={confirm} 
            onChangeText={setConfirm} 
            autoCapitalize="characters" 
          />

          <View className="flex-row gap-x-3">
            <TouchableOpacity 
              onPress={onClose} 
              className="flex-1 py-4 bg-slate-100 rounded-2xl active:opacity-70"
            >
              <Text className="text-center font-bold text-slate-600">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              disabled={confirm !== 'DELETE'} 
              className={`flex-1 py-4 rounded-2xl ${confirm === 'DELETE' ? 'bg-red-500' : 'bg-red-200'}`}
            >
              <Text className="text-center font-bold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteModal; // Ensure default export is here