import React, { useEffect, useRef } from "react";
import { Animated, Easing, useWindowDimensions, View } from "react-native";

const Boat = require("./boat1.png");

const HeroImage = () => {
  const { width: screenWidth } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;

   useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 4500,
        easing: Easing.inOut(Easing.sin), // smooth natural motion
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Smooth vertical floating
  const translateY = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -18, 4, -12, 0], 
  });

  // Smooth rotation (tilt like water)
  const rotate = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["-6deg", "5deg", "-4deg", "3deg", "-6deg"],
  });

  const translateX = progress.interpolate({
  inputRange: [0, 0.5, 1],
  outputRange: [0, 6, 0],
});


  return (
     <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10, // spacing instead of flex:1
      }}
    >
      <Animated.Image
        source={Boat}
        style={{
          width: screenWidth * 0.5,
          height: (screenWidth * 0.5) * 0.6,
          transform: [{ translateY }, { translateX }, { rotate }],
        }}
        resizeMode="contain"
      />
    </View>
  );
};

export default HeroImage;