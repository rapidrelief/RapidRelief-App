import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screenName: string) => void;
  currentScreen: string;
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

const Sidebar = ({ isOpen, onClose, onNavigate, currentScreen }: SidebarProps) => {
  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from Rapid Relief?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            onClose();
            router.replace("/");
          },
        },
      ]
    );
  };

  const menuItems = [
    { name: 'Dashboard', icon: 'grid', path: '/drawer/dashboard' },
    { name: 'Map', icon: 'map', path: '/drawer/LiveMap' },
    { name: 'Alerts', icon: 'alert-triangle', path: '/drawer/AlertPath' },
    { name: 'SOS', icon: 'rss', path: '/drawer/sospath' },
    { name: 'Settings', icon: 'settings', path: '/drawer/settingPath' },
  ];

  return (
    <View
      className="absolute inset-0 z-[100] flex-row"
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="absolute inset-0 bg-black/40"
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          width: SIDEBAR_WIDTH,
        }}
        className="bg-white h-full pt-12 shadow-2xl"
      >
        <View className="flex-row items-center justify-between px-6 mb-8">
          <Text className="text-xl font-bold text-gray-800">Menu</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <ScrollView className="px-4">
          {menuItems.map((item, index) => {
            const isActive = currentScreen === item.name;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  onNavigate(item.name);
                  onClose();
                  router.push(item.path as any);
                }}
                className={`flex-row items-center p-4 rounded-xl mb-2 ${
                  isActive ? 'bg-blue-50' : ''
                }`}
              >
                <Feather
                  name={item.icon as any}
                  size={20}
                  color={isActive ? '#2563EB' : '#6B7280'}
                />
                <Text
                  className={`ml-4 text-base ${
                    isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center p-6 border-t border-gray-100 mb-5"
        >
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text className="ml-4 text-red-500 font-semibold">Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Sidebar;
