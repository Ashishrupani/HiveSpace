import authStyles from '@/constants/styles/auth.styles';
import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { colors } from "../../constants/theme";

interface HexagonDialProps {
  progress: number;
  timeDisplay: string; 
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
}

// https://stackoverflow.com/questions/52172067/create-svg-hexagon-points-with-only-only-a-length
// adapted from this stack overflow question.
const createHexagonPath = (centerX: number, centerY: number, radius: number) => {
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const angle_deg = 60 * i - 90;  // -90° to start at top
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = centerX + radius * Math.cos(angle_rad);
    const y = centerY + radius * Math.sin(angle_rad);
    return `${x},${y}`;
  }).join(' ');
};

export default function HexagonDial({
  progress,
  timeDisplay,
  size = 300,
  strokeWidth = 6,
  color = colors.gradientbottom,
}: HexagonDialProps) {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 6 * radius; //perimeter for how far to space the dash by

  return (
    <View style={{justifyContent: 'center',alignItems: 'center',}}>
      <Svg height={size} width={size}>
        
        <Polygon
          points={createHexagonPath(center, center, radius)}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * progress}
        />
      </Svg>
      
      <View style={{position:'absolute'}}>
        <Text style={[authStyles.mainTitle, { color: colors.primary }]}>{timeDisplay}</Text>
      </View>
    </View>
  );
}
