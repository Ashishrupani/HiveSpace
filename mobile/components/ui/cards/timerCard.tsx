import React from "react";
import { Image, View, Text, StyleSheet } from "react-native";
import timer from "../../../assets/images/timer_icon.png";
import DashboardCard from "./dashboardCard";

interface TimerProps {
  onPress?: () => void;
  width?: number | string;
  height?: number;
}

export default function TimerCard({
  onPress,
  width = 168,
  height = 168,
}: TimerProps) {
  return (
    <DashboardCard
      onPress={onPress}
      width={width}
      height={height}
      style={styles.card}
    >
      <View style={styles.content}>
        {/* your existing watch/timer icon */}
        <View style={styles.iconCircle}>
          <Image source={timer} style={styles.iconCircle} />
        </View>

        <Text style={styles.title}>Start Session</Text>
        <Text style={styles.subtitle}>Focus timer</Text>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1d0536ff", // purple background
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 3,
  },
});
