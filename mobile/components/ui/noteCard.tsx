import React from "react";
import { Text, View } from "react-native";
import { colors } from "../../constants/theme";
import cardStyles from "../../constants/styles/card-styles";
import BaseCard from "./baseCard";
import { Clock } from "lucide-react-native";

export interface Note {
    title: string;
    description: string;
    tags: string[];
    time: string;
}

interface NoteCardProps {
    note: Note;
    onPress?: () => void;
    width?: number;
    height?: number;
}

export default function NoteCard({
    note,
    onPress,
    width,
    height = 140,
}: NoteCardProps) {
    return (
        <BaseCard onPress={onPress} width={width} height={height}  >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={[cardStyles.labelBold, { flex: 1 }, { color: "#100101" }]} numberOfLines={1}>
                    {note.title}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    { <Clock color={colors.text} size={14} /> }
                    <Text style={[cardStyles.label, { marginLeft: 4 }]}>{note.time}</Text>
                </View>
            </View>

            <Text
                style={[cardStyles.label, { marginTop: 6 }]}
                numberOfLines={2}
            >
                {note.description}
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 10,
                    gap: 6,
                }}
            >
                {note.tags.map((tag, index) => (
                    <View
                        key={index}
                        style={{
                            borderRadius: 12,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: "500",
                            }}
                        >
                            {tag}
                        </Text>
                    </View>
                ))}
            </View>
        </BaseCard>
    );
}
