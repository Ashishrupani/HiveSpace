import React from "react";
import { Pressable, TextInput, TouchableOpacity, View, Text, Image } from 'react-native';
import cardStyles from "../../../constants/styles/card-styles";
import BaseCard from "./baseCard";
import {colors} from '@/constants/theme'
import { Ionicons } from "@expo/vector-icons";
import { useSpotify } from '@/hooks/useSpotify';

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
  width?: number;
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
      <BaseCard onPress={onLogin} width={width} height={height}>
        <View style={cardStyles.centeredContainer}>
          <Text style={cardStyles.labelBold}>Connect Spotify</Text>
        </View>
      </BaseCard>
    );
  }

  return (
    <BaseCard width={width} height={height}>
      <View style={cardStyles.centeredContainer}>
        {currentTrack && (
          <Image 
            source={{ uri: currentTrack.albumArt }} 
            style={cardStyles.albumArt}
          />
        )}

        <View style={cardStyles.controlsRow}>
          <TouchableOpacity onPress={onPlayPause}>
            <Ionicons 
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={64} 
              color={colors.gradientbottom}
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onSkip}>
            <Ionicons 
              name="play-forward" 
              size={48} 
              color={colors.gradientbottom}
            />
          </TouchableOpacity>
        </View>
      </View>
    </BaseCard>
  );
}