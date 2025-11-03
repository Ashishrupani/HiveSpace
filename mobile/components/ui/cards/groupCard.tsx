import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import BaseCard from './baseCard';
import cardStyles from '../../../constants/styles/card-styles';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
    <BaseCard onPress={onPress} height={110}>
      <View style={styles.row}>
        <View style={styles.logoWrap}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoImage} resizeMode="cover" />
          ) : (
            <View style={styles.iconCircle}>
              <IconSymbol name={iconName as any} size={36} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.name}>{name}</Text>
          <Text style={cardStyles.label}>{members} members</Text>
        </View>
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#342A5f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
});
