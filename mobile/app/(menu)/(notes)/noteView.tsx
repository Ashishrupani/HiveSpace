import React, { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { colors } from "../../../constants/theme";
import { Colors } from "../../../constants/theme";
import cardStyles from "../../../constants/styles/card-styles";
import { Clock } from "lucide-react-native";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import BackButton from "@/components/ui/BackButton";

export default function NoteView() {
    // Receive note data passed from noteDashboard.tsx
    const { title, description, tags, time } = useLocalSearchParams<{
        title: string;
        description: string;
        tags: string;
        time: string;
    }>();

    // Parse tags back from JSON
    const parsedTags = tags ? JSON.parse(tags) : [];

    const router = useRouter();
    const navigation = useNavigation();

    return (
        <>
        <BackButton color={Colors.dark.text} />
        <ScrollView
            style={{
                flex: 1,
                backgroundColor: Colors.dark.background,
                paddingHorizontal: 20,
                paddingVertical: 24,
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Note Title & Time */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                }}
            >
                <Text
                    style={[
                        cardStyles.labelBold,
                        { fontSize: 22, color: colors.accent, flex: 1 },
                    ]}
                    numberOfLines={2}
                >
                    {title}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock color={colors.text} size={16} />
                    <Text
                        style={[cardStyles.label, { marginLeft: 4, color: colors.text }]}
                    >
                        {time}
                    </Text>
                </View>
            </View>

            {/* Tags */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
                {parsedTags.map((tag: string, index: number) => (
                    <View
                        key={index}
                        style={{
                            //backgroundColor: colors.secondary,
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            marginRight: 8,
                            marginBottom: 8,
                        }}
                    >
                        <Text style={{ color: colors.accent, fontSize: 12 }}>{tag}</Text>
                    </View>
                ))}
            </View>

            {/* Full Description */}
            <Text
                style={[
                    cardStyles.label,
                    {
                        color: colors.accent,
                        lineHeight: 22,
                        fontSize: 15,
                    },
                ]}
            >
                {description}
            </Text>
        </ScrollView>
        </>
    );
}
