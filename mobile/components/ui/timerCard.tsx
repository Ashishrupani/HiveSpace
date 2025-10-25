import React from "react";
import { Text, View } from "react-native";
import cardStyles from "../../constants/styles/card-styles";
import BaseCard from "./baseCard";


interface TimerProps {
  onPress?: () => void;
  width?: number;
  height?: number;
}

export default function TimerCard({
  onPress,
  width = 150,
  height = 150,
}: TimerProps) {
  return (
    <BaseCard 
      onPress={onPress} 
      width={width}
      height={height}
    >
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        {/* need to find and add icon to assets */}
        <Text style={{ fontSize: 48 }}>placeholder</Text>
        <Text style={[cardStyles.label, { marginTop: 8 }]}>Timer</Text>
      </View>
    </BaseCard>
  );
}