import React, { useEffect, useRef } from 'react';
import { Animated, Text, useWindowDimensions, View } from 'react-native';

const Header = () => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ width: '100%', alignItems: 'center', paddingTop: screenHeight * 0.05 }}>
      <Animated.View 
        style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Text style={{ 
          color: 'white', 
          fontSize: screenWidth * 0.12, 
          fontWeight: '900',
          letterSpacing: 2
        }}>
          RAPID
        </Text>
        
        <Text style={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontSize: screenWidth * 0.05, 
          fontWeight: '400',
          marginTop: -5,
          letterSpacing: 6
        }}>
          RELIEF
        </Text>

        <View style={{ 
          marginTop: 15, 
          width: 40, 
          height: 4, 
          backgroundColor: '#38bdf8', 
          borderRadius: 2,
          shadowColor: '#38bdf8',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5
        }} />
      </Animated.View>
    </View>
  );
};

export default Header;