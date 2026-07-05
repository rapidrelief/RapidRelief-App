// Local AI Engine Fallback
// Used because the Google Cloud Project encountered a "Quota tier unavailable" error.

export const generateGlobalAnalysis = async (zones: any[], sosRequests: any[] = []) => {
  if (!zones || zones.length === 0) return "No zone data available for analysis.";

  // If there are active SOS requests from users, THIS is the highest priority.
  if (sosRequests && sosRequests.length > 0) {
    const recentSos = sosRequests[0];
    const name = recentSos.user_name || "a user";
    const zoneName = recentSos.zone_id ? `Zone ${recentSos.zone_id}` : "an unmapped area";
    const type = recentSos.source === "AUTO" ? "an AUTOMATIC NO-MOVEMENT SOS" : "a MANUAL SOS";
    
    let alertStr = `URGENT ALERT: Received ${type} from ${name} in ${zoneName}. `;
    if (sosRequests.length > 1) {
      alertStr += `There are ${sosRequests.length - 1} other active emergency requests in the queue. `;
    }
    alertStr += `Immediate deployment is strictly required.`;
    return alertStr;
  }

  let floodCount = 0;
  let sosCount = 0;
  let lostCount = 0;

  zones.forEach((z) => {
    if (z.state === "FLOOD") floodCount++;
    if (z.state === "SOS") sosCount++;
    if (z.state === "LOST") lostCount++;
  });

  if (floodCount === 0 && sosCount === 0 && lostCount === 0) {
    return "All zones are currently stable and secure. No flood risks or active emergencies detected across the region.";
  }

  let warning = `Emergency Alert: `;
  if (floodCount > 0) warning += `${floodCount} zone(s) reporting active flooding. `;
  if (sosCount > 0) warning += `${sosCount} SOS signal(s) active. `;
  if (lostCount > 0) warning += `Contact lost with ${lostCount} zone(s). `;

  warning += "Immediate deployment of rapid response units is recommended.";
  return warning;
};

export const generateZoneAnalysis = async (zone: any, weatherData: any, deviceLogs: any) => {
  if (!zone) return "Zone data missing.";

  const isSafe = zone.state === "SAFE";
  const isFlood = zone.state === "FLOOD";
  
  // Extract weather risk
  let weatherRisk = "LOW";
  let avgRain = 0;
  if (weatherData?.forecast && weatherData.forecast.length > 0) {
    avgRain = weatherData.forecast[0].rainfall_mm || 0;
    weatherRisk = weatherData.forecast[0].risk_level || "LOW";
  }

  // Extract device state
  const totalDevices = deviceLogs?.nodes?.length || 0;
  const lostDevices = deviceLogs?.nodes?.filter((n: any) => n.status === "OFFLINE").length || 0;

  // Build intelligent response
  if (isFlood) {
    return `CRITICAL: IoT sensors confirm active flooding in ${zone.name}. Weather data shows ${weatherRisk} risk with ${avgRain}mm of rainfall. Immediate rescuer intervention is required as water levels are dangerous.`;
  }

  if (zone.state === "SOS") {
    return `URGENT: A manual SOS distress signal was triggered in ${zone.name}. Weather risk is currently ${weatherRisk}. Dispatch medical and rescue teams to the coordinates immediately.`;
  }

  if (isSafe && weatherRisk === "HIGH") {
    return `WARNING: The weather prediction in ${zone.name} indicates HIGH risk (${avgRain}mm rain expected), but IoT devices currently reflect SAFE levels. Keep close attention as flash flooding may occur shortly.`;
  }

  if (isSafe && weatherRisk !== "HIGH" && lostDevices > 0) {
    return `NOTICE: Weather is stable, but we have lost signal with ${lostDevices} out of ${totalDevices} devices in ${zone.name}. Dispatch a recon unit to inspect the hardware.`;
  }

  return `The environmental conditions in ${zone.name} are optimal. Weather forecasts predict minimal rainfall (${avgRain}mm), and all ${totalDevices} IoT devices are reporting safe water levels. No action required.`;
};
