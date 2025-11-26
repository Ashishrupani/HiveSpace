import BackButton from '@/components/ui/BackButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import BaseCard from '@/components/ui/cards/baseCard';
import GoalsCard, { Goal } from '@/components/ui/cards/goalsCard';

export default function GroupHome() {
    const {id} = useLocalSearchParams();
    const navigation = useNavigation();

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
      <GoalsCard
        height={120}
        goals={[
          { label: 'Connections', value: 4, goal: 10, color: '#0a7ea4' },
          { label: 'Posts', value: 1, goal: 3, color: '#342A5f' },
        ]}
      />

      <View style={styles.centerWrap}>
        <BaseCard height={140} onPress={() => {}}>
          <View style={styles.infoRow}>
            <Text style={styles.groupName}>{groupId}</Text>
            <Text style={styles.groupId}>ID: {id}</Text>
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
