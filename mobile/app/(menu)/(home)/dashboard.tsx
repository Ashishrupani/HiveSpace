import React, { useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

import TimerCard from "@/components/ui/cards/timerCard";
import GoalsCard from "../../../components/ui/cards/goalsCard";
import StatisticsCard from "../../../components/ui/cards/statisticsCard";
import MusicCard from "../../../components/ui/cards/musicCard";
import NotificationsCard from "../../../components/ui/cards/notificationCard"; 
import pageStyles from "../../../constants/styles/page-styles";
import { useSpotify } from "@/hooks/useSpotify";
import { useGoals } from '@/contexts/GoalsContext';

export default function Dashboard() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { getTopThreeGoals } = useGoals();

  const [streak, setStreak] = React.useState(0);
  const [personalBest, setPersonalBest] = React.useState(0);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = {
        profileColor: "#2a5f56ff",
        profileemoji: 4,
        streak: 42,
        personalBest: 7,
      };

      setStreak(data.streak);
      setPersonalBest(data.personalBest);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onstatspress = () => {
    console.log("stats pressed");
  };

  const ongoalsPress = () => {
    console.log("goals pressed");
    router.push("/(menu)/(home)/goals");
  };

  const ontimerpress = () => {
    console.log("timer pressed");
    router.push("/(menu)/(home)/timer");
  };

  const spotify = useSpotify();

  useEffect(() => {
    console.log("[Dashboard] Spotify connected:", spotify.isConnected);
    if (spotify.isConnected) {
      spotify.fetchCurrentTrack();
      const interval = setInterval(spotify.fetchCurrentTrack, 5000);
      return () => clearInterval(interval);
    }
  }, [spotify.isConnected]);

  const handleSpotifyLogin = async () => {
    console.log("[Dashboard] Login button pressed");
    await spotify.login();
  };

  const handlePlayPause = async () => {
    console.log("[Dashboard] Play/Pause pressed");
    await spotify.playPause();
  };

  const handleSkip = async () => {
    console.log("[Dashboard] Skip pressed");
    await spotify.skip();
  };

  const mockNotifications = [
    {
      id: "1",
      title: "New study session started",
      body: "You began a 25-minute focus session.",
      timeAgo: "2h ago",
    },
    {
      id: "2",
      title: "Goal reached",
      body: "Daily scans goal completed!",
      timeAgo: "Yesterday",
    },
    {
      id: "3",
      title: "Goal Progress Updated",
      body: "Daily scans goal completed!",
      timeAgo: "10h ago",
    },
  ];

  return (
    <ScrollView
      style={pageStyles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* little negative margin to pull the first card closer to header */}
    <View style={{ marginTop: -50 }}>
      <StatisticsCard
        streak={streak}
        personalBest={personalBest}
        onPress={onstatspress}
      />
    </View>

      <GoalsCard 
        goals={getTopThreeGoals()} 
        onPress={ongoalsPress}
      />

      {/* Timer + Spotify row */}
      <View style={styles.row}>
        <TimerCard onPress={ontimerpress} width="48%" />
        <MusicCard
          isConnected={spotify.isConnected}
          currentTrack={spotify.currentTrack}
          isPlaying={spotify.isPlaying}
          onLogin={handleSpotifyLogin}
          onPlayPause={handlePlayPause}
          onSkip={handleSkip}
          width="48%"
        />
      </View>

      {/* Notifications section */}
      <NotificationsCard notifications={mockNotifications} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10, // pulls everything up closer to the header
    paddingBottom: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: -1,
  },
});
