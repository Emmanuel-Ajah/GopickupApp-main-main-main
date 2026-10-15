import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  deleteMessage,
  getAdminConversations,
  getMessages,
  getSupport,
  sendMessage,
} from "../../services/api";
import haptic from "../../utils/haptics";

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDurationMillis = (ms?: number) => {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

function VoiceNotePlayer({
  uri,
  isUser,
}: {
  uri: string;
  isUser: boolean;
}) {
  const player = useAudioPlayer(uri ? uri : null);
  const status = useAudioPlayerStatus(player);

  const togglePlayback = async () => {
    try {
      if (!uri) return;
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (status.playing) {
        player.pause();
      } else {
        if (status.didJustFinish) {
          await player.seekTo(0);
        }
        player.play();
      }
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  };

  const currentSec = status.currentTime || 0;
  const totalSec = status.duration || 0;
  const progressRatio =
    totalSec > 0 ? Math.min(Math.max(currentSec / totalSec, 0), 1) : 0;

  const formatSec = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <View style={styles.voicePlayerRow}>
      <TouchableOpacity
        style={[
          styles.playPauseBtn,
          isUser ? styles.playPauseBtnUser : styles.playPauseBtnAgent,
        ]}
        onPress={togglePlayback}
        activeOpacity={0.8}
        accessibilityLabel={status.playing ? "Pause voice note" : "Play voice note"}
      >
        <Ionicons
          name={status.playing ? "pause" : "play"}
          size={16}
          color={isUser ? "#389E23" : "#FFFFFF"}
          style={!status.playing ? { marginLeft: 2 } : undefined}
        />
      </TouchableOpacity>

      <View style={styles.waveformContainer}>
        {/* Waveform visual bars */}
        <View style={styles.waveformBars}>
          {[40, 75, 95, 50, 30, 85, 100, 65, 45, 90, 80, 40, 70, 55, 35].map(
            (heightPercent, i) => {
              const barProgress = i / 15;
              const isPlayed = progressRatio >= barProgress;
              return (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    { height: 4 + (heightPercent * 16) / 100 },
                    isUser
                      ? {
                          backgroundColor: isPlayed
                            ? "#FFFFFF"
                            : "rgba(255,255,255,0.45)",
                        }
                      : {
                          backgroundColor: isPlayed ? "#389E23" : "#D5D8D5",
                        },
                  ]}
                />
              );
            }
          )}
        </View>

        <Text
          style={[
            styles.voiceDurationText,
            isUser ? styles.userTime : styles.agentTime,
          ]}
        >
          {status.playing || currentSec > 0
            ? formatSec(currentSec)
            : totalSec > 0
            ? formatSec(totalSec)
            : "Voice note"}
        </Text>
      </View>
    </View>
  );
}

function FileAttachmentCard({
  fileName,
  fileUrl,
  fileSize,
  fileType,
  isUser,
}: {
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  isUser: boolean;
}) {
  const handleOpenFile = async () => {
    if (!fileUrl) return;
    try {
      const canOpen = await Linking.canOpenURL(fileUrl);
      if (canOpen) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert(
          "Attachment",
          `Unable to open this file link directly: ${fileName || "file"}`
        );
      }
    } catch (e) {
      console.warn("Could not open file:", e);
      Alert.alert("Attachment", `Unable to open: ${fileName || "file"}`);
    }
  };

  const isImage =
    fileType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName || "");
  const isPdf =
    fileType === "application/pdf" || /\.pdf$/i.test(fileName || "");

  return (
    <TouchableOpacity
      style={[
        styles.fileCard,
        isUser ? styles.fileCardUser : styles.fileCardAgent,
      ]}
      onPress={handleOpenFile}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.fileIconBox,
          isUser ? styles.fileIconBoxUser : styles.fileIconBoxAgent,
        ]}
      >
        <Ionicons
          name={isImage ? "image" : isPdf ? "document-text" : "document-attach"}
          size={20}
          color="#389E23"
        />
      </View>
      <View style={styles.fileCardInfo}>
        <Text
          numberOfLines={1}
          style={[
            styles.fileNameText,
            isUser ? styles.userText : styles.agentText,
          ]}
        >
          {fileName || "Attachment"}
        </Text>
        <Text
          style={[
            styles.fileSizeText,
            isUser ? styles.userTime : styles.agentTime,
          ]}
        >
          {formatFileSize(fileSize)} • Tap to open
        </Text>
      </View>
      <Ionicons
        name="open-outline"
        size={16}
        color={isUser ? "#FFFFFF" : "#666666"}
      />
    </TouchableOpacity>
  );
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const supportIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetRecipient, setTargetRecipient] = useState<string>("");
  const [conversations, setConversations] = useState<any[]>([]);
  const [showInbox, setShowInbox] = useState(false);

  // Staged document / file attachment
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  } | null>(null);

  // Replying state
  const [replyingTo, setReplyingTo] = useState<{
    _id: string;
    content: string;
    senderName: string;
    isUser: boolean;
  } | null>(null);

  // Active message for action modal (Copy, Reply, Delete)
  const [activeActionMessage, setActiveActionMessage] = useState<any | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleCopy = async (msg: any) => {
    await haptic.selection();
    const text = msg.content || msg.fileName || (msg.isVoiceNote ? "Voice note" : "");
    if (text) {
      await Clipboard.setStringAsync(text);
      showToast("Copied to clipboard");
    }
    setActiveActionMessage(null);
  };

  const handleReply = async (msg: any) => {
    await haptic.lightImpact();
    const isUser = msg.sender === user?._id || msg.sender === "user";
    setReplyingTo({
      _id: msg._id,
      content: msg.content || (msg.isVoiceNote ? "🎙️ Voice note" : (msg.fileName ? `📎 ${msg.fileName}` : "")),
      senderName: isUser ? "You" : "GoPickup Support",
      isUser,
    });
    setActiveActionMessage(null);
  };

  const handleDelete = async (msg: any) => {
    await haptic.warningNotification();
    setActiveActionMessage(null);
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await haptic.heavyImpact();
            setMessages((prev) => prev.filter((m) => m._id !== msg._id));
            if (replyingTo?._id === msg._id) {
              setReplyingTo(null);
            }
            if (msg._id && !msg._id.toString().startsWith("temp-")) {
              try {
                await deleteMessage(msg._id);
                await haptic.successNotification();
              } catch (e) {
                console.error("Error deleting message:", e);
              }
            }
          },
        },
      ]
    );
  };

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  useEffect(() => {
    (async () => {
      try {
        await AudioModule.requestRecordingPermissionsAsync();
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (e) {
        console.warn("Audio init warning:", e);
      }
    })();
  }, []);

  const handleStartRecording = async () => {
    await haptic.mediumImpact();
    try {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert(
          "Microphone Permission",
          "Microphone access is required to record voice notes. Please allow microphone access in your system settings."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error("Failed to start audio recording:", err);
      Alert.alert("Recording Error", "Could not start voice recording. Please try again.");
    }
  };

  const handleCancelRecording = async () => {
    await haptic.lightImpact();
    try {
      await audioRecorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    } catch (err) {
      console.warn("Error cancelling recording:", err);
    }
  };

  const handleStopAndSendRecording = async () => {
    await haptic.heavyImpact();
    try {
      await audioRecorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      const uri = audioRecorder.uri;
      if (!uri) {
        Alert.alert("Notice", "Recording was too short or empty.");
        return;
      }

      const replyData = replyingTo ? {
        messageId: replyingTo._id,
        content: replyingTo.content,
        senderName: replyingTo.senderName,
      } : undefined;

      const optimisticMsg = {
        _id: "temp-" + Date.now(),
        sender: user?._id || "user",
        content: "Voice note",
        isVoiceNote: true,
        voiceNoteUrl: uri,
        replyTo: replyData,
        status: "sent",
        isRead: false,
        createdAt: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setReplyingTo(null);
      setMessages((prev) => [...prev, optimisticMsg]);
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100
      );

      if (targetRecipient) {
        await sendMessage({
          recipientId: targetRecipient,
          content: "Voice note",
          isVoiceNote: true,
          voiceNoteUrl: uri,
          replyTo: replyData,
        });
        await haptic.successNotification();
        setTimeout(fetchMessages, 1200);
      }
    } catch (err) {
      console.error("Failed to stop and send recording:", err);
      Alert.alert("Voice Note Error", "Failed to send voice note. Please try again.");
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        });
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Attachment", "Could not select file. Please try again.");
    }
  };

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
          let adminId = supportIdRef.current;
          if (!adminId) {
            const supportRes = await getSupport();
            adminId = supportRes.data?._id;
            if (adminId) supportIdRef.current = adminId;
          }
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

  useEffect(() => {
    if (!targetRecipient) return;
    AsyncStorage.getItem(`@chat_draft:${targetRecipient}`).then((saved) => {
      if (saved) setInputText(saved);
    }).catch(() => {});
  }, [targetRecipient]);

  useEffect(() => {
    if (!targetRecipient) return;
    const timer = setTimeout(() => {
      if (inputText) {
        AsyncStorage.setItem(`@chat_draft:${targetRecipient}`, inputText).catch(() => {});
      } else {
        AsyncStorage.removeItem(`@chat_draft:${targetRecipient}`).catch(() => {});
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputText, targetRecipient]);

  const handleSend = async () => {
    if (!inputText.trim() && !selectedFile) return;

    const messageText = inputText.trim() || (selectedFile ? selectedFile.name : "");
    const fileToSend = selectedFile;

    setInputText("");
    setSelectedFile(null);
    if (targetRecipient) {
      AsyncStorage.removeItem(`@chat_draft:${targetRecipient}`).catch(() => {});
    }

    const replyData = replyingTo ? {
      messageId: replyingTo._id,
      content: replyingTo.content,
      senderName: replyingTo.senderName,
    } : undefined;

    setReplyingTo(null);
    await haptic.mediumImpact();

    const optimisticMsg = {
      _id: "temp-" + Date.now(),
      sender: user?._id || "user",
      content: messageText,
      ...(fileToSend && {
        fileUrl: fileToSend.uri,
        fileName: fileToSend.name,
        fileSize: fileToSend.size,
        fileType: fileToSend.mimeType,
      }),
      ...(replyData && { replyTo: replyData }),
      status: "sent",
      isRead: false,
      createdAt: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100
    );

    try {
      if (targetRecipient) {
        await sendMessage({
          recipientId: targetRecipient,
          content: messageText,
          replyTo: replyData,
          ...(fileToSend && {
            fileUrl: fileToSend.uri,
            fileName: fileToSend.name,
            fileSize: fileToSend.size,
            fileType: fileToSend.mimeType,
          }),
        });
        await haptic.successNotification();
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
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={16}
                  color="#666666"
                />
                <Text style={styles.systemText}>
                  This chat is directly with our agent.
                </Text>
              </View>

              {/* Header Avatars Group */}
              <View style={styles.avatarPill}>
                {user?.image ? (
                  <Image
                    source={{ uri: user.image }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <View style={[styles.avatarImg, { backgroundColor: "#EBF7EA", alignItems: "center", justifyContent: "center" }]}>
                    <Ionicons name="person" size={16} color="#439D25" />
                  </View>
                )}
                <View style={styles.agentAvatarCircle}>
                  <Ionicons name="headset-outline" size={16} color="#439D25" />
                </View>
              </View>

              {/* Date Text */}
              <Text style={styles.dateText}>Today</Text>

              {/* Message Bubbles */}
              {messages.map((msg, idx) => {
                const isUser =
                  msg.sender === user?._id || msg.sender === "user";
                const timeStr =
                  msg.displayTime ||
                  new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                const isVoiceNote = msg.isVoiceNote || !!msg.voiceNoteUrl;
                const hasFile = !!(msg.fileUrl || msg.fileName);
                const showText =
                  msg.content &&
                  (!isVoiceNote || msg.content !== "Voice note") &&
                  (!hasFile || msg.content !== msg.fileName);

                return (
                  <View
                    key={msg._id || idx}
                    style={[
                      styles.messageRow,
                      isUser ? styles.userRow : styles.agentRow,
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onLongPress={() => {
                        haptic.selection();
                        setActiveActionMessage(msg);
                      }}
                      delayLongPress={220}
                      style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.agentBubble,
                      ]}
                    >
                      {/* Quoted Reply Box */}
                      {msg.replyTo && (
                        <View
                          style={[
                            styles.quotedReplyBox,
                            isUser ? styles.userQuotedBox : styles.agentQuotedBox,
                          ]}
                        >
                          <View
                            style={[
                              styles.quotedReplyBar,
                              isUser ? styles.userQuotedBar : styles.agentQuotedBar,
                            ]}
                          />
                          <View style={styles.quotedReplyContent}>
                            <Text
                              style={[
                                styles.quotedSender,
                                isUser ? styles.userQuotedSender : styles.agentQuotedSender,
                              ]}
                              numberOfLines={1}
                            >
                              {msg.replyTo.senderName || "Replied message"}
                            </Text>
                            <Text
                              style={[
                                styles.quotedText,
                                isUser ? styles.userQuotedText : styles.agentQuotedText,
                              ]}
                              numberOfLines={1}
                            >
                              {msg.replyTo.content}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Interactive Voice Note Audio Player */}
                      {isVoiceNote && (
                        <VoiceNotePlayer
                          uri={msg.voiceNoteUrl}
                          isUser={isUser}
                        />
                      )}

                      {/* Interactive File Attachment Card */}
                      {hasFile && (
                        <FileAttachmentCard
                          fileName={msg.fileName}
                          fileUrl={msg.fileUrl}
                          fileSize={msg.fileSize}
                          fileType={msg.fileType}
                          isUser={isUser}
                        />
                      )}

                      {/* Text content */}
                      {showText ? (
                        <Text
                          style={[
                            styles.messageText,
                            (isVoiceNote || hasFile) && { marginTop: 6 },
                            isUser ? styles.userText : styles.agentText,
                          ]}
                        >
                          {msg.content}
                        </Text>
                      ) : null}

                      <View
                        style={[
                          styles.bubbleFooter,
                          isUser
                            ? styles.userBubbleFooter
                            : styles.agentBubbleFooter,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            isUser ? styles.userTime : styles.agentTime,
                          ]}
                        >
                          {timeStr}
                        </Text>
                        {isUser && (
                          <View style={styles.tickWrapper}>
                            {msg._id?.toString().startsWith("temp-") ||
                            msg.status === "sent" ? (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="rgba(255, 255, 255, 0.65)"
                              />
                            ) : msg.isRead || msg.status === "read" ? (
                              <Ionicons
                                name="checkmark-done"
                                size={15}
                                color="#38BDF8"
                              />
                            ) : (
                              <Ionicons
                                name="checkmark-done"
                                size={15}
                                color="rgba(255, 255, 255, 0.75)"
                              />
                            )}
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.bubbleActionBtn}
                          onPress={() => {
                            haptic.selection();
                            setActiveActionMessage(msg);
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={12}
                            color={isUser ? "rgba(255, 255, 255, 0.7)" : "#888888"}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}

              {messages.length === 0 && !loading && (
                <View style={styles.emptyChatBox}>
                  <Text style={styles.emptyChatTitle}>
                    Live Support Channel
                  </Text>
                  <Text style={styles.emptyChatSub}>
                    Send a message below to chat live with our support team,
                    negotiate rates, or request a driver dispatch.
                  </Text>
                </View>
              )}

              {loading && messages.length === 0 && (
                <ActivityIndicator
                  size="small"
                  color="#389E23"
                  style={{ marginTop: 24 }}
                />
              )}
            </ScrollView>

            {/* Floating Input Bar */}
            <View
              style={[
                styles.inputAreaWrapper,
                (selectedFile || replyingTo || recorderState.isRecording) &&
                  styles.inputAreaWrapperExpanded,
              ]}
            >
              {/* Replying Preview Bar */}
              {replyingTo && !recorderState.isRecording && (
                <View style={styles.replyingBar}>
                  <View style={styles.replyingIndicator} />
                  <View style={styles.replyingTextContainer}>
                    <Text style={styles.replyingToLabel} numberOfLines={1}>
                      Replying to {replyingTo.senderName}
                    </Text>
                    <Text style={styles.replyingContentSnippet} numberOfLines={1}>
                      {replyingTo.content}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      haptic.lightImpact();
                      setReplyingTo(null);
                    }}
                    style={styles.replyCancelBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={20} color="#777777" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Staged file attachment preview chip */}
              {selectedFile && !recorderState.isRecording && (
                <View style={styles.attachmentChip}>
                  <View style={styles.attachmentChipLeft}>
                    <Ionicons
                      name="document-attach"
                      size={16}
                      color="#389E23"
                    />
                    <Text numberOfLines={1} style={styles.attachmentChipName}>
                      {selectedFile.name}
                    </Text>
                    <Text style={styles.attachmentChipSize}>
                      ({formatFileSize(selectedFile.size)})
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedFile(null)}
                    style={styles.attachmentRemoveBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#777777" />
                  </TouchableOpacity>
                </View>
              )}

              {recorderState.isRecording ? (
                /* Live Audio Recording Control Bar */
                <View style={styles.recordingRow}>
                  <TouchableOpacity
                    style={styles.cancelRecordBtn}
                    onPress={handleCancelRecording}
                    accessibilityLabel="Cancel recording"
                  >
                    <Ionicons name="trash-outline" size={20} color="#E53935" />
                    <Text style={styles.cancelRecordText}>Cancel</Text>
                  </TouchableOpacity>

                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingPulseDot} />
                    <Text style={styles.recordingTimerText}>
                      {formatDurationMillis(recorderState.durationMillis)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.sendRecordBtn}
                    onPress={handleStopAndSendRecording}
                    accessibilityLabel="Send voice note"
                  >
                    <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                /* Standard Message Input Bar */
                <View style={styles.inputBarArea}>
                  <View style={styles.inputPill}>
                    <TextInput
                      style={styles.input}
                      placeholder={
                        selectedFile ? "Add an optional caption..." : "Message"
                      }
                      placeholderTextColor="#A0A0A0"
                      value={inputText}
                      onChangeText={setInputText}
                      onSubmitEditing={handleSend}
                      returnKeyType="send"
                    />
                    <View style={styles.inputIcons}>
                      <TouchableOpacity
                        style={styles.iconCircle}
                        accessibilityLabel="Attach file"
                        onPress={handlePickDocument}
                      >
                        <Ionicons name="attach" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconCircle}
                        accessibilityLabel="Voice note"
                        onPress={handleStartRecording}
                      >
                        <Ionicons
                          name="mic-outline"
                          size={18}
                          color="#FFFFFF"
                        />
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
                    <Ionicons
                      name="paper-plane-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Floating Toast Feedback Banner */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Message Action Sheet Modal */}
      <Modal
        visible={activeActionMessage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveActionMessage(null)}
      >
        <TouchableOpacity
          style={styles.actionModalOverlay}
          activeOpacity={1}
          onPress={() => setActiveActionMessage(null)}
        >
          <View style={styles.actionModalCard}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle}>Message Options</Text>
              <TouchableOpacity
                onPress={() => setActiveActionMessage(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color="#666666" />
              </TouchableOpacity>
            </View>

            {activeActionMessage?.content && (
              <View style={styles.actionPreviewBox}>
                <Text numberOfLines={2} style={styles.actionPreviewText}>
                  &quot;{activeActionMessage.content}&quot;
                </Text>
              </View>
            )}

            {/* Reply option */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => handleReply(activeActionMessage)}
            >
              <View style={[styles.actionIconBox, { backgroundColor: "#EBF7EA" }]}>
                <Ionicons name="arrow-undo-outline" size={20} color="#439D25" />
              </View>
              <Text style={styles.actionRowText}>Reply to message</Text>
            </TouchableOpacity>

            {/* Copy option */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => handleCopy(activeActionMessage)}
            >
              <View style={[styles.actionIconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="copy-outline" size={20} color="#2563EB" />
              </View>
              <Text style={styles.actionRowText}>Copy text</Text>
            </TouchableOpacity>

            {/* Delete option */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => handleDelete(activeActionMessage)}
            >
              <View style={[styles.actionIconBox, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </View>
              <Text style={[styles.actionRowText, { color: "#DC2626" }]}>
                Delete message
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 120,
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
    maxWidth: "82%",
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
  bubbleFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  userBubbleFooter: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  agentBubbleFooter: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  timeText: {
    fontSize: 10,
  },
  tickWrapper: {
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  userTime: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  agentTime: {
    color: "#999999",
  },

  /* Voice Note Player Styles */
  voicePlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 185,
    paddingVertical: 2,
  },
  playPauseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  playPauseBtnUser: {
    backgroundColor: "#FFFFFF",
  },
  playPauseBtnAgent: {
    backgroundColor: "#389E23",
  },
  waveformContainer: {
    flex: 1,
  },
  waveformBars: {
    flexDirection: "row",
    alignItems: "center",
    height: 22,
    gap: 2.5,
  },
  waveformBar: {
    width: 2.5,
    borderRadius: 2,
  },
  voiceDurationText: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "600",
  },

  /* File Attachment Card Styles */
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 10,
    minWidth: 190,
    maxWidth: 240,
  },
  fileCardUser: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  fileCardAgent: {
    backgroundColor: "#F5F7F5",
    borderWidth: 1,
    borderColor: "#E6ECE6",
  },
  fileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  fileIconBoxUser: {},
  fileIconBoxAgent: {},
  fileCardInfo: {
    flex: 1,
    marginRight: 8,
  },
  fileNameText: {
    fontSize: 13,
    fontWeight: "600",
  },
  fileSizeText: {
    fontSize: 11,
    marginTop: 2,
  },

  /* Floating Input Bar Styles */
  inputAreaWrapper: {
    position: "absolute",
    bottom: 84,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    marginBottom: 24,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 100,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputAreaWrapperExpanded: {
    borderRadius: 22,
  },
  attachmentChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F6F2",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  attachmentChipLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  attachmentChipName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222222",
    marginLeft: 6,
    maxWidth: "60%",
  },
  attachmentChipSize: {
    fontSize: 11,
    color: "#777777",
    marginLeft: 4,
  },
  attachmentRemoveBtn: {
    padding: 2,
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
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
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
    backgroundColor: "#111111",
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

  /* Recording Bar Styles */
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    paddingHorizontal: 8,
  },
  cancelRecordBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#FFEBEE",
  },
  cancelRecordText: {
    color: "#E53935",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E53935",
    marginRight: 8,
  },
  recordingTimerText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: 0.5,
  },
  sendRecordBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#389E23",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  /* Inbox list styles */
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

  /* Quoted Reply Styles */
  quotedReplyBox: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  userQuotedBox: {
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  agentQuotedBox: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  quotedReplyBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  userQuotedBar: {
    backgroundColor: "#A3E635",
  },
  agentQuotedBar: {
    backgroundColor: "#389E23",
  },
  quotedReplyContent: {
    flex: 1,
  },
  quotedSender: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  userQuotedSender: {
    color: "#FFFFFF",
  },
  agentQuotedSender: {
    color: "#166534",
  },
  quotedText: {
    fontSize: 12,
  },
  userQuotedText: {
    color: "rgba(255, 255, 255, 0.85)",
  },
  agentQuotedText: {
    color: "#4B5563",
  },

  /* Bubble option trigger */
  bubbleActionBtn: {
    marginLeft: 6,
    padding: 2,
  },

  /* Replying Input Bar */
  replyingBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F7F2",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  replyingIndicator: {
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: "#439D25",
    marginRight: 10,
  },
  replyingTextContainer: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#439D25",
  },
  replyingContentSnippet: {
    fontSize: 12.5,
    color: "#4B5563",
    marginTop: 1,
  },
  replyCancelBtn: {
    padding: 2,
  },

  /* Toast Banner */
  toastBanner: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70,
    alignSelf: "center",
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  /* Action Modal Sheet */
  actionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  actionModalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === "ios" ? 38 : 24,
  },
  actionModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  actionModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  actionPreviewBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#439D25",
  },
  actionPreviewText: {
    fontSize: 13,
    color: "#4B5563",
    fontStyle: "italic",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionRowText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
});
