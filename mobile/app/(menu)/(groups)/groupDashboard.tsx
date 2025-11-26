import React from 'react'
import { View, ScrollView } from 'react-native';
import groupDashboardStyles from '../../../constants/styles/groupDashboard.styles';
import GroupCard from '@/components/ui/cards/groupCard';
import { useRouter , useNavigation} from 'expo-router';

export default function groupDashboard(){
    const router = useRouter();

    // Sample group data // we will fetch this from backend
    const groups = [
      { id: '1', name: 'Study Buddies', members: 24, iconName: 'timer' },
      { id: '2', name: 'React Learners', members: 12, iconName: 'note.fill' },
      { id: '3', name: 'Design Crew', members: 8, iconName: 'person.crop.circle' },
      { id: '4', name: 'Productivity Champs', members: 42, iconName: 'chart.bar.fill' },
    ];

    const onGroupPress = (id: string) => {
      // navigate to a group detail route (adjust path to your routes)
      router.push(`/(groups)/${id}/groupHome` as any);
    };

    return (
      <ScrollView style={groupDashboardStyles.container}>
        <View style={groupDashboardStyles.scrollContent}>
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              name={g.name}
              members={g.members}
              iconName={g.iconName}
              onPress={() => onGroupPress(g.id)}
            />
          ))}
        </View>
      </ScrollView>
    );
}
