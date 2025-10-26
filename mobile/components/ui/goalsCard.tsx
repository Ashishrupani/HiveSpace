import React from "react";
import { Text, View } from "react-native";
import * as Progress from 'react-native-progress';
import cardStyles from "../../constants/styles/card-styles";
import { colors } from "../../constants/theme";
import BaseCard from "./baseCard";

//goal type
export interface Goal {
  label: string;
  value: number;
  goal: number;
  color?: string;
}

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
      
      {goals.map((goal, index) => {
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
          </View>
        );
      })}
    </BaseCard>
  );
}
