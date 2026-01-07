import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface RatingModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    riderName: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
    visible,
    onClose,
    onSubmit,
    riderName,
}) => {
    const [rating, setRating] = useState(3);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [feedback, setFeedback] = useState("");
    const [tip, setTip] = useState<number | null>(null);

    const emojis = [
        { level: 1, char: "😡", label: "Terrible" },
        { level: 2, char: "😟", label: "Bad" },
        { level: 3, char: "😐", label: "Not too bad" },
        { level: 4, char: "😊", label: "Good" },
        { level: 5, char: "🤩", label: "Excellent" },
    ];

    const tags = ["Handoff", "Communication", "Hygiene", "Speed", "Politeness"];
    const tipOptions = [400, 500, 1000];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((t) => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleConfirm = () => {
        onSubmit({
            rating,
            experience: emojis[rating - 1].label,
            tags: selectedTags,
            feedback,
            tip: tip || 0,
        });
        // Reset state
        setRating(3);
        setSelectedTags([]);
        setFeedback("");
        setTip(null);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <View style={styles.scoreBadge}>
                            <Text style={styles.scoreEmoji}>😎</Text>
                            <Text style={styles.scoreText}>up to 10 points</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.riderSection}>
                            <View style={styles.riderIconBg}>
                                <Ionicons name="person" size={50} color="#606060" />
                            </View>
                            <Text style={styles.modalTitle}>How did {riderName} do?</Text>
                            <Text style={styles.modalSubtitle}>Tell us about your experience</Text>
                        </View>

                        <View style={styles.emojiContainer}>
                            {emojis.map((item) => (
                                <TouchableOpacity
                                    key={item.level}
                                    onPress={() => setRating(item.level)}
                                    style={[
                                        styles.emojiItem,
                                        rating === item.level && styles.selectedEmojiItem,
                                    ]}
                                >
                                    <Text style={styles.emojiChar}>{item.char}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.ratingLabel}>{emojis[rating - 1].label}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>What went wrong?</Text>
                        <View style={styles.tagsContainer}>
                            {tags.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    onPress={() => toggleTag(tag)}
                                    style={[
                                        styles.tagBtn,
                                        selectedTags.includes(tag) && styles.selectedTagBtn,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.tagText,
                                            selectedTags.includes(tag) && styles.selectedTagText,
                                        ]}
                                    >
                                        {tag} +
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Tell us more*</Text>
                        <TextInput
                            style={styles.feedbackInput}
                            placeholder="Add a detailed review"
                            multiline
                            value={feedback}
                            onChangeText={setFeedback}
                        />

                        <Text style={styles.sectionTitle}>Tip your rider</Text>
                        <Text style={styles.tipSubtitle}>The rider gets 100% of every tip</Text>
                        <View style={styles.tipContainer}>
                            {tipOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setTip(option)}
                                    style={[
                                        styles.tipBtn,
                                        tip === option && styles.selectedTipBtn,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.tipText,
                                            tip === option && styles.selectedTipText,
                                        ]}
                                    >
                                        ₦{option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={styles.tipBtn}>
                                <Text style={styles.tipText}>Custom</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                            <Text style={styles.confirmBtnText}>Submit Review</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: "90%",
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    scoreBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF7EE",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#439D25",
    },
    scoreEmoji: {
        fontSize: 14,
        marginRight: 6,
    },
    scoreText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#439D25",
    },
    riderSection: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    riderIconBg: {
        width: 100,
        height: 100,
        borderRadius: 15,
        backgroundColor: "#FFF9E6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#000",
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: "#808080",
    },
    emojiContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 15,
        marginVertical: 20,
    },
    emojiItem: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    selectedEmojiItem: {
        backgroundColor: "#0B4B36",
        borderColor: "#0B4B36",
    },
    emojiChar: {
        fontSize: 24,
    },
    ratingLabel: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        color: "#DAA520",
        marginBottom: 20,
    },
    divider: {
        height: 8,
        backgroundColor: "#F8F9FA",
        marginHorizontal: -20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
        marginBottom: 10,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
    },
    tagBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#F5F5F5",
    },
    selectedTagBtn: {
        backgroundColor: "#000",
    },
    tagText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
    selectedTagText: {
        color: "#FFF",
    },
    feedbackInput: {
        backgroundColor: "#F5F5F5",
        borderRadius: 15,
        padding: 15,
        height: 100,
        textAlignVertical: "top",
        marginBottom: 20,
    },
    tipSubtitle: {
        fontSize: 14,
        color: "#808080",
        marginBottom: 15,
    },
    tipContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 30,
    },
    tipBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        alignItems: "center",
    },
    selectedTipBtn: {
        borderColor: "#439D25",
        backgroundColor: "#EFF7EE",
    },
    tipText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
    },
    selectedTipText: {
        color: "#439D25",
    },
    confirmBtn: {
        backgroundColor: "#439D25",
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: "center",
        marginBottom: 30,
    },
    confirmBtnText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
});

export default RatingModal;
