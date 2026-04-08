import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, useWindowDimensions, Alert } from 'react-native';
import { auth, db } from '@/app/config/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { useRouter } from 'expo-router';

const DeleteModal = ({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) => {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const [confirm, setConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const ms = (size: number) => size + (((width / 375) * size) - size) * 0.5;

  const handleDelete = async () => {
    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "No logged in user found");
        return;
      }

      const credential = EmailAuthProvider.credential(email.trim(), password);

      await reauthenticateWithCredential(user, credential);

      await deleteDoc(doc(db, "user", user.uid));

      await deleteUser(user);

      Alert.alert("Success", "Your account has been deleted");

      onClose();
      router.replace('/screens/Home');
    } catch (error: any) {
      console.log(error);

      if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Wrong password");
      } else if (error.code === "auth/invalid-credential") {
        Alert.alert("Error", "Invalid email or password");
      } else {
        Alert.alert("Error", "Could not delete account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center px-8">
        <View className="bg-white rounded-[32px] p-8 shadow-2xl">
          <Text style={{ fontSize: ms(20) }} className="font-black text-center text-slate-900">
            Delete Account?
          </Text>

          <Text style={{ fontSize: ms(12) }} className="text-slate-500 text-center mt-2 mb-6">
            This action is permanent. Enter your email, password and type DELETE.
          </Text>

          <TextInput
            className="bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-200"
            placeholder="Email"
            placeholderTextColor="#c0c7d1ec"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            className="bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-200"
            placeholder="Password"
            placeholderTextColor="#c0c7d1ec"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput 
            className="bg-red-50 p-4 rounded-2xl text-center mb-6 font-bold text-red-600 border border-red-100" 
            placeholder="Type: DELETE"
            placeholderTextColor="#f0767690" 
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
              onPress={handleDelete}
              disabled={
                confirm !== 'DELETE' ||
                !email.trim() ||
                !password.trim() ||
                loading
              }
              className={`flex-1 py-4 rounded-2xl ${
                confirm === 'DELETE' && email.trim() && password.trim()
                  ? 'bg-red-500'
                  : 'bg-red-200'
              }`}
            >
              <Text className="text-center font-bold text-white">
                {loading ? 'Deleting...' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteModal;