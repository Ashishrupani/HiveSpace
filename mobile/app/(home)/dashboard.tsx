import TimerCard from "@/components/ui/timerCard";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { Goal } from "../../components/ui/goalsCard";
import StatisticsCard from "../../components/ui/statisticsCard";
import pageStyles from "../../constants/styles/page-styles";


export default function dashboard(){
  const router = useRouter();

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
      //this is the just test data makesure we are update components right
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
    <ScrollView style={pageStyles.container}>
      <View style={pageStyles.scrollContent}>
        {/* <Text style={pageStyles.title}>Dashboard</Text> */}

        <StatisticsCard
          streak={streak}
          personalBest={personalBest}
          onPress={onstatspress}
        />

        {/* <GoalsCard 
          goals={goals} 
          onPress={ongoalsPress}
        /> */}

        <TimerCard
          onPress={ontimerpress}
        />

      </View>
    </ScrollView>
  );
}
