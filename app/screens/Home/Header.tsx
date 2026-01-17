import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, useWindowDimensions, View } from 'react-native';

const Header = () => {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  
  // 1. Initialize animation values
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
    <LinearGradient
      colors={['#33B3FF', '#33B3FF']}
      style={{ 
        flex: 1, // Uses the height provided by the parent (30% of screen)
        width: '100%', 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingTop: screenHeight * 0.02 // Reduced padding to keep it centered
      }}
    >
      <Animated.View 
        style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
          width: '100%'
        }}
      >
        {/* Title: Responsive size based on width */}
        <Text style={{ 
          color: 'white', 
          fontSize: screenWidth * 0.1, 
          fontWeight: 'bold' 
        }}>
          RAPID
        </Text>
        
        {/* Subtitle: Responsive size based on width */}
        <Text style={{ 
          color: 'white', 
          fontSize: screenWidth * 0.06, 
          fontWeight: '300',
          marginTop: screenHeight * 0.005, // Responsive margin
          letterSpacing: 4
        }}>
          RELIEF
        </Text>

        {/* Responsive accent line */}
        <View style={{ 
          marginTop: screenHeight * 0.02, 
          width: screenWidth * 0.25, 
          height: 4, 
          backgroundColor: 'white', 
          borderRadius: 2 
        }} />
      </Animated.View>
    </LinearGradient>
  );
};

export default Header;