import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BaseCard from './baseCard';
import Ionicons from '@expo/vector-icons/Ionicons';

type Preview = { name: string; points: number };


type Props = {
  onPress?: () => void;
  width?: number;
  height?: number;
  preview?: Preview[];
};

export default function LeaderboardCard({ onPress, width = 140, height = 120, preview }: Props) {
  const sample: Preview[] = preview ?? [
    { name: 'Prakriti', points: 10 },
    { name: 'Natalia', points: 9 },
    { name: 'Ash', points: 8 },
  ];

  return (
    <BaseCard width={width} height={height} onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="podium" size={18} color="#342A5f" />
        <Text style={styles.headerText}> Leaderboard</Text>
      </View>

      <View style={styles.previewRow}>
        {sample.map((p, i) => (
          <View key={i} style={styles.previewItem}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarInitial}>{getInitials(p.name)}</Text>
            </View>
            <Text style={styles.previewName} numberOfLines={1} ellipsizeMode="tail">
              {p.name}
            </Text>
            <Text style={styles.previewPoints}>{p.points}</Text>
          </View>
        ))}
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontWeight: '700',
    color: '#342A5f',
    marginLeft: 6,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewItem: {
    alignItems: 'center',
    width: 36,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarInitial: {
    fontWeight: '700',
    color: '#342A5f',
  },
  previewName: {
    fontSize: 10,
    color: '#333',
  },
  previewPoints: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
});

function getInitials(name: string) {
  const parts = name.split(' ');
  const first = parts[0] ? parts[0][0] : '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
