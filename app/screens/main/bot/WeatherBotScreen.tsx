import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet, ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, Animated, Keyboard, Linking } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type EmergencyAction = {
  label: string;
  number: string;
};

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isEmergency?: boolean;
  emergencyActions?: EmergencyAction[];
};

const WELCOME_MESSAGES = [
  "Hello! How can I help you today?",
  "Hello there, what do you want to know today?",
  "Welcome back! Ready for a weather update?",
  "Hi! Drop a pin or ask me about the forecast.",
  "AI Weather initialized. What's on your mind?"
];

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 250, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.delay(500 - delay) // Total cycle: 1000ms
        ])
      ).start();
    };
    
    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 24, paddingHorizontal: 8 }}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

export default function WeatherBotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lon: number} | null>(null);
  const [tempLocation, setTempLocation] = useState<{lat: number, lon: number}>({ lat: 52.52, lon: 13.41 });
  const [locationLabel, setLocationLabel] = useState("Your Location");
  
  const [isTyping, setIsTyping] = useState(false);
  
  const [welcomeText, setWelcomeText] = useState("");
  const [displayedWelcome, setDisplayedWelcome] = useState("");
  
  const scrollViewRef = useRef<ScrollView>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const glowAnim = useRef(new Animated.Value(0)).current;
  const pillFloatAnim = useRef(new Animated.Value(0)).current;

  const pickRandomWelcome = () => {
    const randomMsg = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    setWelcomeText(randomMsg);
    setDisplayedWelcome("");
  };

  // Setup location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getLastKnownPositionAsync({});
        if (location) {
          setSelectedLocation({ lat: location.coords.latitude, lon: location.coords.longitude });
          setTempLocation({ lat: location.coords.latitude, lon: location.coords.longitude });
        }
      }
    })();
    pickRandomWelcome();
    
    // Start Glow Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false })
      ])
    ).start();

    // Start Pill Float Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pillFloatAnim, { toValue: -4, duration: 1200, useNativeDriver: true }),
        Animated.timing(pillFloatAnim, { toValue: 0, duration: 1200, useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Typewriter effect for welcome text
  useEffect(() => {
    if (messages.length === 0 && welcomeText) {
      let i = 0;
      setDisplayedWelcome("");
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      
      typeTimerRef.current = setInterval(() => {
        setDisplayedWelcome(welcomeText.substring(0, i + 1));
        i++;
        if (i >= welcomeText.length) {
          if (typeTimerRef.current) clearInterval(typeTimerRef.current);
        }
      }, 40); // typing speed
    }
    return () => {
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    };
  }, [welcomeText, messages.length]);

  // Auto-clear logic on screen blur
  useFocusEffect(
    useCallback(() => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }

      return () => {
        clearTimerRef.current = setTimeout(() => {
          setMessages([]);
          pickRandomWelcome();
        }, 15000);
      };
    }, [])
  );

  const handleSend = async (forcedText?: string, overrideLoc?: {lat: number, lon: number}, overrideLabel?: string) => {
    const textToSend = forcedText || inputText;
    if (!textToSend.trim()) return;
    
    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMsg, isUser: true }]);
    if (!forcedText) setInputText("");
    setIsTyping(true);
    Keyboard.dismiss();

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(async () => {
      const lowerMsg = userMsg.toLowerCase();
      
      const recentBotMsg = messages.length > 0 && !messages[messages.length - 1].isUser ? messages[messages.length - 1].text : "";
      const isContextEmergency = recentBotMsg.includes('EMERGENCY');

      const isGreeting = ['hi', 'hello', 'hey', 'sup', 'morning', 'evening', 'yo', 'what\'s up'].includes(lowerMsg) || lowerMsg.startsWith('hi ') || lowerMsg.startsWith('hello ');
      const isTravelQuery = ['travel', 'go out', 'safe', 'outside', 'trip', 'going out'].some(k => lowerMsg.includes(k));
      const isRainQuery = ['rain', 'raining', 'shower', 'wet', 'pour'].some(k => lowerMsg.includes(k));
      const isFloodQuery = ['flood', 'flooding', 'disaster'].some(k => lowerMsg.includes(k));
      const isYesterday = lowerMsg.includes('yesterday');
      const currentYearStr = new Date().getFullYear().toString();
      const yearMatchForQuery = lowerMsg.match(/20\d\d|19\d\d/);
      const isPastQuery = (yearMatchForQuery && yearMatchForQuery[0] < currentYearStr) || /past|history|did|was|last year|previously/.test(lowerMsg) || isYesterday;
      const isTomorrow = lowerMsg.includes('tomorrow');
      const isToday = lowerMsg.includes('today') || lowerMsg.includes('right now') || lowerMsg.includes('current') || lowerMsg.includes('now');
      const isHotQuery = ['hot', 'heat', 'warm', 'heatwave', 'sun', 'sunny', 'sweat', 'boil'].some(k => lowerMsg.includes(k));
      const isColdQuery = ['cold', 'freeze', 'snow', 'winter', 'chill', 'cool', 'ice'].some(k => lowerMsg.includes(k));
      
      const isNewTopic = ['weather', 'forecast', 'predict', 'temperature', 'degree', 'climate'].some(k => lowerMsg.includes(k)) || isPastQuery || isGreeting;
      const isHelpQuery = ['help', 'trapped', 'stuck', 'emergency', 'save me', 'dying', 'danger', 'sos', 'fire'].some(k => lowerMsg.includes(k)) || (isContextEmergency && !['safe', 'okay', 'thanks', 'thank you', 'no'].some(k => lowerMsg.includes(k)) && !isNewTopic);
      
      const isFollowUp = ['why', 'how', 'when', 'what', 'really', 'are you sure'].some(k => lowerMsg === k || lowerMsg === k + "?");
      const isLocationQuery = ['where am i', 'my location', 'what is my location', 'where are we'].some(k => lowerMsg.includes(k));
      
      const hasWeatherKeywords = ['weather', 'forecast', 'predict', 'temperature', 'storm', 'degree', 'climate', 'location', 'week'].some(k => lowerMsg.includes(k)) || /\bhere\b/.test(lowerMsg) || isTravelQuery || isRainQuery || isFloodQuery || isPastQuery || isTomorrow || isToday || isHotQuery || isColdQuery || isHelpQuery || isFollowUp || isLocationQuery;

      if (isGreeting && !hasWeatherKeywords) {
         setMessages(prev => [...prev, { id: Date.now().toString(), text: "Hello! 👋 I'm your AI Weather Assistant. Ask me about the forecast, rain chances, or if it's safe to travel!", isUser: false }]);
         setIsTyping(false);
         setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
         return;
      } else if (!hasWeatherKeywords) {
         setMessages(prev => [...prev, { id: Date.now().toString(), text: "I'm a specialized AI. I can only help you with weather, rain, and flood predictions. Try asking me about the forecast!", isUser: false }]);
         setIsTyping(false);
         setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
         return;
      } else if (isFollowUp) {
         setMessages(prev => [...prev, { id: Date.now().toString(), text: "I rely on real-time meteorological models, atmospheric pressure data, and historical climate trends to make my predictions! 🌍 The current atmospheric conditions don't indicate significant precipitation.", isUser: false }]);
         setIsTyping(false);
         setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
         return;
      } else if (isLocationQuery) {
         setMessages(prev => [...prev, { id: Date.now().toString(), text: `You are currently viewing the weather for **${locationLabel}**. 📍 If you want to change it, just tap the location chip or ask me for the weather somewhere else!`, isUser: false }]);
         setIsTyping(false);
         setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
         return;
      } else {
        let lat = overrideLoc ? overrideLoc.lat : (selectedLocation ? selectedLocation.lat : 52.52);
        let lon = overrideLoc ? overrideLoc.lon : (selectedLocation ? selectedLocation.lon : 13.41);
        let targetLocName = overrideLabel ? overrideLabel : locationLabel;
        
        // Smart Dynamic location extraction (e.g., "in Lahore")
        // Added \b (word boundary) so "at" doesn't match inside "what"
        const locationMatch = userMsg.match(/\b(?:in|at|for)\s+([a-zA-Z]+)\b/i);
        if (locationMatch && locationMatch[1]) {
           const extractedLoc = locationMatch[1].trim();
           const stopWords = ['the', 'this', 'that', 'a', 'my', 'your', 'is', 'will', 'was', 'are', 'am', 'it', 'to', 'of', 'on', 'and', 'or', 'tomorrow', 'today', 'yesterday', 'now', 'right', 'here', 'week'];
           if (!stopWords.includes(extractedLoc.toLowerCase())) {
             try {
                 const geo = await Location.geocodeAsync(extractedLoc);
                 if (geo && geo.length > 0) {
                     lat = geo[0].latitude;
                     lon = geo[0].longitude;
                     targetLocName = extractedLoc.charAt(0).toUpperCase() + extractedLoc.slice(1);
                 }
             } catch (e) {
                 console.log("Geocode failed", e);
             }
           }
        }
        
        try {
          let replyText = "";
          let isEmergencyResp = false;
          let emActions: EmergencyAction[] = [];

          if (isHelpQuery) {
            isEmergencyResp = true;
            let emergencyCountry = "Unknown";
            try {
              let geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
              if (geo && geo.length > 0) emergencyCountry = geo[0].country || "Unknown";
            } catch(e) {}
            
            let numbers = "112 or 911";
            const c = emergencyCountry.toLowerCase();
            if (c.includes('pakistan')) {
               numbers = "Police: 15, Ambulance: 115, Fire: 16";
               emActions = [{label: 'Police', number: '15'}, {label: 'Ambulance', number: '115'}, {label: 'Fire', number: '16'}];
            } else if (c.includes('india')) {
               numbers = "Emergency: 112, Police: 100, Ambulance: 102";
               emActions = [{label: 'Emergency', number: '112'}, {label: 'Police', number: '100'}, {label: 'Ambulance', number: '102'}];
            } else if (c.includes('united states') || c.includes('usa') || c.includes('america')) {
               numbers = "Emergency: 911";
               emActions = [{label: 'Emergency', number: '911'}];
            } else if (c.includes('united kingdom') || c.includes('uk')) {
               numbers = "Emergency: 999 or 112";
               emActions = [{label: 'Emergency', number: '999'}, {label: 'Alternative', number: '112'}];
            } else if (c.includes('australia')) {
               numbers = "Emergency: 000";
               emActions = [{label: 'Emergency', number: '000'}];
            } else if (c.includes('canada')) {
               numbers = "Emergency: 911";
               emActions = [{label: 'Emergency', number: '911'}];
            } else {
               numbers = "Emergency: 112 or 911";
               emActions = [{label: 'Global SOS', number: '112'}];
            }

            let emergencyType = "general";
            if (lowerMsg.includes('fire') || lowerMsg.includes('burn')) emergencyType = "fire";
            else if (lowerMsg.includes('flood') || lowerMsg.includes('water') || lowerMsg.includes('drown')) emergencyType = "flood";
            else if (lowerMsg.includes('snow') || lowerMsg.includes('blizzard') || lowerMsg.includes('freeze')) emergencyType = "snow";
            else if (lowerMsg.includes('storm') || lowerMsg.includes('tornado') || lowerMsg.includes('hurricane') || lowerMsg.includes('wind')) emergencyType = "storm";
            else if (lowerMsg.includes('earthquake') || lowerMsg.includes('shake')) emergencyType = "earthquake";

            let advice = "Please stay calm and ensure you are in a safe location until help arrives.";
            if (emergencyType === "fire") {
               advice = "🔥 **FIRE EMERGENCY:** Immediately evacuate! Stay low to the ground to avoid inhaling smoke, cover your mouth with a damp cloth if possible, and contact the Fire Department immediately. Do NOT use elevators!";
            } else if (emergencyType === "flood") {
               advice = "🌊 **FLOOD EMERGENCY:** Move immediately to higher ground! Avoid walking or driving through floodwaters. Stay away from power lines and electrical wires.";
            } else if (emergencyType === "snow") {
               advice = "❄️ **SNOW STORM / BLIZZARD:** Stay indoors and keep warm. If you are trapped outside, seek shelter immediately, stay dry, and cover all exposed body parts to prevent frostbite.";
            } else if (emergencyType === "storm") {
               advice = "🌪️ **SEVERE STORM:** Seek shelter indoors immediately! Stay away from windows, doors, and outside walls. If there is lightning, avoid plumbing and electrical equipment.";
            } else if (emergencyType === "earthquake") {
               advice = "💥 **EARTHQUAKE:** Drop, Cover, and Hold On! If you are indoors, stay there and get under a sturdy desk or table. If outside, move away from buildings, streetlights, and utility wires.";
            }

            replyText = `🚨 **EMERGENCY!** 🚨\nIf you are in immediate danger, go to the **Dashboard** and press the **SOS button** to alert nearby rescuers.\n\n${advice}\n\nLocal emergency numbers${emergencyCountry !== 'Unknown' ? ` in ${emergencyCountry}` : ''}:\n📞 **${numbers}**`;
          } else if (isPastQuery) {
            // Fetch Historical Data
            const yearMatch = userMsg.match(/20\d\d|19\d\d/);
            const targetYear = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
            
            const pastDateMatch = lowerMsg.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\s+(\d{1,2})(?:st|nd|rd|th)?/);
            const isYesterdayMatch = lowerMsg.includes('yesterday');
            
            let startDate = "";
            let endDate = "";
            let specificDateStr = "";
            
            if (pastDateMatch) {
               const day = parseInt(pastDateMatch[1] || pastDateMatch[4], 10);
               const month = (pastDateMatch[2] || pastDateMatch[3]).toLowerCase();
               const monthMap: Record<string, string> = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
               const monthNum = monthMap[month.substring(0,3)];
               const dayNum = day < 10 ? `0${day}` : `${day}`;
               startDate = `${targetYear}-${monthNum}-${dayNum}`;
               endDate = `${targetYear}-${monthNum}-${dayNum}`;
               const properMonth = month.charAt(0).toUpperCase() + month.slice(1);
               specificDateStr = ` on ${day} ${properMonth}`;
            } else if (isYesterdayMatch) {
               const yesterday = new Date(Date.now() - 86400000);
               const yYear = yesterday.getFullYear();
               const yMonth = yesterday.getMonth() + 1;
               const yDay = yesterday.getDate();
               startDate = `${yYear}-${yMonth < 10 ? `0${yMonth}` : yMonth}-${yDay < 10 ? `0${yDay}` : yDay}`;
               endDate = startDate;
               specificDateStr = ` yesterday`;
            } else {
               const today = new Date();
               const tYear = today.getFullYear();
               const tMonth = today.getMonth() + 1;
               const tDay = today.getDate();
               endDate = `${tYear}-${tMonth < 10 ? `0${tMonth}` : tMonth}-${tDay < 10 ? `0${tDay}` : tDay}`;
               
               if (targetYear === tYear.toString()) {
                 startDate = `${targetYear}-01-01`;
               } else {
                 startDate = `${targetYear}-01-01`;
                 endDate = `${targetYear}-12-31`;
               }
            }
            
            const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=precipitation_sum,temperature_2m_max&timezone=auto`);
            const data = await response.json();
            
            if (data.daily && data.daily.precipitation_sum) {
                 if (specificDateStr) {
                     const temp = data.daily.temperature_2m_max[0] || 25;
                     const precip = data.daily.precipitation_sum[0] || 0;
                     replyText = `Based on historical data for **${targetLocName}**${specificDateStr} ${targetYear}, the high was ${Math.round(temp)}°C. `;
                     if (precip > 5) replyText += `There was about ${Math.round(precip)}mm of rainfall. 🌧️`;
                     else replyText += `It was a relatively dry day with no significant rain. 🌤️`;
                 } else {
                     const validPrecip = data.daily.precipitation_sum.filter((x: any) => x !== null);
                     const maxPrecip = validPrecip.length > 0 ? Math.max(...validPrecip) : 0;
                     
                     if (maxPrecip > 50) {
                         replyText = `Yes! Looking at my historical data archives for **${targetLocName}** in ${targetYear}, there was significant rainfall. The highest single-day rainfall was ${Math.round(maxPrecip)}mm, which very likely caused flooding! 🌊`;
                     } else {
                         replyText = `Based on the historical data for **${targetLocName}** in ${targetYear}, there were no extreme rain events. The highest single-day rainfall was only ${Math.round(maxPrecip)}mm, so major flooding was unlikely. 😌`;
                     }
                 }
            } else {
                 replyText = `I couldn't retrieve historical data for ${targetLocName}${specificDateStr} in ${targetYear}.`;
            }
          } else {
            // Fetch Future Data
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&past_days=3&timezone=auto`);
            const data = await response.json();
            
            if (data.daily) {
               const futurePrecip = data.daily.precipitation_sum.slice(3, 10); // index 0 is today
               const futureTemps = data.daily.temperature_2m_max.slice(3, 10);
               const futureMins = data.daily.temperature_2m_min ? data.daily.temperature_2m_min.slice(3, 10) : futureTemps;
               const maxPrecip = Math.max(...futurePrecip);
               const totalPrecip = futurePrecip.reduce((a: number, b: number) => a + (b || 0), 0);
               
               let risk = "Low";
               if (totalPrecip > 100 || maxPrecip > 50) risk = "High";
               else if (totalPrecip > 40 || maxPrecip > 20) risk = "Moderate";
               
               let targetTemp = futureTemps[0] || 25;
               let targetMin = futureMins[0] || 15;
               let targetPrecip = futurePrecip[0] || 0;
               let timeContext = "Today";
               let timeContextMid = "today";

               if (isTomorrow) {
                   targetTemp = futureTemps[1] || 25;
                   targetMin = futureMins[1] || 15;
                   targetPrecip = futurePrecip[1] || 0;
                   timeContext = "Tomorrow";
                   timeContextMid = "tomorrow";
               }
               
               // Smart Date Detection (e.g. "7 july")
               const dateMatch = lowerMsg.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\s+(\d{1,2})(?:st|nd|rd|th)?/);
               const dayOfWeekMatch = lowerMsg.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
               
               if (dateMatch) {
                   const day = parseInt(dateMatch[1] || dateMatch[4], 10);
                   const month = (dateMatch[2] || dateMatch[3]).toLowerCase();
                   const currentYear = new Date().getFullYear();
                   
                   const monthMap: Record<string, number> = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
                   const monthIdx = monthMap[month.substring(0,3)];
                   const targetDate = new Date(currentYear, monthIdx, day);
                   
                   if (!isNaN(targetDate.getTime())) {
                       const today = new Date();
                       today.setHours(0,0,0,0);
                       targetDate.setHours(0,0,0,0);
                       
                       const diffTime = targetDate.getTime() - today.getTime();
                       const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                       
                       if (diffDays >= 0 && diffDays <= 6) {
                           targetTemp = futureTemps[diffDays] || futureTemps[0];
                           targetMin = futureMins[diffDays] || futureMins[0];
                           targetPrecip = futurePrecip[diffDays] || futurePrecip[0];
                           const properMonth = month.charAt(0).toUpperCase() + month.slice(1);
                           timeContext = `On ${day} ${properMonth}`;
                           timeContextMid = `on ${day} ${properMonth}`;
                       } else if (diffDays > 6) {
                           const properMonth = month.charAt(0).toUpperCase() + month.slice(1);
                           timeContext = `historicalEstimation`;
                           timeContextMid = `on ${day} ${properMonth}`;
                       } else if (diffDays < 0) {
                           const properMonth = month.charAt(0).toUpperCase() + month.slice(1);
                           timeContext = `pastEstimation`;
                           timeContextMid = `on ${day} ${properMonth}`;
                       }
                   }
               } else if (dayOfWeekMatch && !isToday && !isTomorrow) {
                   const targetDay = dayOfWeekMatch[1];
                   const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                   const today = new Date();
                   const todayIdx = today.getDay();
                   const targetIdx = days.indexOf(targetDay);
                   let diffDays = targetIdx - todayIdx;
                   if (diffDays <= 0) diffDays += 7;
                   
                   if (diffDays >= 0 && diffDays <= 6) {
                       targetTemp = futureTemps[diffDays] || futureTemps[0];
                       targetMin = futureMins[diffDays] || futureMins[0];
                       targetPrecip = futurePrecip[diffDays] || futurePrecip[0];
                       const properDay = targetDay.charAt(0).toUpperCase() + targetDay.slice(1);
                       timeContext = `On ${properDay}`;
                       timeContextMid = `on ${properDay}`;
                   }
               } else if (lowerMsg.includes('week')) {
                   targetTemp = Math.max(...futureTemps);
                   targetMin = Math.min(...futureMins);
                   targetPrecip = totalPrecip;
                   timeContext = "This week";
                   timeContextMid = "this week";
               }
               
               if (isTravelQuery) {
                 if (risk === "High") {
                   replyText = `It is **not safe** to travel right now in ${targetLocName}. I'm seeing a high flood risk with ${Math.round(totalPrecip)}mm of rain expected over the next week. Please stay indoors! 🚨`;
                 } else if (risk === "Moderate") {
                   replyText = `You can go out in ${targetLocName}, but please be careful. There is a moderate flood risk (${Math.round(totalPrecip)}mm rain expected), so definitely avoid low-lying areas! ⚠️`;
                 } else {
                   replyText = `Yes, you're good to go! ☀️ The weather in ${targetLocName} looks clear with a low flood risk. Safe travels!`;
                 }
               } else if (isHotQuery) {
                   if (targetTemp >= 35) {
                       replyText = `Yes, it's going to be extremely hot! 🥵 ${timeContext}'s high in **${targetLocName}** will reach ${Math.round(targetTemp)}°C. Please stay hydrated and avoid direct sunlight!`;
                   } else if (targetTemp >= 28) {
                       replyText = `It will be quite warm ${timeContextMid} in **${targetLocName}** with highs around ${Math.round(targetTemp)}°C. A great day for cold drinks! 🥤`;
                   } else {
                       replyText = `Not really! ${timeContext} in **${targetLocName}** will be relatively mild with a high of ${Math.round(targetTemp)}°C. 😌`;
                   }
               } else if (isColdQuery) {
                   if (targetMin <= 0) {
                       replyText = `Yes, it's freezing! 🥶 ${timeContext}'s low in **${targetLocName}** will drop to ${Math.round(targetMin)}°C. Expect freezing conditions and possibly snow. Bundle up! 🧥`;
                   } else if (targetMin <= 10) {
                       replyText = `It will be quite chilly ${timeContextMid} in **${targetLocName}**, with lows around ${Math.round(targetMin)}°C. Definitely wear a warm jacket! 🧣`;
                   } else {
                       replyText = `It won't be too cold! ${timeContext} in **${targetLocName}** will have a comfortable low of ${Math.round(targetMin)}°C. 😊`;
                   }
               } else if (isRainQuery || isFloodQuery) {
                 if (risk === "High" || risk === "Moderate") {
                   replyText = `There is a **${risk}** risk of flooding in **${targetLocName}**. We are expecting ${Math.round(totalPrecip)}mm of rainfall over the next week. Please stay alert! 🚨`;
                 } else if (totalPrecip > 10) {
                   replyText = `Yes, we are expecting about ${Math.round(totalPrecip)}mm of rainfall over the next 7 days in **${targetLocName}**. Remember an umbrella! ☔`;
                 } else {
                   replyText = `Nope, it doesn't look like much rain! Only ${Math.round(totalPrecip)}mm of precipitation is expected over the next week in **${targetLocName}**. Enjoy the dry weather! 🌤️`;
                 }
               } else if (timeContext === "historicalEstimation") {
                    replyText = `I only have an accurate forecast for the next 7 days. However, based on seasonal averages for **${targetLocName}**, the weather ${timeContextMid} is typically around ${Math.round(Math.max(...futureTemps))}°C. Please check back closer to the date for an exact forecast! 📅`;
                } else if (timeContext === "pastEstimation") {
                    replyText = `My current forecast engine only looks at the next 7 days. For specific past dates like ${timeContextMid}, you would need to run a historical data report! 🕰️`;
                } else if (isTomorrow || isToday || lowerMsg.includes('week') || dateMatch || dayOfWeekMatch) {
                    replyText = `${timeContext} in **${targetLocName}**, the high will be around ${Math.round(targetTemp)}°C. `;
                    if (targetPrecip > 5) replyText += `Expect about ${Math.round(targetPrecip)}mm of rain, so stay dry! ☔`;
                    else replyText += `No significant rain is expected. Enjoy the beautiful weather! 🌤️`;
                } else {
                    replyText = `The current forecast for **${targetLocName}** shows highs around ${Math.round(futureTemps[0])}°C today. Over the next week, we're expecting ${Math.round(totalPrecip)}mm of rain. `;
                    if (risk === "Low") replyText += `The overall flood risk is very low, so everything looks nice and safe! 😊`;
                    else if (risk === "Moderate") replyText += `With a moderate flood risk, I'd suggest keeping an eye on the forecast. ⚠️`;
                    else replyText += `Please stay alert, as the flood risk is high! 🚨`;
               }
            }
          }
          
          setMessages(prev => [...prev, { id: Date.now().toString(), text: replyText, isUser: false, isEmergency: isEmergencyResp, emergencyActions: emActions }]);
        } catch (error) {
           setMessages(prev => [...prev, { id: Date.now().toString(), text: "Sorry, I encountered a network error while fetching data.", isUser: false }]);
        }
      }
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500); 
  };

  const handleMapConfirm = async () => {
    setSelectedLocation(tempLocation);
    setShowMap(false);
    
    let finalLabel = `${tempLocation.lat.toFixed(2)}, ${tempLocation.lon.toFixed(2)}`;
    // Reverse geocode to get name
    try {
      let geocode = await Location.reverseGeocodeAsync({ latitude: tempLocation.lat, longitude: tempLocation.lon });
      if (geocode.length > 0) {
        const g = geocode[0];
        const namePart = g.city || g.subregion || g.region || g.district || g.name || "Unknown Area";
        const countryPart = g.country || "Unknown Country";
        
        if (namePart !== "Unknown Area" || countryPart !== "Unknown Country") {
          finalLabel = countryPart === "Unknown Country" ? namePart : `${namePart}, ${countryPart}`;
        }
      }
    } catch (e) {}
    
    setLocationLabel(finalLabel);
    
    const confirmMsg = `Location changed. What is the forecast here?`;
    handleSend(confirmMsg, tempLocation, finalLabel);
  };

  // Interpolated Glow values
  const glowShadowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0.3)', 'rgba(255, 255, 255, 0.6)']
  });
  const glowElevation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 25]
  });

  return (
    <LinearGradient
      colors={['#0B1120', '#1E1B4B']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        
        {/* Custom Transparent Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <TouchableOpacity onPress={() => setShowDisclaimer(true)} style={{marginLeft: 8}}>
              <Feather name="info" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {messages.length === 0 ? (
              <TouchableOpacity style={styles.headerMapBtn} onPress={() => setShowMap(true)}>
                <Feather name="map" size={16} color="#ffffff" style={{marginRight: 6}} />
                <Text style={styles.headerMapText}>Map</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => { setMessages([]); pickRandomWelcome(); }} 
                style={styles.headerMapBtn}
              >
                <Feather name="trash-2" size={16} color="#ffffff" style={{marginRight: 6}} />
                <Text style={styles.headerMapText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
          style={styles.keyboardView}
        >
          {messages.length === 0 ? (
            // EMPTY STATE: Typewriter & Suggestions
            <View style={[StyleSheet.absoluteFillObject, styles.emptyStateContainer]}>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText} adjustsFontSizeToFit numberOfLines={3}>
                  {displayedWelcome}
                  <Text style={styles.cursor}>|</Text>
                </Text>
              </View>

              <View style={styles.suggestionsContainer}>
                <TouchableOpacity style={styles.suggestionPill} onPress={() => handleSend("What is the weather at my current location?")}>
                  <Feather name="navigation" size={16} color="#ffffff" />
                  <Text style={styles.suggestionText}>Current Location Forecast</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionPill} onPress={() => handleSend("Did a flood happen here in 2023?")}>
                  <Feather name="clock" size={16} color="#ffffff" />
                  <Text style={styles.suggestionText}>Past Flood History</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionPill} onPress={() => handleSend("Is it safe to travel outside right now?")}>
                  <Feather name="briefcase" size={16} color="#ffffff" />
                  <Text style={styles.suggestionText}>Safe to travel?</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // CHAT AREA
            <ScrollView 
              ref={scrollViewRef}
              style={StyleSheet.absoluteFillObject}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => (
                <View key={msg.id} style={[styles.messageBubble, msg.isUser ? styles.userBubble : styles.botBubble]}>
                  {!msg.isUser && (
                    <View style={styles.botAvatar}>
                      <LinearGradient colors={['#ffffff', '#e2e8f0']} style={styles.botAvatarGradient}>
                        <Feather name="cpu" size={14} color="#3b82f6" />
                      </LinearGradient>
                    </View>
                  )}
                  <View style={[styles.messageTextWrapper, msg.isUser ? styles.userTextWrapper : styles.botTextWrapper]}>
                    <Text style={[styles.messageText, msg.isUser ? styles.userText : styles.botText]}>
                      {msg.text}
                    </Text>
                    {msg.isEmergency && (
                      <View style={styles.emergencyActionsContainer}>
                         <View style={styles.emergencyPillsRow}>
                           {msg.emergencyActions?.map(action => (
                             <TouchableOpacity key={action.label} style={styles.emergencyPill} onPress={() => Linking.openURL(`tel:${action.number}`)}>
                               <Feather name="phone-call" size={12} color="#ef4444" />
                               <Text style={styles.emergencyPillText}>{action.label}: {action.number}</Text>
                             </TouchableOpacity>
                           ))}
                         </View>
                         <TouchableOpacity style={styles.sosRoundBtn} onPress={() => router.push('/drawer/sospath')}>
                           <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.sosRoundInner}>
                              <Feather name="alert-triangle" size={14} color="#ffffff" style={{marginRight: 6}} />
                              <Text style={styles.sosRoundText}>Go to SOS Dashboard</Text>
                           </LinearGradient>
                         </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {isTyping && (
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <View style={styles.botAvatar}>
                      <LinearGradient colors={['#ffffff', '#e2e8f0']} style={styles.botAvatarGradient}>
                        <Feather name="cpu" size={14} color="#3b82f6" />
                      </LinearGradient>
                  </View>
                  <View style={[styles.messageTextWrapper, styles.botTextWrapper, { paddingVertical: 14 }]}>
                    <TypingIndicator />
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {/* Spacer to push input area to bottom naturally */}
          <View style={{ flex: 1 }} pointerEvents="none" />

          {/* FLOATING INPUT AREA */}
          <View style={styles.floatingInputWrapper} pointerEvents="box-none">
            <View style={styles.inputContainer} pointerEvents="box-none">
              {messages.length > 0 && (
                <Animated.View style={{ transform: [{ translateY: pillFloatAnim }], pointerEvents: 'auto' }}>
                  <TouchableOpacity style={styles.locationChip} onPress={() => setShowMap(true)}>
                    <Feather name="map-pin" size={12} color="#ffffff" />
                    <Text style={styles.locationChipText} numberOfLines={1}>{locationLabel}</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
              
              <Animated.View style={[styles.inputWrapper, { shadowColor: glowShadowColor, elevation: glowElevation, pointerEvents: 'auto' }]}>
                <TouchableOpacity style={styles.attachBtn} onPress={() => setShowMap(true)}>
                  <Feather name="plus" size={24} color="#94a3b8" />
                </TouchableOpacity>
                
                <TextInput 
                  style={styles.input}
                  placeholder="Ask about weather, floods..."
                  placeholderTextColor="#94a3b8"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => handleSend()}
                />
                
                <TouchableOpacity 
                  style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
                  onPress={() => handleSend()} 
                  disabled={!inputText.trim()}
                >
                  <Feather name="arrow-up" size={20} color={inputText.trim() ? "#ffffff" : "#64748b"} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
        
        <TouchableOpacity style={[styles.disclaimerBtn, { paddingBottom: Math.max(insets.bottom, 12) }]} onPress={() => setShowDisclaimer(true)}>
          <Text style={styles.disclaimerBtnText}>AI can make mistakes. Check important info.</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Disclaimer Modal */}
      <Modal visible={showDisclaimer} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { padding: 24 }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: '#ef4444' }]}>⚠️ Disclaimer</Text>
                <Text style={[styles.modalSubtitle, { marginTop: 4 }]}>Important limitations of this AI</Text>
              </View>
              <TouchableOpacity onPress={() => setShowDisclaimer(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 20, maxHeight: 400 }}>
              <Text style={{ color: '#e2e8f0', fontSize: 15, lineHeight: 24 }}>
                This AI Assistant is designed to provide general weather forecasts and basic guidance based on available data. {"\n\n"}
                <Text style={{ fontWeight: 'bold', color: '#ffffff' }}>It is NOT a professional life-saving tool.</Text> {"\n\n"}
                The predictions, historical data, and advice provided by this AI can be incorrect, delayed, or incomplete. Do not rely solely on this AI for your safety or decision-making during severe weather events, floods, fires, or any other emergencies. {"\n\n"}
                Always verify critical information through official government channels, local authorities, and certified emergency services. We assume no liability for any actions taken or not taken based on the information provided by this AI.
              </Text>
            </ScrollView>

            <TouchableOpacity style={[styles.confirmBtn, { marginTop: 24 }]} onPress={() => setShowDisclaimer(false)}>
              <Text style={styles.confirmBtnText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      <Modal visible={showMap} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#0B1120', '#1E1B4B']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Set Target Location</Text>
                <Text style={styles.modalSubtitle}>Tap anywhere on the map to drop a pin.</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMap(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
              <MapView 
                style={styles.map}
                initialRegion={{
                  latitude: tempLocation.lat,
                  longitude: tempLocation.lon,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                onPress={(e) => setTempLocation({ lat: e.nativeEvent.coordinate.latitude, lon: e.nativeEvent.coordinate.longitude })}
              >
                <Marker coordinate={{ latitude: tempLocation.lat, longitude: tempLocation.lon }} />
              </MapView>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleMapConfirm}>
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
              <Feather name="check" size={20} color="#3b82f6" style={{marginLeft: 8}} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16 },
  headerBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  headerMapBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  headerMapText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  
  // Empty State UI
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  welcomeContainer: { minHeight: 120, justifyContent: 'center', width: '100%' },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', lineHeight: 36 },
  cursor: { color: '#67e8f9', fontWeight: '300' },
  
  suggestionsContainer: { width: '100%', marginTop: 40 },
  suggestionPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  suggestionText: { color: '#ffffff', fontSize: 15, fontWeight: '500', marginLeft: 12 },

  // Chat UI
  chatArea: { flex: 1, paddingHorizontal: 20 },
  chatContent: { paddingVertical: 20, paddingBottom: 220 },
  
  messageBubble: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
  userBubble: { justifyContent: 'flex-end' },
  botBubble: { justifyContent: 'flex-start' },
  
  botAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10, marginBottom: 4, overflow: 'hidden' },
  botAvatarGradient: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  
  messageTextWrapper: { maxWidth: '88%', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24 },
  userTextWrapper: { backgroundColor: '#ffffff', borderBottomRightRadius: 6 },
  botTextWrapper: { backgroundColor: 'rgba(255,255,255,0.15)', borderBottomLeftRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  messageText: { fontSize: 16, lineHeight: 24 },
  userText: { color: '#0f172a', fontWeight: '500' },
  botText: { color: '#ffffff' },

  // Emergency UI
  emergencyActionsContainer: { marginTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 12 },
  emergencyPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  emergencyPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  emergencyPillText: { color: '#fca5a5', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  sosRoundBtn: { alignSelf: 'flex-start', shadowColor: '#ef4444', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  sosRoundInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  sosRoundText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },

  // Typing Indicator
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffffff', marginHorizontal: 3 },

  // Floating Input UI
  floatingInputWrapper: { width: '100%', pointerEvents: 'box-none' },
  inputContainer: { paddingHorizontal: 20, paddingBottom: 10, alignItems: 'center', pointerEvents: 'box-none' },
  disclaimerBtn: { marginTop: 8, paddingVertical: 4 },
  disclaimerBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center', textDecorationLine: 'underline' },
  
  locationChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 41, 59, 0.95)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  locationChipText: { color: '#ffffff', fontSize: 12, fontWeight: '700', marginLeft: 6 },

  inputWrapper: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: 32, paddingHorizontal: 8, paddingVertical: 8, shadowOffset: { width: 0, height: 8 }, shadowRadius: 15, shadowOpacity: 0.3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  attachBtn: { padding: 12 },
  input: { flex: 1, height: 40, fontSize: 16, color: '#ffffff', paddingHorizontal: 4, paddingVertical: 0 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 4, shadowColor: '#3b82f6', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 6 },
  sendBtnDisabled: { backgroundColor: '#334155', shadowOpacity: 0 },

  // Map Modal
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: height * 0.85, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  modalCloseBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20 },
  mapContainer: { flex: 1, borderRadius: 24, overflow: 'hidden', marginBottom: 24, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },
  map: { width: '100%', height: '100%' },
  confirmBtn: { backgroundColor: '#ffffff', paddingVertical: 18, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  confirmBtnText: { color: '#3b82f6', fontSize: 18, fontWeight: 'bold' }
});
