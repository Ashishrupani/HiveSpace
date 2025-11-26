import React from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import pageStyles from '@/constants/styles/page-styles';
import groupSettingsStyles from '@/constants/styles/group-settings.styles';
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
    router.push('/(menu)/(groups)/groupSettings/createGroup');
  };

  const onJoinPress = () => {
    router.push('/(menu)/(groups)/groupSettings/joinGroup');
  };

  return (
    <ScrollView style={groupSettingsStyles.container}>
      {/* Navigation buttons for Create and Join Group */}
      <View style={[groupSettingsStyles.navRow, { marginBottom: 28 }]}> 
        <TouchableOpacity style={groupSettingsStyles.navButton} onPress={onCreatePress}>
          <Text style={groupSettingsStyles.navButtonText}>Create a Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={groupSettingsStyles.navButton} onPress={onJoinPress}>
          <Text style={groupSettingsStyles.navButtonText}>Join a Group</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search groups"
        value={query}
        onChangeText={setQuery}
        style={[groupSettingsStyles.searchInput, { marginBottom: 28 }]}
        placeholderTextColor="#b0b0b0"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {filtered.map((item) => (
        <View key={item.id} style={[groupSettingsStyles.cardContainer, { backgroundColor: '#F6F7F9', padding: 0, marginBottom: 22 }]}> 
          <GroupCard name={item.name} members={item.members} onPress={() => {}} />
          <View style={[groupSettingsStyles.joinRow, { marginRight: 12, marginBottom: 8 }]}> 
            {joined[item.id] ? (
              <TouchableOpacity style={groupSettingsStyles.joinedButton} disabled>
                <Text style={groupSettingsStyles.joinButtonText}>Joined</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={groupSettingsStyles.joinButton} onPress={() => handleJoin(item.id, item.name)}>
                <Text style={groupSettingsStyles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}



