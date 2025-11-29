import BackButton from '@/components/ui/BackButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import BaseCard from '@/components/ui/cards/baseCard';
import LeaderboardCard from '@/components/ui/cards/LeaderboardCard';
import QuizCard from '@/components/ui/cards/QuizCard';
import GoalsCard from '@/components/ui/cards/goalsCard';
import { useGroupGoals } from '@/contexts/GroupGoalsContext';

export default function GroupHome() {
    const {id} = useLocalSearchParams();
    const navigation = useNavigation();
    const router = useRouter();
    const { getTopThreeGroupGoals } = useGroupGoals();

    const groupId = Array.isArray(id) ? id[0] : id || '1';

    React.useEffect(() => {
      // keep mount/unmount logs for debugging only; do not mutate navigator here
      console.log('GroupHome mounted');
      return () => {
        console.log('GroupHome unmounted');
      };
    }, []);

  const groupName = id ? `Group ${id}` : 'Group';

  const onGroupGoalsPress = () => {
    router.push(`/(groups)/${groupId}/groupGoals` as any);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      

      <GoalsCard 
        goals={getTopThreeGroupGoals(groupId)}
        onPress={onGroupGoalsPress}
      />

        {/* Row: Leaderboard and Group side-by-side, equal widths and heights */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
          <View style={{ width: '49%' }}>
            <LeaderboardCard
              onPress={() => router.push(`/(groups)/${id}/leaderboard` as any)}
              style={{ width: '100%' }}
              height={120}
            />
          </View>

          <View style={{ width: '49%' }}>
            <BaseCard width={'100%'} height={120} onPress={() => {}} style={{ padding: 12, borderRadius: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="people" size={18} color="#342A5f" />
                <Text style={{ fontWeight: '700', color: '#342A5f', marginLeft: 8 }}>{groupName}</Text>
              </View>
              <Text style={{ color: '#666', marginTop: 8 }}>ID: {groupId}</Text>
            </BaseCard>
          </View>
        </View>

        {/* Quiz below (left-aligned under Leaderboard) */}
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
