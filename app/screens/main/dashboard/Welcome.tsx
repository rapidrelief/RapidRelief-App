import React, { memo, useState, useEffect } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WelcomeProps {
  userName?: string;
}

const FIRST_TIME_GREETINGS = [
  "Welcome {name}! Your safety is our priority.",
  "Hello {name}! Let's get you set up to stay safe.",
  "Welcome aboard, {name}! Ready to stay informed?"
];

const RETURNING_GREETINGS = [
  "Welcome back, {name}! Stay safe out there.",
  "Great to see you again, {name}!",
  "Hello {name}, here is your latest safety update.",
  "Stay alert and safe today, {name}!",
  "Good to have you back, {name}!"
];

const Welcome = ({ userName = "" }: WelcomeProps) => {
  const [fullText, setFullText] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [showSubtext, setShowSubtext] = useState(false);

  useEffect(() => {
    const initGreeting = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("@has_launched_welcome");
        const nameToUse = userName || "there";
        let targetText = "";

        if (!hasLaunched) {
          // First time
          const rand = FIRST_TIME_GREETINGS[Math.floor(Math.random() * FIRST_TIME_GREETINGS.length)];
          targetText = rand.replace("{name}", nameToUse);
          await AsyncStorage.setItem("@has_launched_welcome", "true");
        } else {
          // Returning
          const rand = RETURNING_GREETINGS[Math.floor(Math.random() * RETURNING_GREETINGS.length)];
          targetText = rand.replace("{name}", nameToUse);
        }

        setFullText(targetText);
      } catch (err) {
        setFullText(`Welcome Back, ${userName || "there"}!`);
      }
    };
    initGreeting();
  }, [userName]);

  // Typing animation effect
  useEffect(() => {
    if (!fullText) return;

    let currentIndex = 0;
    setDisplayedText(""); 
    setShowSubtext(false);
    
    const interval = setInterval(() => {
      currentIndex++;
      setDisplayedText(fullText.slice(0, currentIndex));
      
      // When typing is done
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
        setTimeout(() => setShowSubtext(true), 300); // Small delay before subtext appears
      }
    }, 35); // Fast but readable typing speed

    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <View className="mb-8 mt-2 px-1">
      <Text
        className="text-[32px] md:text-4xl font-black text-slate-800 tracking-tighter leading-[38px]"
        numberOfLines={2}
        adjustsFontSizeToFit 
      >
        {displayedText}
      </Text>
      
      {/* Animated Premium Subtext */}
      {showSubtext && (
        <View className="flex-row items-center mt-3 bg-blue-50/50 self-start px-3 py-1.5 rounded-full border border-blue-100/50">
          <View className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-sm shadow-blue-300" />
          <Text className="text-[11px] text-blue-700 font-black uppercase tracking-widest">
            Stay safe and informed
          </Text>
        </View>
      )}
    </View>
  );
};

export default memo(Welcome);
