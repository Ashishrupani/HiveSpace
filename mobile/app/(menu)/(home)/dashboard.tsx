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
import { useGoals } from "@/contexts/GoalsContext";
import { ThemedText } from "@/components/themed-text";

import axios from "axios";
import { useAuth, useUser } from "@clerk/expo";

export default function Dashboard() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const { getTopThreeGoals } = useGoals();

  const { getToken } = useAuth();
  const { isLoaded, user } = useUser();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [streak, setStreak] = React.useState(0);
  const [personalBest, setPersonalBest] = React.useState(0);

  const displayName =
    user?.firstName ||
    user?.fullName?.split(" ")[0] ||
    user?.username ||
    "there";

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      if (!API_BASE) {
        console.log("[Dashboard] Missing EXPO_PUBLIC_API_URL");
        return;
      }

      const token = await getToken();
      const res = await axios.get(`${API_BASE}/api/streak`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStreak(Number(res.data?.currentStreak ?? 0));
      setPersonalBest(Number(res.data?.personalBest ?? 0));

      console.log("[Dashboard] streak response:", res.data);
    } catch (err: any) {
      console.log(
        "[Dashboard streak error]",
        err?.response?.status,
        err?.response?.data || err?.message
      );
      // keep UI as 0 if it fails
      setStreak(0);
      setPersonalBest(0);
    }
  };

  const onstatspress = () => {
    console.log("stats pressed");
    router.push("/(menu)/(home)/stats"); // if this is your route
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
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          {`Welcome back, ${isLoaded ? displayName : "there"}`}
        </ThemedText>
      </View>

      <View style={styles.topRow}>
        <View style={styles.squareBox}>
          <StatisticsCard
            streak={streak}
            personalBest={personalBest}
            onPress={onstatspress}
            style={styles.cardFill}
          />
        </View>

        <View style={styles.squareBox}>
          <TimerCard
            onPress={ontimerpress}
            style={styles.cardFill}
          />
        </View>
      </View>

      <GoalsCard goals={getTopThreeGoals()} onPress={ongoalsPress} />

      <View style={styles.row}>
        <NotificationsCard
          notifications={mockNotifications}
          width="48%"
          style={styles.notificationRect}
        />
        <MusicCard
          isConnected={spotify.isConnected}
          currentTrack={spotify.currentTrack}
          isPlaying={spotify.isPlaying}
          onLogin={handleSpotifyLogin}
          onPlayPause={handlePlayPause}
          onSkip={handleSkip}
          width="48%"
          style={styles.squareCard}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 1,
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    marginBottom: 16,
  },
  squareBox: {
    width: "48%",
    aspectRatio: 1,
    minHeight: 0,
    overflow: "hidden",
    borderRadius: 16,
  },
  cardFill: {
    flex: 1,
    marginBottom: 0,
    borderRadius: 16,
  },
  notificationRect: {
    height: 170,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: -1,
  },
});