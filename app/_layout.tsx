import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

export default function Layout() {
  return (
    <SafeAreaProvider>
      {/* translucent={true} is the secret to no white space at the top */}
      <StatusBar style="light" translucent={true} />
      <Slot />
    </SafeAreaProvider>
  );
}