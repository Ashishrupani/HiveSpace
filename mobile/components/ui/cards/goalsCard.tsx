import React from "react";
import { Text, View } from "react-native";
import * as Progress from 'react-native-progress';
import cardStyles from "../../../constants/styles/card-styles";
import { colors } from "../../../constants/theme";
import BaseCard from "./baseCard";
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
  height = 200,
}: GoalsProps) {
  return (
    <BaseCard 
      onPress={onPress} 
      width={width}
      height={height}
    >
      <Text style={[cardStyles.labelBold]}>Goals</Text>
      
      {goals.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }}>
          <Text style={[cardStyles.label, { textAlign: 'center', fontSize: 16, color: colors.primary }]}>
            Great work! All goals have been completed! 🎉
          </Text>
        </View>
      ) : (
        goals.map((goal, index) => {
          const progress = goal.goal > 0 ? goal.value / goal.goal : 0;
          const percentage = Math.round(progress * 100);
          
          return (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={cardStyles.rowstyles}>
                <Text style={cardStyles.label}>{goal.label}</Text>
                <Text style={cardStyles.label}>{percentage}%</Text>
              </View>
              {/* for full documentation https://github.com/oblador/react-native-progress  */}
              <Progress.Bar 
                progress={progress}
                width={null}
                height={10}
                color={goal.color || colors.primary}
                unfilledColor= {colors.text}
                borderWidth={0}
                borderRadius={5}
              />
              {goal.dueDate && (
                <Text style={[cardStyles.label, { fontSize: 12, fontStyle: 'italic', marginTop: 4 }]}>
                  Due: {goal.dueDate}
                </Text>
              )}
            </View>
          );
        })
      )}
    </BaseCard>
  );
}
