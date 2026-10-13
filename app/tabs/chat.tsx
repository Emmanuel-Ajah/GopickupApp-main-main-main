import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAdminConversations, getMessages, getSupport, sendMessage } from "../../services/api";

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetRecipient, setTargetRecipient] = useState<string>("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [showInbox, setShowInbox] = useState(false);

  const fetchMessages = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        if (parsedUser.role === "admin") {
          if (params.recipientId) {
            setTargetRecipient(params.recipientId as string);
            setShowInbox(false);
            const res = await getMessages(params.recipientId as string);
            setMessages(res.data || []);
          } else {
            setShowInbox(true);
            const convRes = await getAdminConversations();
            setConversations(convRes.data || []);
          }
        } else {
          setShowInbox(false);
          const supportRes = await getSupport();
          const adminId = supportRes.data?._id;
          if (adminId) {
            setTargetRecipient(adminId);
            const res = await getMessages(adminId);
            setMessages(res.data || []);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching live chat messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [params.recipientId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText("");

    const optimisticMsg = {
      _id: "temp-" + Date.now(),
      sender: user?._id || "user",
      content: messageText,
      createdAt: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      if (targetRecipient) {
        await sendMessage({
          recipientId: targetRecipient,
          content: messageText,
        });
        setTimeout(fetchMessages, 1200);
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity
          onPress={() => {
            if (user?.role === "admin") setShowInbox((prev) => !prev);
          }}
          style={styles.headerMenuBtn}
          accessibilityLabel="Options"
        >
          <Ionicons name="reorder-two-outline" size={30} color="#444444" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {showInbox ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.inboxScroll}
          >
            <Text style={styles.inboxSubtitle}>Recent Conversations</Text>
            {conversations.map((contact) => (
              <TouchableOpacity
                key={contact._id}
                style={styles.conversationItem}
                onPress={() =>
                  router.push({
                    pathname: "/tabs/chat" as any,
                    params: { recipientId: contact._id },
                  })
                }
              >
                <View style={styles.inboxAvatar}>
                  <Ionicons name="person" size={20} color="#606060" />
                </View>
                <View style={styles.conversationInfo}>
                  <Text style={styles.conversationName}>{contact.name}</Text>
                  <Text style={styles.conversationId}>{contact.userId}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
            {conversations.length === 0 && (
              <Text style={styles.emptyText}>No messages yet.</Text>
            )}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chatScroll}
            >
              {/* System Banner */}
              <View style={styles.systemBanner}>
                <Ionicons name="chatbox-ellipses-outline" size={16} color="#666666" />
                <Text style={styles.systemText}>
                  This chat is directly with our agent.
                </Text>
              </View>

              {/* Header Avatars Group */}
              <View style={styles.avatarPill}>
                <Image
                  source={require("../../assets/images/myImage.jpg")}
                  style={styles.avatarImg}
                />
                <View style={styles.agentAvatarCircle}>
                  <Ionicons name="person-outline" size={18} color="#999999" />
                </View>
              </View>

              {/* Date Text */}
              <Text style={styles.dateText}>Today</Text>

              {/* Message Bubbles */}
              {messages.map((msg, idx) => {
                const isUser = msg.sender === user?._id || msg.sender === "user";
                const timeStr =
                  msg.displayTime ||
                  new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                return (
                  <View
                    key={msg._id || idx}
                    style={[
                      styles.messageRow,
                      isUser ? styles.userRow : styles.agentRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.agentBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isUser ? styles.userText : styles.agentText,
                        ]}
                      >
                        {msg.content}
                      </Text>
                      <Text
                        style={[
                          styles.timeText,
                          isUser ? styles.userTime : styles.agentTime,
                        ]}
                      >
                        {timeStr}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {messages.length === 0 && !loading && (
                <View style={styles.emptyChatBox}>
                  <Text style={styles.emptyChatTitle}>Live Support Channel</Text>
                  <Text style={styles.emptyChatSub}>
                    Send a message below to chat live with our support team, negotiate rates, or request a driver dispatch.
                  </Text>
                </View>
              )}
              {loading && messages.length === 0 && (
                <ActivityIndicator size="small" color="#389E23" style={{ marginTop: 24 }} />
              )}
            </ScrollView>

            {/* Floating Input Bar */}
            <View style={styles.inputAreaWrapper}>
              <View style={styles.inputBarArea}>
                <View style={styles.inputPill}>
                  <TextInput
                    style={styles.input}
                    placeholder="Message"
                    placeholderTextColor="#A0A0A0"
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                  />
                  <View style={styles.inputIcons}>
                    <TouchableOpacity style={styles.iconCircle} accessibilityLabel="Attach file">
                      <Ionicons name="attach" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircle} accessibilityLabel="Voice note">
                      <Ionicons name="mic" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSend}
                  activeOpacity={0.85}
                  accessibilityLabel="Send message"
                >
                  <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 42,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
  },
  headerMenuBtn: {
    padding: 4,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },
  systemBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF2EF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "center",
    marginBottom: 12,
  },
  systemText: {
    fontSize: 12.5,
    color: "#555555",
    fontWeight: "500",
    marginLeft: 6,
  },
  avatarPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1.2,
    borderColor: "#111111",
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  avatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 4,
  },
  agentAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8FAF8",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#777777",
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  agentRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: "#389E23",
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  userText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  agentText: {
    color: "#222222",
    fontWeight: "400",
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  userTime: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  agentTime: {
    color: "#999999",
  },
  inputAreaWrapper: {
    position: "absolute",
    bottom: 84,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical:8,
    backgroundColor:'#ffffff',
    marginBottom:24,
    marginLeft:24,
    marginRight:24,
    borderRadius:100,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputBarArea: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 28,
    borderWidth: 0.2,
    borderColor: "#222222",
    paddingLeft: 18,
    paddingRight: 8,
    height: 52,
    
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
    paddingVertical: 8,
  },
  inputIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#389E23",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inboxScroll: {
    padding: 20,
    paddingBottom: 120,
  },
  inboxSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  inboxAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EBEFEB",
    justifyContent: "center",
    alignItems: "center",
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  conversationId: {
    fontSize: 12,
    color: "#777777",
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#888888",
    marginTop: 40,
    fontSize: 15,
  },
  emptyChatBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyChatTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
    marginBottom: 6,
  },
  emptyChatSub: {
    fontSize: 13,
    color: "#777777",
    textAlign: "center",
    lineHeight: 18,
  },
});
