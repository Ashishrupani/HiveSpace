import BackButton from '@/components/ui/BackButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import BaseCard from '@/components/ui/cards/baseCard';
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
        height={200}
        goals={getTopThreeGroupGoals(groupId)}
        onPress={onGroupGoalsPress}
      />

      <View style={styles.centerWrap}>
        <BaseCard height={140} onPress={() => {}}>
          <View style={styles.infoRow}>
            <Text style={styles.groupName}>{groupName}</Text>
            <Text style={styles.groupId}>ID: {groupId}</Text>
          </View>
        </BaseCard>
      </View>

    </ScrollView>
  )
}

// Temporary styles for the GroupHome screen; these should be moved to a separate file and imported as needed
// Note: These styles are just placeholders and should be refined based on the actual design requirements
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
});
