import React, { useEffect, useRef } from "react";
import { Text, View, Animated, useWindowDimensions } from "react-native";

interface WelcomeTextProps {
  title?: string;
  subtitle?: string;
}

const WelcomeText: React.FC<WelcomeTextProps> = ({
  title = "Welcome Aboard",
  subtitle = "Get started with your journey",
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // 1. Setup Animated Values
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSub = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 2. Trigger Staggered Animation
    Animated.stagger(300, [
      Animated.timing(fadeTitle, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeSub, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Slide-up effect helper
  const slideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [15, 0],
        }),
      },
    ],
  });

  return (
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: "#1A4BCC", 
        alignItems: "center", 
        justifyContent: "center",
        paddingHorizontal: screenWidth * 0.05 
      }}
    >
      {/* 3. Animated Text for Title - Responsive Font Size */}
      <Animated.Text 
        style={[
          slideUp(fadeTitle),
          { 
            color: 'white', 
            fontSize: screenWidth * 0.09, // ~36px on standard phones
            fontWeight: '300',
            textAlign: 'center'
          }
        ]}
      >
        {title}
      </Animated.Text>

      {/* 4. Animated Text for Subtitle - Responsive Font Size */}
      <Animated.Text 
        style={[
          slideUp(fadeSub),
          { 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: screenWidth * 0.04, // ~16px on standard phones
            fontWeight: '300',
            marginTop: screenHeight * 0.01,
            textAlign: 'center'
          }
        ]}
      >
        {subtitle}
      </Animated.Text>
    </View>
  );
};

export default WelcomeText;