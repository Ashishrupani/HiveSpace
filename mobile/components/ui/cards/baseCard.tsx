import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import cardStyles from "../../../constants/styles/card-styles";
import { colors } from "../../../constants/theme";

//https://github.com/Paraboly/react-native-card/blob/master/lib/components/Card/Card.tsx
//adapted to fit from this open source project

interface BaseCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  backgroundColor?: string;
  borderRadius?: number;
  width?: number;//maybe worth attempting to get this it percent to scale to any device FIXME
  height?: number;// probably should stay a pixel value
}

export default function BaseCard({
  children,
  //defults for the base card changing this will change all cards 
  backgroundColor = colors.shadowbox,
  borderRadius = 12,
  width = 353, //defult card width and height can be overridden 
  height= 150, 
  style,
  ...rest
}: BaseCardProps) {
  return (
    <TouchableOpacity
      style={[
        cardStyles.card,
        { 
          backgroundColor, 
          borderRadius,
          width,
          height,
        },
        style,
      ]}
      activeOpacity={0.7}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}
