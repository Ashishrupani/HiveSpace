import React from 'react';
import { Pressable, StyleProp, ViewStyle, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from 'expo-router';
import { Colors } from '@/constants/theme';

type Props = {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
};

export default function BackButton({ onPress, style, size = 30, color }: Props) {
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const iconColor = color ?? (scheme === 'dark' ? Colors.light.text : Colors.dark.text);

  const handle = () => {
    if (onPress) return onPress();
    // default behavior: navigate back
    navigation.goBack();
  };

  return (
    <Pressable
      onPress={handle}
      style={[
        {
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 50,
          backgroundColor: 'transparent',
          padding: 8,
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 4,
        },
        style,
      ]}
    >
      <Ionicons name="arrow-back" size={size} color={iconColor} />
    </Pressable>
  );
}
