import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const ManageContacts = () => {
  const router = useRouter();
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');

  // PROFESSIONAL NAVIGATION LOGIC
  const handleGoBack = () => {
    // If you are using a Drawer or a deep path, use the exact string path here
    // example: '/(drawer)/settings' or '/settings'
    router.replace('/drawer/settingPath'); 
  };

  const handleSave = () => {
    // 1. Add your logic here to save to AsyncStorage or Backend
    console.log("Saving:", { primary, secondary });

    // 2. Show a quick confirmation
    Alert.alert(
      "Success", 
      "Contacts updated successfully!",
      [{ text: "OK", onPress: () => handleGoBack() }]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-white"
    >
      {/* Static Header */}
      <View className="flex-row items-center px-5 pt-14 pb-4 border-b border-gray-100 bg-white">
        <TouchableOpacity 
          onPress={handleGoBack} 
          className="p-2 mr-3 bg-gray-50 rounded-full active:bg-gray-200"
        >
          <Feather name="arrow-left" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Edit Contacts</Text>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-10"> 
            {/* Illustration/Icon Area */}
            <View className="items-center mb-8">
              <View className="bg-blue-50 p-4 rounded-full mb-4">
                <Feather name="users" size={32} color="#2563eb" />
              </View>
              <Text className="text-lg font-bold text-slate-800">Emergency Contacts</Text>
              <Text className="text-gray-500 text-center mt-1 px-4">
                Update the numbers of people you want notified during an emergency.
              </Text>
            </View>

            <View className="space-y-5">
              <View>
                <Text className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest ml-1">Primary Contact</Text>
                <TextInput 
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 focus:border-blue-500"
                  placeholder="+92 300 1234567"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={primary}
                  onChangeText={setPrimary}
                />
              </View>

              <View className="mt-4">
                <Text className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest ml-1">Secondary Contact</Text>
                <TextInput 
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-800 focus:border-blue-500"
                  placeholder="+92 321 7654321"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={secondary}
                  onChangeText={setSecondary}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity 
              onPress={handleSave}
              activeOpacity={0.7}
              className="bg-blue-600 py-4 rounded-2xl items-center mt-12 shadow-xl shadow-blue-200"
            >
              <Text className="text-white font-semibold text-lg">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ManageContacts;