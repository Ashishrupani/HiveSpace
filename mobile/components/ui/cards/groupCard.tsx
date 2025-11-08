import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import BaseCard from './baseCard';
import cardStyles from '../../../constants/styles/card-styles';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { groupCardStyles } from '../../../constants/styles/card-styles';

interface GroupCardProps {
  name: string;
  members: number;
  /** URL for an image logo; if omitted, `iconName` will be used */
  logoUri?: string;
  /** Fallback icon name (SF Symbol key used by IconSymbol) */
  iconName?: string;
  onPress?: () => void;
}

export default function GroupCard({ name, members, logoUri, iconName = 'chevron.left.forwardslash.chevron.right', onPress }: GroupCardProps) {
  return (
    <View style={groupCardStyles.shadowWrap}>
      <BaseCard onPress={onPress} height={110}>
        <View style={groupCardStyles.row}>
        <View style={groupCardStyles.logoWrap}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={groupCardStyles.logoImage} resizeMode="cover" />
          ) : (
            <View style={groupCardStyles.iconCircle}>
              <IconSymbol name={iconName as any} size={36} color="#fff" />
            </View>
          )}
        </View>

        <View style={groupCardStyles.content}>
          <Text numberOfLines={1} style={groupCardStyles.name}>{name}</Text>
          <Text style={cardStyles.label}>{members} members</Text>
        </View>
        </View>
      </BaseCard>
    </View>
  );
}


