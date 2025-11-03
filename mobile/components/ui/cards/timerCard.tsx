import React from "react";
import { Image, View } from "react-native";
import timer from '../../../assets/images/timer_icon.png';
import cardStyles from "../../../constants/styles/card-styles";
import BaseCard from "./baseCard";


interface TimerProps {
  onPress?: () => void;
  width?: number;
  height?: number;
}

export default function TimerCard({
  onPress,
  width = 168,
  height = 168,
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
      <Image 
        source={timer} 
        style={cardStyles.halfwidthImage}
      />
      </View>
    </BaseCard>
  );
}