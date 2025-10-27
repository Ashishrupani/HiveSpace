import React from 'react'
import { View, ScrollView} from 'react-native';
import pageStyles from '@/constants/styles/page-styles';
import GoalsCard from '@/components/ui/goalsCard';

export default function groupDashboard(){
    const data = {
        profileColor: '#2a5f56ff',
        profileemoji: 4 ,
        streak: 42,
        personalBest: 7,
        goals: [
          { label: "Daily Scans", value: 7, goal: 10, color: "#00A650" },
          { label: "Study Time", value: 45, goal: 60, color: "#FFB800" },
          { label: "Notes Created", value: 15, goal: 20, color: "#007AFF" },
        ]
      };
        const goals = data.goals;
    const ongoalsPress = () => {
    console.log("goals pressed");
    //routing for onclick
  };
    return (<ScrollView style={pageStyles.container}>
          <View style={pageStyles.scrollContent}>
            <GoalsCard 
                      goals={goals} 
                      onPress={ongoalsPress}
                    />
          </View>
        </ScrollView>);
}
