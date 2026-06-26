import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { auth, db } from '@/app/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { router } from 'expo-router';

export default function CompleteProfile() {
  const [cnic, setCnic] = useState('');
  const [address, setAddress] = useState('');
  const [emergency, setEmergency] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!cnic.trim() || !address.trim() || !emergency.trim()) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'You must be logged in to update your profile.');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', uid), {
        cnic: cnic.trim(),
        address: address.trim(),
        emergency: emergency.trim(),
      });
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/rescuer/dashboard') }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A4BCC' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 10, textAlign: 'center' }}>
              Complete Your Profile
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 20, textAlign: 'center' }}>
              We need a few more details before you can access the Rescuer Dashboard.
            </Text>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 5 }}>CNIC Number</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 16, color: '#1E293B' }}
                placeholder="e.g. 42101-1234567-1"
                placeholderTextColor="#94A3B8"
                value={cnic}
                onChangeText={setCnic}
                keyboardType="numeric"
              />
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 5 }}>Home Address</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 16, color: '#1E293B', height: 80 }}
                placeholder="Enter your full address"
                placeholderTextColor="#94A3B8"
                value={address}
                onChangeText={setAddress}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 5 }}>Emergency Contact (Phone)</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 12, fontSize: 16, color: '#1E293B' }}
                placeholder="e.g. 03001234567"
                placeholderTextColor="#94A3B8"
                value={emergency}
                onChangeText={setEmergency}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={loading}
              style={{ backgroundColor: '#2563EB', padding: 15, borderRadius: 8, alignItems: 'center' }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Save & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
