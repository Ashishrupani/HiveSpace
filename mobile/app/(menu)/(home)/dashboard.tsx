import TimerCard from "@/components/ui/cards/timerCard";
import { useRouter } from "expo-router";
import React, { useEffect }from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useNavigation } from '@react-navigation/native';
import GoalsCard from "../../../components/ui/cards/goalsCard";
import StatisticsCard from "../../../components/ui/cards/statisticsCard";
import MusicCard from "../../../components/ui/cards/musicCard"
import pageStyles from "../../../constants/styles/page-styles";
import { SignOutButton } from '@/components/SignOutButton'
import { useSpotify } from '@/hooks/useSpotify';
import { useGoals } from '@/contexts/GoalsContext';

export default function dashboard(){
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { getTopThreeGoals } = useGoals();

  React.useEffect(() => {
    fetchStats();
  }, []);  
  
  const [streak, setStreak] = React.useState(0);
  const [personalBest, setPersonalBest] = React.useState(0);


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
      };
      
      //use set functions to set the values in each component
      setStreak(data.streak);
      setPersonalBest(data.personalBest);

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
    router.push("/(menu)/(home)/goals");
  };

  const ontimerpress = () => {
    console.log("timer pressed");
    //routing for onclick
    router.push("/(menu)/(home)/timer");
  };

  const spotify = useSpotify();

  useEffect(() => {
    console.log('[Dashboard] Spotify connected:', spotify.isConnected);
    if (spotify.isConnected) {
      spotify.fetchCurrentTrack();
      const interval = setInterval(spotify.fetchCurrentTrack, 5000);
      return () => clearInterval(interval);
    }
  }, [spotify.isConnected]);

  const handleSpotifyLogin = async () => {
    console.log('[Dashboard] Login button pressed');
    await spotify.login();
  };

  const handlePlayPause = async () => {
    console.log('[Dashboard] Play/Pause pressed');
    await spotify.playPause();
  };

  const handleSkip = async () => {
    console.log('[Dashboard] Skip pressed');
    await spotify.skip();
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
          goals={getTopThreeGoals()} 
          onPress={ongoalsPress}
        />

        {/* WIP:group activity card once done */}
{/* horizonal view for placeing half width card side by side */}
        <View style={pageStyles.rowstyles}>
          {/* WIP spotify card ones done */}
          <TimerCard
            onPress={ontimerpress}
          />
          <MusicCard
            isConnected={spotify.isConnected}
            currentTrack={spotify.currentTrack}
            isPlaying={spotify.isPlaying}
            onLogin={handleSpotifyLogin}
            onPlayPause={handlePlayPause}
            onSkip={handleSkip}
          />
        </View>

      </View>
    </ScrollView>
    </>
  );
}
