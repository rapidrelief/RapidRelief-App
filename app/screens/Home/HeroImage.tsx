import React, { useEffect, useRef } from "react";
import { Animated, Easing, useWindowDimensions, View } from "react-native";

const Boat = require("./boat1.png");

const HeroImage = () => {
  const { width: screenWidth } = useWindowDimensions();
  const moveY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(moveY, { toValue: -10, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(moveY, { toValue: 10, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(rotate, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(rotate, { toValue: -1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const boatRotation = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-4deg", "4deg"],
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A4BCC' }}>
      <Animated.Image
        source={Boat}
        style={{
          // Responsive sizing to match your screenshot
          width: screenWidth * 0.5, 
          height: (screenWidth * 0.5) * 0.6, 
          // NO position: absolute here. Flexbox will handle the placement.
          transform: [{ translateY: moveY }, { rotate: boatRotation }],
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export default HeroImage;