import BackButton from '@/components/ui/BackButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import BaseCard from '@/components/ui/cards/baseCard';
import LeaderboardCard from '@/components/ui/cards/LeaderboardCard';
import QuizCard from '@/components/ui/cards/QuizCard';
import GoalsCard, { Goal } from '@/components/ui/cards/goalsCard';
import GroupCard from '@/components/ui/cards/groupCard';
import { groupCardStyles } from '@/constants/styles/card-styles';

export default function GroupHome() {
    const {id} = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

    React.useEffect(() => {
      // keep mount/unmount logs for debugging only; do not mutate navigator here
      console.log('GroupHome mounted');
      return () => {
        console.log('GroupHome unmounted');
      };
    }, []);

  const groupId = id ? `Group ${id}` : 'Group';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      

      {/* 2x2 grid with horizontal (wide) cards */}
        {/* Top row: Goals (left) + minimal group tile (right) */}
        <View style={styles.gridRow}>
          <View style={styles.gridCol}>
            <GoalsCard
              height={120}
              goals={[
                { label: 'Connections', value: 4, goal: 10, color: '#0a7ea4' },
                { label: 'Posts', value: 1, goal: 3, color: '#342A5f' },
              ]}
            />
          </View>

          <View style={styles.gridCol}>
            <View style={{ width: '100%' }}>
              <View style={[{ height: 110, justifyContent: 'center' }]}>
                <TouchableOpacity style={groupCardStyles.shadowWrap} activeOpacity={0.7} onPress={() => {}}>
                  <View style={[groupCardStyles.row, { paddingVertical: 12 }]}> 
                    <View style={groupCardStyles.content}>
                      <Text numberOfLines={1} style={groupCardStyles.name}>{groupId}</Text>
                      <Text style={{ color: '#6B7280', fontSize: 13 }}>ID: {id}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom rows: full-width Leaderboard then full-width Quiz */}
        <View style={{ width: '70%', alignSelf: 'flex-start', marginTop: 18 }}>
          <LeaderboardCard
            onPress={() => router.push(`/(groups)/${id}/leaderboard` as any)}
            style={{ width: '100%' }}
            height={120}
          />
        </View>

        <View style={{ width: '70%', alignSelf: 'flex-start', marginTop: 12 }}>
          <QuizCard
            onPress={() => router.push(`/(groups)/${id}/quiz` as any)}
            style={{ width: '100%' }}
            height={120}
          />
        </View>

    </ScrollView>
  )

}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  goalsRow: {
    flex: 1,
    justifyContent: 'center',
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  goalsText: {
    fontSize: 14,
    color: '#444',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  twoColumnRowTop: {
    height: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  gridCol: {
    width: '48%'
  },
  infoRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  groupId: {
    fontSize: 14,
    color: '#666',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 28,
    gap: 12,
  },
  largeCardsColumn: {
    marginTop: 28,
    alignItems: 'center',
    gap: 12,
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#fff',
    marginTop: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardWrapper: {
    width: 170,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
