import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DashboardCard from "./dashboardCard";
import cardStyles from "../../../constants/styles/card-styles";
import { colors, Colors } from "@/constants/theme";

interface StatisticsProps {
  streak: number;
  personalBest: number;
  onPress?: () => void;
  width?: number | string;
  height?: number;
}

export default function StatisticsCard({
  streak,
  personalBest,
  onPress,
  width,
  height,
}: StatisticsProps) {
  return (
    <DashboardCard onPress={onPress} width={width} height={height}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="flame" size={22} color="#FF6B6B" style={styles.fireIcon} />
          <Text style={[cardStyles.labelBold, styles.title, { color: Colors.light.text }]}>Streak</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.metricBlock}>
          <Text style={[cardStyles.label, styles.metricLabel]}>Current Streak</Text>
          <Text style={styles.metricValue}>{streak}</Text>
          <Text style={styles.metricSubtext}>{streak === 1 ? "Day" : "Days"}</Text>
        </View>

        <View style={styles.metricBlock}>
          <Text style={[cardStyles.label, styles.metricLabel]}>Personal Best</Text>
          <Text style={styles.metricValue}>{personalBest}</Text>
          <Text style={styles.metricSubtext}>{personalBest === 1 ? "Day" : "Days"}</Text>
        </View>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fireIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricBlock: {
    flex: 1,
    paddingVertical: 6,
  },
  metricLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
});
