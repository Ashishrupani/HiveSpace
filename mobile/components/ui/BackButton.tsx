import React from 'react';
import { Pressable, StyleProp, ViewStyle, useColorScheme, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from 'expo-router';
import { Colors } from '@/constants/theme';

type Props = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
};

export default function BackButton({ onPress, style, size = 24, color }: Props) {
  const navigation = useNavigation();
  const iconColor = color ?? Colors.light.tint;

  const handle = () => {
    if (onPress) return onPress();
    navigation.goBack();
  };

  return (
    <Pressable
      onPress={handle}
      android_ripple={{ color: 'rgba(0,0,0,0.1)', radius: 20, borderless: true }}
      style={({ pressed }) => [
        {
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 50,
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          // iOS shadow
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: 2,
            },
          }),
          opacity: pressed && Platform.OS === 'ios' ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Ionicons name="arrow-back" size={size} color={iconColor} />
    </Pressable>
  );
}