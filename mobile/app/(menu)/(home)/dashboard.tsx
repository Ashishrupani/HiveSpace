import TimerCard from "@/components/ui/timerCard";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useNavigation } from '@react-navigation/native';
import GoalsCard, { Goal } from "../../../components/ui/goalsCard";
import StatisticsCard from "../../../components/ui/statisticsCard";
import pageStyles from "../../../constants/styles/page-styles";
import { SignOutButton } from '@/components/SignOutButton'

export default function dashboard(){
  const router = useRouter();
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    fetchStats();
  }, []);  
  
  const [streak, setStreak] = React.useState(0);
  const [personalBest, setPersonalBest] = React.useState(0);
  const [goals, setGoals] = React.useState<Goal[]>([]);


  const fetchStats = async () => {
    try {
      // const response = await fetch("/api/dashboard");//api call to backend
      // const data = await response.json();
      // This is the just test data makesure we are update components right this will
      // be removed once the api routes are made
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
      
      //use set functions to set the values in each component
      setStreak(data.streak);
      setPersonalBest(data.personalBest);
      setGoals(data.goals);

    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onstatspress = () => {
    console.log("stats pressed");
    //routing for onclick
  };

  const ongoalsPress = () => {
    console.log("goals pressed");
    //routing for onclick
  };

  const ontimerpress = () => {
    console.log("timer pressed");
    //routing for onclick
  };

  return (
    <>
    <SignOutButton />
    <ScrollView style={pageStyles.container}>
      <View style={pageStyles.scrollContent}>

        <StatisticsCard
          streak={streak}
          personalBest={personalBest}
          onPress={onstatspress}
        />
        <GoalsCard 
          goals={goals} 
          onPress={ongoalsPress}
        />

        {/* WIP:group activity card once done */}
        <GoalsCard 
          goals={goals} 
          onPress={ongoalsPress}
        />
{/* horizonal view for placeing half width card side by side */}
        <View style={pageStyles.rowstyles}>
          <TimerCard
            onPress={ontimerpress}
          />
          {/* WIP spotify card ones done */}
          <TimerCard
            onPress={ontimerpress}
          />
        </View>

      </View>
    </ScrollView>
    </>
  );
}
