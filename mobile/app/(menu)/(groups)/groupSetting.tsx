import React from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import groupSettingsStyles from '@/constants/styles/group-settings.styles';
import { useRouter } from 'expo-router';
import GroupCardWithJoin from '@/components/ui/cards/groupCardWithJoin';

export default function GroupSetting() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [joined, setJoined] = React.useState<Record<string, boolean>>({});

  // Sample groups - replace with API data
  const groups = React.useMemo(() => [
      { id: '1', name: 'Study Buddies', members: 24, iconName: 'timer' },
      { id: '2', name: 'React Learners', members: 12, iconName: 'note.fill' },
      { id: '3', name: 'Design Crew', members: 8, iconName: 'person.crop.circle' },
      { id: '4', name: 'Productivity Champs', members: 42, iconName: 'chart.bar.fill' },
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
    router.navigate('/(menu)/(groups)/groupSettings/createGroup');
  };

  const onJoinPress = () => {
    router.navigate('/(menu)/(groups)/groupSettings/joinGroup');
  };

  return (
    <ScrollView style={groupSettingsStyles.container}>
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
        <GroupCardWithJoin
          key={item.id}
          id={item.id}
          name={item.name}
          members={item.members}
          iconName={item.iconName}
          isJoined={!!joined[item.id]}
          onJoin={handleJoin}
        />
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}



