import React from 'react';
import { View, Text, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { groupCardStyles } from '../../../constants/styles/card-styles';
import { TouchableOpacity } from "react-native";

interface GroupCardProps {
  name: string;
  members: number;
  about?: string;
  /** URL for an image logo; if omitted, `iconName` will be used */
  logoUri?: string;
  /** Fallback icon name (SF Symbol key used by IconSymbol) */
  iconName?: string;
  color?: string;
  onPress?: () => void;
}

export default function GroupCard({ name, members, about, logoUri, iconName = 'person.3.fill', color, onPress }: GroupCardProps) {
  const accentColor = color || '#342A5f';

  return (
    <TouchableOpacity
      style={[groupCardStyles.shadowWrap, { height: 110 }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={groupCardStyles.row}>
        <View style={{ width: 5, alignSelf: 'stretch', borderRadius: 8, backgroundColor: accentColor }} />
        <View style={groupCardStyles.logoWrap}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={groupCardStyles.logoImage} resizeMode="cover" />
          ) : (
            <View style={[groupCardStyles.iconCircle, { backgroundColor: accentColor }]}>
              <IconSymbol name={iconName as any} size={32} color="#fff" />
            </View>
          )}
        </View>
        <View style={groupCardStyles.content}>
          <Text numberOfLines={1} style={groupCardStyles.name}>{name}</Text>
          <Text numberOfLines={1} style={{ color: '#6B7280', fontSize: 13, marginBottom: 2 }}>
            {about?.trim() || 'A place to collaborate and grow together.'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accentColor, marginRight: 6 }} />
            <Text style={{ color: accentColor, fontWeight: '600', fontSize: 14 }}>{members}</Text>
            <Text style={{ color: '#A3A3A3', fontSize: 13, marginLeft: 4 }}>members</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}