import React from "react";
import { StatusBar, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SignUpF from "./SignUpF";

const SignUpScreen = () => {
  const { width } = useWindowDimensions();

  return (
    // We use a View as the base to ensure the blue background 
    // covers the entire screen, including the very bottom.
    <View style={{ flex: 1, backgroundColor: '#1A4BCC' }}>
      <StatusBar 
        barStyle="light-content" 
        translucent 
        backgroundColor="transparent" 
      />
      
      {/* We only apply 'top' edge to the SafeAreaView. 
        This protects the Notch/Status bar area but lets 
        the ScrollView inside SignUpF handle the bottom spacing.
      */}
      <SafeAreaView 
        style={{ flex: 1 }} 
        edges={['top']}
      >
        <View style={{ flex: 1 }}>
          <SignUpF />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SignUpScreen;