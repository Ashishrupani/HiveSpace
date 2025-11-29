import React from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import cardStyles from "../../../constants/styles/card-styles";
import { colors, Colors } from "../../../constants/theme";
import DashboardCard from "./dashboardCard";
import { Goal } from '@/contexts/GoalsContext';

interface GoalsProps {
  goals: Goal[];
  onPress?: () => void;
  width?: number;
  height?: number;
}

export default function GoalsCard({
  goals,
  onPress,
  width,
  height,
}: GoalsProps) {
  const hasGoals = goals && goals.length > 0;

  return (
    <DashboardCard onPress={onPress} width={width} height={height}>
      <Text style={[cardStyles.labelBold, { color: Colors.light.text }, styles.title]}>Progress Goals</Text>
      
      {!hasGoals && (
        <Text style={styles.emptyText}>
          Great work! All goals have been completed! 🎉
        </Text>
      )}

      {hasGoals &&
        goals.map((goal, index) => {
          const progress = goal.goal > 0 ? goal.value / goal.goal : 0;
          const percentage = Math.round(progress * 100);

          return (
            <View key={index} style={styles.goalBlock}>
              <View style={styles.row}>
                <Text style={styles.label}>{goal.label}</Text>
                <Text style={styles.percentage}>{percentage}%</Text>
              </View>

              <View style={styles.progressWrapper}>
                <Progress.Bar
                  progress={progress}
                  width={null}
                  height={6}
                  color={goal.color || colors.primary}
                  unfilledColor="#E5E7EB"
                  borderWidth={0}
                  borderRadius={20}
                />
              </View>
              
              {goal.dueDate && (
                <Text style={[cardStyles.label, { fontSize: 12, fontStyle: 'italic', marginTop: 4 }]}>
                  Due: {goal.dueDate}
                </Text>
              )}
            </View>
          );
        })}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "rgba(0,0,0,0.6)",
  },
  goalBlock: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    ...cardStyles.label,
    flexShrink: 1,
  },
  percentage: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  progressWrapper: {
    marginTop: 6,
  },
});
