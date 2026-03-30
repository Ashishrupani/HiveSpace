import React from "react";
import { Pressable, StyleSheet, ViewStyle, StyleProp } from "react-native";

interface DashboardCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  width?: number | string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export default function DashboardCard({
  children,
  onPress,
  width = "100%",
  height,
  style,
}: DashboardCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }): StyleProp<ViewStyle> => [
        styles.card,
        width != null ? { width } : null,
        height != null ? { height } : null,
        style,
        pressed ? { opacity: 0.95 } : null, // ✅ no more `false` in array
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
