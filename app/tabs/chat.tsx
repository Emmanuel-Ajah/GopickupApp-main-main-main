import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { getMessages, sendMessage } from "../api/api";

const ADMIN_ID = "677d24f0c4068c07e0568f18"; // Default Admin ID

const Chat = () => {
    const params = useLocalSearchParams();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [targetRecipient, setTargetRecipient] = useState<string>(ADMIN_ID);

    const fetchMessages = async () => {
        try {
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                let recipient = ADMIN_ID;
                if (parsedUser.role === 'admin' && params.recipientId) {
                    recipient = params.recipientId as string;
                }
                setTargetRecipient(recipient);

                const response = await getMessages(recipient);
                setMessages(response.data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [params.recipientId]); // Re-fetch if param changes

    const handleSend = async () => {
        if (!inputText.trim()) return;

        try {
            const data = {
                recipientId: targetRecipient,
                content: inputText,
            };
            await sendMessage(data);
            setInputText("");
            fetchMessages();
        } catch (error) {
            console.error("Send message error:", error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chat</Text>
                <TouchableOpacity>
                    <Ionicons name="options-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.chatScroll}
                >
                    {/* System Banner */}
                    <View style={styles.systemBanner}>
                        <Ionicons name="chatbox-ellipses-outline" size={18} color="#606060" />
                        <Text style={styles.systemText}>
                            This chat is directly with our agent.
                        </Text>
                    </View>

                    {/* Avatars */}
                    <View style={styles.avatarGroup}>
                        <Image
                            source={require("../../assets/images/myImage.jpg")}
                            style={[styles.avatar, styles.userAvatar]}
                        />
                        <View style={[styles.avatar, styles.agentAvatarPlaceholder]}>
                            <Ionicons name="person-outline" size={24} color="#A0A0A0" />
                        </View>
                    </View>

                    <Text style={styles.dateText}>Today</Text>

                    {/* Message List */}
                    {messages.map((msg: any, idx: number) => (
                        <View
                            key={msg._id || idx}
                            style={[
                                styles.messageRow,
                                msg.sender === user?._id ? styles.userRow : styles.agentRow,
                            ]}
                        >
                            <View
                                style={[
                                    styles.bubble,
                                    msg.sender === user?._id ? styles.userBubble : styles.agentBubble,
                                ]}>
                                <Text
                                    style={[
                                        styles.messageText,
                                        msg.sender === user?._id ? styles.userText : styles.agentText,
                                    ]}>
                                    {msg.content}
                                </Text>
                                <Text
                                    style={[
                                        styles.timeText,
                                        msg.sender === user?._id ? styles.userTime : styles.agentTime,
                                    ]}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {loading && messages.length === 0 && (
                        <ActivityIndicator size="small" color="#439D25" style={{ marginTop: 20 }} />
                    )}
                </ScrollView>

                {/* Input Bar */}
                <View style={styles.inputBarArea}>
                    <View style={styles.inputPill}>
                        <TextInput
                            style={styles.input}
                            placeholder="Message"
                            placeholderTextColor="#A0A0A0"
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <View style={styles.inputIcons}>
                            <TouchableOpacity style={styles.iconCircle}>
                                <Ionicons name="attach" size={20} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconCircle}>
                                <Ionicons name="mic" size={20} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 100 }} />
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FBF8",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#000",
    },
    chatScroll: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    systemBanner: {
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginTop: 15,
        alignSelf: "center",
    },
    systemText: {
        fontSize: 12,
        color: "#606060",
        marginLeft: 8,
        fontWeight: "500",
    },
    avatarGroup: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
        position: "relative",
        height: 50,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        backgroundColor: "#FFFFFF",
    },
    userAvatar: {
        zIndex: 2,
        marginRight: -10,
    },
    agentAvatarPlaceholder: {
        zIndex: 1,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    dateText: {
        textAlign: "center",
        color: "#000",
        fontSize: 12,
        fontWeight: "700",
        marginVertical: 15,
    },
    messageRow: {
        marginBottom: 15,
        flexDirection: "row",
        width: "100%",
    },
    userRow: {
        justifyContent: "flex-end",
    },
    agentRow: {
        justifyContent: "flex-start",
    },
    bubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 15,
        position: "relative",
    },
    userBubble: {
        backgroundColor: "#439D25",
        borderBottomRightRadius: 2,
    },
    agentBubble: {
        backgroundColor: "#FFFFFF",
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    messageText: {
        fontSize: 14,
        lineHeight: 18,
    },
    userText: {
        color: "#FFFFFF",
        fontWeight: "500",
    },
    agentText: {
        color: "#606060",
        fontWeight: "500",
    },
    timeText: {
        fontSize: 9,
        marginTop: 4,
        textAlign: "right",
    },
    userTime: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    agentTime: {
        color: "#A0A0A0",
    },
    inputBarArea: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: "transparent",
        marginBottom: 10,
    },
    inputPill: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        height: 54,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#000",
    },
    inputIcons: {
        flexDirection: "row",
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#000000",
        marginLeft: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: "#439D25",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#439D25",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default Chat;
