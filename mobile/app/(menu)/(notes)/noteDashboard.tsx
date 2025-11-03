import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import NoteCard from "../../../components/ui/cards/noteCard";
import { Colors } from "../../../constants/theme";
import { colors } from "../../../constants/theme";
import cardStyles from "../../../constants/styles/card-styles";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";


export default function NotesDashboard() {
    const router = useRouter();
    const onAddNote=() => console.log("Add new note pressed");
    const notes = [
        {
            title: "History of Artificial Intelligence",
            description: `Artificial Intelligence (AI) has rapidly transformed from a theoretical concept 
into a practical force reshaping industries, economies, and everyday life. 
At its core, AI refers to the simulation of human intelligence processes by machines, 
particularly computer systems. These processes include learning, reasoning, problem-solving,
perception, and language understanding. Machine learning, a subset of AI, enables systems
to automatically improve through experience without being explicitly programmed. `,
            tags: ["AI", "Software", "Technology"],
            time: "2h ago",
        },
        {
            title: "React Native Navigation",
            description:
                "Overview of stack, tab, and drawer navigators with examples of routing between screens using Expo Router.",
            tags: ["Programming", "React Native", "Navigation"],
            time: "5h ago",
        },
        {
            title: "History of Artificial Intelligence",
            description:
                "A timeline of major AI developments, from early rule-based systems to modern machine learning models.",
            tags: ["AI", "History", "Technology"],
            time: "1d ago",
        },
        {
            title: "Calculus: Derivatives and Applications",
            description:
                "Brief notes on basic derivative rules, product/quotient rule, and real-world examples of rate of change.",
            tags: ["Math", "Calculus", "Derivatives"],
            time: "2d ago",
        },
        {
            title: "Thermodynamics Basics and Laws",
            description:
                "A comprehensive summary of the three laws of thermodynamics, focusing on energy and entropy concepts.",
            tags: ["Physics", "Thermodynamics", "Energy"],
            time: "2h ago",
        },
    ];
    
    return (
        <View style={{ flex: 1, backgroundColor: Colors.dark.background }}>
            
            {/* Scrollable Notes List */}
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {notes.length > 0 ? (
                    notes.map((note, index) => (
                        <NoteCard
                            key={index}
                            note={note}
                            onPress={() =>
                                router.push({
                                    pathname: "/(menu)/(notes)/noteView",
                                    params: {
                                        title: note.title,
                                        description: note.description,
                                        tags: JSON.stringify(note.tags),
                                        time: note.time,
                                    },
                                })
                            }
                            width={400}
                            height={150}
                        />
                    ))
                ) : (
                    <View
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 50,
                        }}
                    >
                        <Text style={[cardStyles.label, { color: colors.text }]}>
                            No notes available yet.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Floating Add Button */}
            {onAddNote && (
                <TouchableOpacity
                    onPress={onAddNote}
                    style={{
                        position: "absolute",
                        bottom: 30,
                        right: 25,
                        backgroundColor: colors.primary,
                        borderRadius: 30,
                        padding: 16,
                        elevation: 5,
                    }}
                >
                    <Plus color={colors.accent} size={26} />
                </TouchableOpacity>
            )}
        </View>
    );
}
