import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator, SafeAreaView, Platform, StatusBar, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "@/app/config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getMessagesInbox, getMessagesSent, sendMessage as apiSendMessage, markMessageRead } from "@/app/services/api";

export default function RescuerMessagesScreen() {
  const navigation: any = useNavigation();
  const uid = auth.currentUser?.uid;

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingRead, setMarkingRead] = useState<number | null>(null);
  
  // Compose state
  const [composeVisible, setComposeVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [payload, setPayload] = useState("");
  
  // Tab state: "inbox" | "sent"
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [userName, setUserName] = useState("Rescuer");
  const [orgId, setOrgId] = useState("ORG-1001");

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;
      const snap = await getDocs(query(collection(db, "users"), where("uid", "==", uid)));
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserName(data.fullName || "Rescuer");
        if (data.organizationId) {
          setOrgId(`ORG-${1000 + parseInt(data.organizationId)}`);
        }
      }
    };
    fetchUser();
  }, [uid]);

  const loadMessages = useCallback(async () => {
    try {
      const inboxRes = await getMessagesInbox();
      const sentRes = await getMessagesSent();

      const inboxMessages = inboxRes.messages || [];
      const sentMessages = sentRes.messages || [];

      const combined = [...inboxMessages, ...sentMessages];
      const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
      unique.sort((a, b) => {
        const timeA = typeof a.created_at === 'number' ? a.created_at : 0;
        const timeB = typeof b.created_at === 'number' ? b.created_at : 0;
        return timeB - timeA;
      });
      setMessages(unique);
    } catch (err) {
      console.log("Failed to load messages:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
    
    // Simple polling
    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const handleMarkRead = async (messageId: number) => {
    setMarkingRead(messageId);
    try {
      await markMessageRead(messageId);
      // Optimistic UI update
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
    } catch (err) {
      console.log("Error marking as read:", err);
    } finally {
      setMarkingRead(null);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !payload.trim()) return;

    setSending(true);
    try {
      const res = await apiSendMessage({
        receiver_uid: orgId,
        subject: subject.trim(),
        content: payload.trim()
      });

      setComposeVisible(false);
      setSubject("");
      setPayload("");
      loadMessages(); // Refresh immediately after sending
    } catch (err) {
      console.log("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const displayedMessages = messages.filter(m => 
    activeTab === "inbox" 
      ? (m.receiver_uid === uid || m.receiver_uid === "all" || m.receiver_uid === "ALL" || m.receiver_uid === "GLOBAL") && m.sender_uid !== uid
      : m.sender_uid === uid
  );

  const formatTime = (ts: any) => {
    if (!ts) return "Just now";
    const date = new Date(ts * 1000);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* ================= HEADER ================= */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#94A3B8",
            shadowOpacity: 0.15,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
            borderWidth: 1,
            borderColor: "#F1F5F9"
          }}
        >
          <Ionicons name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#1E293B", letterSpacing: 0.5 }}>
          Transmissions
        </Text>
        
        <TouchableOpacity
          onPress={() => setComposeVisible(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: "#4F46E5",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#4F46E5",
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ================= TABS ================= */}
      <View style={{ paddingHorizontal: 24, marginBottom: 16, flexDirection: "row", gap: 12 }}>
        <TouchableOpacity 
          onPress={() => setActiveTab("inbox")}
          style={{ flex: 1, backgroundColor: activeTab === "inbox" ? "#4F46E5" : "#FFFFFF", paddingVertical: 12, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: activeTab === "inbox" ? "#4F46E5" : "#E2E8F0" }}
        >
          <Text style={{ color: activeTab === "inbox" ? "white" : "#64748B", fontWeight: "900", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" }}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab("sent")}
          style={{ flex: 1, backgroundColor: activeTab === "sent" ? "#4F46E5" : "#FFFFFF", paddingVertical: 12, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: activeTab === "sent" ? "#4F46E5" : "#E2E8F0" }}
        >
          <Text style={{ color: activeTab === "sent" ? "white" : "#64748B", fontWeight: "900", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" }}>Sent</Text>
        </TouchableOpacity>
      </View>

      {/* ================= MESSAGE LIST ================= */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
          }
        >
          {displayedMessages.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(79, 70, 229, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                <Ionicons name="mail-open" size={32} color="#4F46E5" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#1E293B" }}>No Transmissions</Text>
              <Text style={{ color: "#64748B", marginTop: 8, fontWeight: "600" }}>Your {activeTab} is completely empty.</Text>
            </View>
          ) : (
            displayedMessages.map(m => (
              <View 
                key={m.id} 
                style={{ 
                  backgroundColor: "#FFFFFF", 
                  borderRadius: 24, 
                  padding: 20, 
                  marginBottom: 16, 
                  shadowColor: "#94A3B8", 
                  shadowOpacity: 0.1, 
                  shadowRadius: 10, 
                  shadowOffset: {width: 0, height: 4}, 
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: m.is_read ? "#F1F5F9" : "rgba(79, 70, 229, 0.2)"
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: activeTab === "inbox" ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)", justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                      <Ionicons name={activeTab === "inbox" ? "download" : "send"} size={20} color={activeTab === "inbox" ? "#10B981" : "#3B82F6"} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: "900", color: "#1E293B" }}>
                        {activeTab === "inbox" ? m.sender_name || "HQ / Admin" : "To: HQ / Admin"}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "800", marginTop: 2, textTransform: "uppercase" }}>
                        {formatTime(m.created_at)}
                      </Text>
                    </View>
                  </View>
                  {!m.is_read && activeTab === "inbox" && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ backgroundColor: "#EF4444", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 }}>
                        <Text style={{ color: "white", fontSize: 9, fontWeight: "900", textTransform: "uppercase" }}>NEW</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleMarkRead(m.id)}
                        disabled={markingRead === m.id}
                        style={{ backgroundColor: "rgba(79, 70, 229, 0.1)", padding: 6, borderRadius: 8 }}
                      >
                        {markingRead === m.id ? (
                          <ActivityIndicator size="small" color="#4F46E5" />
                        ) : (
                          <Ionicons name="checkmark-done" size={16} color="#4F46E5" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={{ backgroundColor: "#F8FAFC", padding: 16, borderRadius: 16 }}>
                  <Text style={{ color: "#4F46E5", fontWeight: "900", fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {m.subject}
                  </Text>
                  <Text style={{ color: "#334155", fontSize: 14, fontWeight: "600", lineHeight: 22 }}>
                    {m.content}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ================= COMPOSE MODAL ================= */}
      <Modal visible={composeVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#F8FAFC", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, maxHeight: "90%" }}>
            
            <View style={{ width: 40, height: 5, backgroundColor: "#CBD5E1", borderRadius: 3, alignSelf: "center", marginBottom: 20 }} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#1E293B" }}>New Transmission</Text>
                <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "800", marginTop: 4 }}>SECURE LINK TO HQ</Text>
              </View>
              <TouchableOpacity onPress={() => setComposeVisible(false)} style={{ backgroundColor: "rgba(100, 116, 139, 0.1)", padding: 8, borderRadius: 999 }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#64748B", fontWeight: "800", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Destination Node</Text>
                <View style={{ backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="business" size={20} color="#4F46E5" style={{ marginRight: 12 }} />
                  <Text style={{ color: "#1E293B", fontWeight: "900", fontSize: 15 }}>Organization Headquarters (Admin)</Text>
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#64748B", fontWeight: "800", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Subject Protocol</Text>
                <TextInput 
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Enter brief subject..."
                  placeholderTextColor="#94A3B8"
                  style={{ backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", color: "#1E293B", fontWeight: "700", fontSize: 15 }}
                />
              </View>

              <View style={{ marginBottom: 32 }}>
                <Text style={{ color: "#64748B", fontWeight: "800", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Payload Data</Text>
                <TextInput 
                  value={payload}
                  onChangeText={setPayload}
                  placeholder="Type your message..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  style={{ backgroundColor: "#FFFFFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", color: "#1E293B", fontWeight: "600", fontSize: 15, minHeight: 120 }}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 40 }}>
                <TouchableOpacity 
                  onPress={() => setComposeVisible(false)}
                  style={{ flex: 1, backgroundColor: "#FFFFFF", paddingVertical: 18, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center" }}
                >
                  <Text style={{ color: "#64748B", fontWeight: "900", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Abort</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleSend}
                  disabled={sending || !subject.trim() || !payload.trim()}
                  style={{ flex: 2, backgroundColor: subject.trim() && payload.trim() ? "#10B981" : "#A7F3D0", paddingVertical: 18, borderRadius: 20, alignItems: "center", flexDirection: "row", justifyContent: "center", shadowColor: "#10B981", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width: 0, height: 4} }}
                >
                  {sending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={{ color: "white", fontWeight: "900", fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5, marginRight: 8 }}>Transmit</Text>
                      <Ionicons name="send" size={16} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
