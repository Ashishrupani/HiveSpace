import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import DashboardCard from "./dashboardCard";
import spotifyIcon from "../../../assets/images/spotify_icon.png";
import { Ionicons } from '@expo/vector-icons';

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
  style?: StyleProp<ViewStyle>;
}

export default function MusicCard({
  isConnected,
  currentTrack,
  isPlaying,
  onLogin,
  onPlayPause,
  onSkip,
  width = 168,
  height,
  style,
}: MusicProps) {
  if (!isConnected) {
    return (
      <DashboardCard
        onPress={onLogin}
        width={width}
        height={height}
        style={[styles.card, style]}
      >
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Image source={spotifyIcon} style={styles.icon} />
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
      width={width}
      height={height}
      style={[styles.card, style]}
    >
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          {currentTrack?.albumArt ? (
            <Image source={{ uri: currentTrack.albumArt }} style={styles.icon} />
          ) : (
            <Image source={spotifyIcon} style={styles.icon} />
          )}
        </View>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{trackTitle}</Text>
        <Text style={styles.subtitle}>{trackArtist}</Text>
        <View style={{ flexDirection: "row", marginTop: 4, gap: 20 }}>
          <TouchableOpacity onPress={onPlayPause}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={30}
              color="#1DB954"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSkip}>
            <Ionicons name="play-skip-forward" size={30} color="#1DB954" />
          </TouchableOpacity>
        </View>
      </View>
    </DashboardCard>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FAFAFA",
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 12,
    resizeMode: "cover",
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
