import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import DashboardCard from "./dashboardCard";
import spotifyIcon from "../../../assets/images/spotify_icon.png";

interface Track {
  name: string;
  artist: string;
  albumArt: string;
}

interface MusicProps {
  isConnected: boolean;
  currentTrack: Track | null;
  isPlaying: boolean;
  onLogin: () => void;
  onPlayPause: () => void;
  onSkip: () => void;
  width?: number | string;
  height?: number;
}

export default function MusicCard({
  isConnected,
  currentTrack,
  isPlaying,
  onLogin,
  onPlayPause,
  onSkip,
  width = 168,
  height = 168,
}: MusicProps) {
  if (!isConnected) {
    return (
      <DashboardCard
        onPress={onLogin}
        width={width}
        height={height}
        style={styles.card}
      >
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Image source={spotifyIcon} style={styles.iconCircle} />
          </View>

          <Text style={styles.title}>Connect Spotify</Text>
        </View>
      </DashboardCard>
    );
  }

  const trackTitle = currentTrack?.name || "Study Music";
  const trackArtist = currentTrack?.artist || "Spotify";

  return (
    <DashboardCard
      onPress={onPlayPause}
      width={width}
      height={height}
      style={styles.card}
    >
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Image source={spotifyIcon} style={styles.icon} />
        </View>

        <Text style={styles.title}>{trackTitle}</Text>
        <Text style={styles.subtitle}>{trackArtist}</Text>
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FAFAFA",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  title: {
    color: "#0A0000",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(0,0,0,0.6)",
    fontSize: 12,
    marginTop: 3,
    textAlign: "center",
  },
});
