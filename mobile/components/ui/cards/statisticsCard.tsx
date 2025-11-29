import React from "react";
import { Text } from "react-native";
import cardStyles from "../../../constants/styles/card-styles";
import BaseCard from "./baseCard";


interface statsCardProps {
  onPress?: () => void;
  width?: number;
  height?: number;
  streak?: number;
  personalBest?: number;
}

export default function StatisticsCard({
  onPress,
  width = 168,
  height = 168,
  streak,
  personalBest,
}: statsCardProps) {
  return (
    <BaseCard 
      onPress={onPress} 
      width={width}
      height={height}
    >
        <Text style={cardStyles.label}>
           Streak: <Text style={cardStyles.labelBold}>{streak} days</Text>
        </Text>
        <Text style={cardStyles.label}>
           Personal Best: <Text style={cardStyles.labelBold}>{personalBest}</Text>
        </Text>

         {/* we may what one more metric to go here just to even out the page. */}
    </BaseCard>
  );
}