import React from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import pageStyles from '@/constants/styles/page-styles';
import authStyles from '@/constants/styles/auth.styles';
import GroupCard from '@/components/ui/cards/groupCard';
import { useRouter } from 'expo-router';

export default function GroupSetting() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [joined, setJoined] = React.useState<Record<string, boolean>>({});

  // Sample groups - replace with API data
  const groups = React.useMemo(() => [
    { id: 'g1', name: 'Study Buddies', members: 24 },
    { id: 'g2', name: 'React Learners', members: 12 },
    { id: 'g3', name: 'Design Crew', members: 8 },
    { id: 'g4', name: 'Productivity Champs', members: 42 },
    { id: 'g5', name: 'Book Club', members: 16 },
  ], []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(g => g.name.toLowerCase().includes(q));
  }, [groups, query]);

  const handleJoin = (id: string, name: string) => {
    // TODO: call real API to join group
    setJoined(prev => ({ ...prev, [id]: true }));
    Alert.alert('Joined', `You joined ${name}`);
  }

  const onCreatePress = () => {
    // navigate to the create group screen
    router.push('/groups/createGroup' as any);
  }

  return (
    <>
    <ScrollView style={pageStyles.container}>
      <View style={pageStyles.scrollContent}>
        <TextInput
          placeholder="Search groups"
          value={query}
          onChangeText={setQuery}
          style={[authStyles.input, { marginBottom: 12 }]}
        />

        {filtered.map((item) => (
          <View key={item.id} style={{ marginBottom: 8 }}>
            <GroupCard name={item.name} members={item.members} onPress={() => {}} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              {joined[item.id] ? (
                <TouchableOpacity style={[authStyles.button, { backgroundColor: '#6c757d' }]} disabled>
                  <Text style={authStyles.buttonText}>Joined</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={authStyles.button} onPress={() => handleJoin(item.id, item.name)}>
                  <Text style={authStyles.buttonText}>Join</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
    </>
  )
}



