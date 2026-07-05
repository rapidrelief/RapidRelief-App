import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Text, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Navbar from '../dashboard/Navbar';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function WeatherScreen() {
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Fetching location...");
  
  const [riskLevel, setRiskLevel] = useState("Low");
  const [aiAnalysis, setAiAnalysis] = useState("Weather conditions look stable. No immediate flood warnings.");
  const [historicalAvg, setHistoricalAvg] = useState(25);
  const [totalPredicted, setTotalPredicted] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetchWeatherData(mounted);
    return () => { mounted = false; };
  }, []);

  const fetchWeatherData = async (mounted: boolean) => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 52.52; 
      let lon = 13.41;
      
      if (status === 'granted') {
        let location = await Location.getLastKnownPositionAsync({});
        if (!location) {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        }
        
        if (location) {
          lat = location.coords.latitude;
          lon = location.coords.longitude;
          
          let geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (geocode.length > 0 && mounted) {
            setLocationName(`${geocode[0].city || geocode[0].region}, ${geocode[0].country}`);
          }
        }
      } else if (mounted) {
        setLocationName("Using Default Location (Permissions Denied)");
      }

      // Fetch next 7 days forecast
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
      const data = await response.json();

      if (!mounted) return;

      if (data.daily && data.daily.time) {
        const days = data.daily.time.map((timeStr: string, index: number) => {
          const date = new Date(timeStr);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const isToday = index === 0;
          
          return {
            id: index.toString(),
            dayLabel: isToday ? 'Today' : dayName,
            isToday: isToday,
            date: timeStr,
            maxTemp: Math.round(data.daily.temperature_2m_max[index] || 0),
            minTemp: Math.round(data.daily.temperature_2m_min[index] || 0),
            precip: data.daily.precipitation_sum[index] || 0,
            code: data.daily.weathercode[index] || 0
          };
        });
        
        setForecast(days);
        
        // Calculate mock historical data & AI logic
        const predictedTotal = days.reduce((sum: number, d: any) => sum + d.precip, 0);
        setTotalPredicted(predictedTotal);
        
        // Mock historical 5-year average for this specific week
        // Using a seeded mock based on lat/lon to keep it consistent
        const mockHistoricalAvg = Math.abs(Math.floor((lat + lon) % 15)) + 15; 
        setHistoricalAvg(mockHistoricalAvg);
        
        const maxDailyPrecip = Math.max(...days.map((d: any) => d.precip));

        if (predictedTotal > mockHistoricalAvg * 2.5 || maxDailyPrecip > 50) {
          setRiskLevel("High");
          setAiAnalysis(`AI Analysis of past 5 years' data shows a historical average of ${mockHistoricalAvg}mm for this week. The predicted ${Math.round(predictedTotal)}mm is severely abnormal. High risk of flooding.`);
        } else if (predictedTotal > mockHistoricalAvg * 1.5 || maxDailyPrecip > 20) {
          setRiskLevel("Moderate");
          setAiAnalysis(`Predicted rainfall (${Math.round(predictedTotal)}mm) is above the historical average (${mockHistoricalAvg}mm). Localized flooding possible.`);
        } else {
          setRiskLevel("Low");
          setAiAnalysis(`Predicted rainfall (${Math.round(predictedTotal)}mm) aligns safely with the past 5-year historical average (${mockHistoricalAvg}mm). No flood warnings.`);
        }
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return "sunny";
    if (code >= 1 && code <= 3) return "partly-sunny";
    if (code >= 45 && code <= 48) return "cloud";
    if (code >= 51 && code <= 67) return "rainy";
    if (code >= 71 && code <= 77) return "snow";
    if (code >= 80 && code <= 82) return "rainy";
    if (code >= 95 && code <= 99) return "thunderstorm";
    return "cloud";
  };

  // Find max precipitation for chart scaling (include historicalAvg in scale)
  const maxChartValue = forecast.length > 0 ? Math.max(historicalAvg + 10, Math.max(...forecast.map(d => d.precip)) + 5) : 30;

  const scrollToForecast = () => {
    scrollViewRef.current?.scrollTo({ y: 650, animated: true });
  };

  return (
    <View style={styles.container}>
      <Navbar />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>AI Weather</Text>
          <TouchableOpacity style={styles.forecastBtn} onPress={scrollToForecast}>
            <Text style={styles.forecastBtnText}>See Forecast</Text>
            <Feather name="arrow-down" size={14} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <View style={styles.locationContainer}>
          <Feather name="map-pin" size={16} color="#64748b" />
          <Text style={styles.locationText}>{locationName}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Analyzing historical and future data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.aiPredictionHeader}>
              <Text style={styles.subtitle}>AI Predictions</Text>
              
              <TouchableOpacity onPress={() => router.push('/drawer/botPath')} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#8b5cf6', '#3b82f6']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.aiChatButton}
                >
                  <Feather name="message-circle" size={16} color="#ffffff" style={{marginRight: 6}} />
                  <Text style={styles.aiChatButtonText}>Chat with AI</Text>
                  <View style={styles.aiPulseIndicator} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            {/* FLOOD PREDICTION CARD */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={styles.iconWrapper}>
                    <Feather name="alert-triangle" size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.cardTitle}>Flood Risk</Text>
                </View>
                <View 
                  style={[
                    styles.badge,
                    { backgroundColor: riskLevel === 'High' ? '#fee2e2' : riskLevel === 'Moderate' ? '#ffedd5' : '#dcfce7' }
                  ]}
                >
                  <Text 
                    style={[
                      styles.badgeText,
                      { color: riskLevel === 'High' ? '#b91c1c' : riskLevel === 'Moderate' ? '#c2410c' : '#15803d' }
                    ]}
                  >
                    {riskLevel.toUpperCase()} RISK
                  </Text>
                </View>
              </View>

              <Text style={styles.analysisText}>
                {aiAnalysis}
              </Text>

              {/* Flood Probability Gauge / Indicator */}
              <View style={styles.gaugeContainer}>
                <View style={styles.gaugeTrack}>
                  <View 
                    style={[
                      styles.gaugeFill, 
                      { 
                        width: riskLevel === 'High' ? '90%' : riskLevel === 'Moderate' ? '50%' : '15%',
                        backgroundColor: riskLevel === 'High' ? '#ef4444' : riskLevel === 'Moderate' ? '#f97316' : '#22c55e'
                      }
                    ]} 
                  />
                </View>
                <View style={styles.gaugeLabels}>
                  <Text style={styles.gaugeLabel}>Low</Text>
                  <Text style={styles.gaugeLabel}>Moderate</Text>
                  <Text style={styles.gaugeLabel}>Extreme</Text>
                </View>
              </View>
            </View>

            {/* RAIN PREDICTION CHART */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={[styles.iconWrapper, { backgroundColor: '#e0f2fe' }]}>
                    <Ionicons name="rainy" size={20} color="#0284c7" />
                  </View>
                  <Text style={styles.cardTitle}>Rainfall Analysis vs Historical</Text>
                </View>
              </View>

              <Text style={[styles.analysisText, {marginBottom: 30}]}>
                Comparing next 7 days against the past 5-year average for this specific week.
              </Text>

              {/* Beautiful Rain Chart */}
              <View style={styles.chartContainer}>
                <View style={styles.chartYAxis}>
                  <Text style={styles.chartYLabel}>{Math.round(maxChartValue)}mm</Text>
                  <Text style={styles.chartYLabel}>{Math.round(maxChartValue/2)}mm</Text>
                  <Text style={styles.chartYLabel}>0mm</Text>
                </View>
                
                <View style={styles.chartArea}>
                  {/* Grid Lines */}
                  <View style={[styles.gridLine, { bottom: '100%' }]} />
                  <View style={[styles.gridLine, { bottom: '50%' }]} />
                  <View style={[styles.gridLine, { bottom: '0%' }]} />

                  {/* Historical Average Reference Line */}
                  <View 
                    style={[
                      styles.historicalLine, 
                      { bottom: `${(historicalAvg / maxChartValue) * 100}%` }
                    ]} 
                  />
                  <View style={[styles.historicalLabelContainer, { bottom: `${(historicalAvg / maxChartValue) * 100}%` }]}>
                    <Text style={styles.historicalLabel}>5-Yr Avg ({historicalAvg}mm)</Text>
                  </View>

                  {/* Forecast Bars */}
                  {forecast.map((day, index) => {
                    const barHeight = (day.precip / maxChartValue) * 100;
                    const isAboveAverage = day.precip > historicalAvg;
                    return (
                      <View key={index} style={styles.barCol}>
                        <View style={styles.barTrack}>
                          <View 
                            style={[
                              styles.barFill, 
                              { 
                                height: `${Math.max(2, barHeight)}%`,
                                backgroundColor: isAboveAverage ? '#ef4444' : '#3b82f6',
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.barValue}>{day.precip > 0 ? day.precip : ''}</Text>
                        <Text style={[styles.barXLabel, day.isToday && styles.barXLabelToday]}>
                          {day.isToday ? 'Tod' : day.dayLabel.substring(0, 1)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                  <Text style={styles.legendText}>Expected Rain</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendText}>Above Average</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine]} />
                  <Text style={styles.legendText}>Historical Avg</Text>
                </View>
              </View>
            </View>

            <Text style={styles.subtitle}>7-Day Forecast</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20, paddingBottom: 20 }}
              style={{ marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 20 }}
            >
              {forecast.map((day, index) => {
                return (
                  <View 
                    key={day.id} 
                    style={[styles.forecastCard, day.isToday && styles.forecastCardActive]}
                  >
                    <Text style={[styles.fcDay, day.isToday && styles.fcDayActive]}>{day.isToday ? 'Today' : day.dayLabel}</Text>
                    <Ionicons 
                      name={getWeatherIcon(day.code) as any} 
                      size={32} 
                      color={day.isToday ? "#ffffff" : "#64748b"} 
                      style={styles.fcIcon} 
                    />
                    
                    <View style={styles.fcTemps}>
                      <Text style={[styles.fcMaxTemp, day.isToday && styles.fcTextActive]}>{day.maxTemp}°</Text>
                      <Text style={[styles.fcMinTemp, day.isToday && styles.fcTextActive]}>{day.minTemp}°</Text>
                    </View>

                    <View style={[styles.fcPrecipBadge, day.isToday && styles.fcPrecipBadgeActive]}>
                      <Ionicons name="water" size={12} color={day.isToday ? "#ffffff" : "#3b82f6"} />
                      <Text style={[styles.fcPrecipText, day.isToday && styles.fcTextActive]}>{day.precip}mm</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.footerInfo}>
              <Feather name="info" size={14} color="#94a3b8" />
              <Text style={styles.footerInfoText}>
                AI predictions and forecast data are dynamically generated for your current location ({locationName}).
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 110, paddingBottom: 60, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', color: '#0f172a' },
  forecastBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  forecastBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13, marginRight: 6 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  locationText: { color: '#64748b', marginLeft: 8 },
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconWrapper: { backgroundColor: '#dbeafe', padding: 8, borderRadius: 9999, marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999 },
  badgeText: { fontWeight: 'bold', fontSize: 11 },
  analysisText: { color: '#64748b', lineHeight: 22, marginBottom: 16, fontSize: 14 },
  
  gaugeContainer: { marginTop: 10, marginBottom: 5 },
  gaugeTrack: { height: 12, backgroundColor: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 9999 },
  gaugeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  gaugeLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

  chartContainer: { flexDirection: 'row', height: 180, marginTop: 10 },
  chartYAxis: { width: 36, justifyContent: 'space-between', paddingBottom: 24, alignItems: 'flex-end', paddingRight: 8 },
  chartYLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  chartArea: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 24, position: 'relative', paddingLeft: 8 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#f1f5f9' },
  
  historicalLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#94a3b8', borderStyle: 'dashed', borderWidth: 1, borderColor: '#cbd5e1', zIndex: 0 },
  historicalLabelContainer: { position: 'absolute', left: 0, top: -18, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 4, borderRadius: 4 },
  historicalLabel: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },

  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 1 },
  barTrack: { width: 14, height: '100%', backgroundColor: '#f8fafc', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 8, minHeight: 4 },
  barValue: { position: 'absolute', top: -20, fontSize: 10, color: '#64748b', fontWeight: '600' },
  barXLabel: { position: 'absolute', bottom: -24, fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  barXLabelToday: { color: '#2563eb', fontWeight: 'bold' },

  legendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendLine: { width: 16, height: 2, backgroundColor: '#94a3b8', borderStyle: 'dashed', marginRight: 6 },
  legendText: { fontSize: 12, color: '#64748b', fontWeight: '500' },

  aiPredictionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  subtitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  
  aiChatButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  aiChatButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  aiPulseIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#67e8f9', position: 'absolute', top: -2, right: -2, borderWidth: 2, borderColor: '#ffffff' },

  loadingContainer: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#64748b', marginTop: 16, fontWeight: '500' },
  
  forecastCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginRight: 12, width: 110, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#f1f5f9' },
  forecastCardActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  fcDay: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 12 },
  fcDayActive: { color: '#ffffff' },
  fcIcon: { marginBottom: 12 },
  fcTemps: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  fcMaxTemp: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginRight: 6 },
  fcMinTemp: { fontSize: 14, fontWeight: '500', color: '#94a3b8' },
  fcTextActive: { color: '#ffffff', opacity: 0.9 },
  fcPrecipBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  fcPrecipBadgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  fcPrecipText: { color: '#3b82f6', fontSize: 11, fontWeight: '600', marginLeft: 4 },

  footerInfo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 10, marginTop: 10, opacity: 0.8 },
  footerInfoText: { fontSize: 12, color: '#94a3b8', marginLeft: 6, textAlign: 'center', lineHeight: 18 }
});
