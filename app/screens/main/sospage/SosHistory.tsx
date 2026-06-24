import { Feather } from "@expo/vector-icons";
import React, { memo, useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { auth } from "@/app/config/firebase";
import { getUserSOSHistory, clearUserSOSHistory } from "@/app/services/api";

const SosHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const data = await getUserSOSHistory(uid);
      setHistory(data?.sos || []);
    } catch (err) {
      console.log("User SOS history load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    Alert.alert(
      "Clear History",
      "Are you sure you want to clear your entire SOS alert history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await clearUserSOSHistory(uid);
              if (result?.error) {
                Alert.alert("Error", String(result.error));
              } else {
                Alert.alert("Success", "SOS history cleared successfully.");
                setHistory([]);
              }
            } catch (err) {
              console.log("Error clearing history:", err);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-10">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center">
          <View className="bg-green-100 p-2 rounded-xl mr-3">
            <Feather name="clock" size={18} color="#10B981" />
          </View>
          <Text className="text-lg font-extrabold text-slate-800">SOS History</Text>
        </View>

        {history.length > 0 && (
          <TouchableOpacity
            onPress={handleClearHistory}
            className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-full"
            activeOpacity={0.7}
          >
            <Text className="text-red-700 font-extrabold text-xs">
              Clear History
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text className="text-slate-400 text-center">Loading history...</Text>
      ) : history.length === 0 ? (
        <Text className="text-slate-400 text-center">
          No SOS history in last 10 Days.
        </Text>
      ) : (
        history.map((item) => (
          <View
            key={item.id}
            className="bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-100"
          >
            <View className="flex-row justify-between mb-2">
              <View className="bg-green-100 px-2 py-0.5 rounded-md">
                <Text className="text-green-700 font-bold text-[10px]">
                  Completed
                </Text>
              </View>
              <Text className="text-slate-400 text-[10px]">
                {formatTime(item.completed_at)}
              </Text>
            </View>

            <Text className="text-slate-700 font-bold text-sm">
              Zone: {item.zone_id || "Outside zone"}
            </Text>
            <Text className="text-slate-500 text-xs mt-1">
              Type: {item.source === "AUTO" ? "Automatic SOS" : "Manual SOS"}
            </Text>
            <Text className="text-slate-500 text-xs mt-1">
              Rescued by: {item.completed_by_name || "Rescuer"}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

const formatTime = (timestamp?: number | null) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
};

export default memo(SosHistory);
