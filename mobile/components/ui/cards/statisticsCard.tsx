import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import DashboardCard from "./dashboardCard";
import cardStyles from "../../../constants/styles/card-styles";
import streakIcon from "../../../assets/images/streak_icon.png"; 
import {colors, Colors} from "@/constants/theme";

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
      {/* Top row: title on left, icon on right */}
      <View style={styles.headerRow}>
        <Text style={[cardStyles.labelBold, styles.title, {color: Colors.light.text},]}>
          Streak
        </Text>
        <Image source={streakIcon} style={styles.icon} />
      </View>

      {/* Same text rows as before */}
      <View style={styles.row}>
        <Text style={cardStyles.label}>Current Streak:</Text>
        <Text style={styles.value}>3 days</Text>
      </View>

      <View style={styles.row}>
        <Text style={cardStyles.label}>Personal Best:</Text>
        <Text style={styles.value}>{personalBest} days</Text>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2F2A5A", // same purple you use for numbers
  },
});
