import { useNavigation, useRouter } from 'expo-router';
import HexagonDial from '@/components/ui/timerdial';
import pageStyles from '@/constants/styles/page-styles';
import colors from '@/constants/theme';
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, TouchableOpacity, View } from 'react-native';

import axios from "axios";
import { useAuth } from "@clerk/expo";

// This is adapted from this open source project
// https://github.com/nabendu82/TimerReactNative/blob/master/App/index.js
const formatNumber = (number: number) => `0${number}`.slice(-2);

const getRemaining = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = time - mins * 60;
  return { mins: formatNumber(mins), secs: formatNumber(secs) };
};

export default function TabTwoScreen() {
  const [remainingSecs, setremainingSecs] = useState(10 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(10);

  // Tracks if a "session attempt" has started (even if paused/resumed)
  const [sessionStarted, setSessionStarted] = useState(false);

  const { mins, secs } = getRemaining(remainingSecs);
  const timeDisplay = `${mins}:${secs}`;

  const router = useRouter();
  const navigation = useNavigation();

  const { getToken } = useAuth();

  const totalPlannedSec = useMemo(() => initialTime * 60, [initialTime]);

  // How much time user actually studied in this run (ignores pause time)
  const elapsedSec = useMemo(() => {
    return Math.max(0, totalPlannedSec - remainingSecs);
  }, [totalPlannedSec, remainingSecs]);

  const saveSession = async (durationSec: number) => {
    if (durationSec <= 0) return;

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - durationSec * 1000);

    try {
      const token = await getToken();

      console.log("API BASE:", process.env.EXPO_PUBLIC_API_URL);
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/sessions`,
        {
          startTime,
          endTime,
          durationSec,
          mode: "focus",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Session saved:", durationSec, "sec");
    } catch (err) {
      console.error("❌ Failed to save session:", err);
    }
  };

  const ontimerpress = () => {
    // If starting from stopped -> mark session started
    if (!isActive && remainingSecs > 0) {
      setSessionStarted(true);
    }
    setIsActive(!isActive);
  };

  const onResetPress = async () => {
    // If user studied something, save it before resetting
    if (sessionStarted && elapsedSec > 0) {
      await saveSession(elapsedSec);
    }

    setIsActive(false);
    setSessionStarted(false);
    setremainingSecs(totalPlannedSec);
  };

  const onTimeChange = (text: string) => {
    const time = parseInt(text) || 0;
    setInitialTime(time);
    setremainingSecs(time * 60);
  };

  useEffect(() => {
    if (!isActive || remainingSecs === 0) return;

    const interval = setInterval(() => {
      setremainingSecs((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, remainingSecs]);

  // When timer finishes (hits 0), save full elapsed study time
  useEffect(() => {
    const finished = remainingSecs === 0 && sessionStarted;
    if (!finished) return;

    (async () => {
      setIsActive(false);
      await saveSession(elapsedSec); // should be totalPlannedSec if it ran fully
      setSessionStarted(false);
      // Optionally reset to initialTime after finishing:
      // setremainingSecs(totalPlannedSec);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSecs]);

  return (
    <View style={pageStyles.timerdial}>
      <Pressable
        onPress={() => router.push("/dashboard")}
        style={{
          ...pageStyles.button,
          position: 'absolute',
          top: 16,
          left: 16,
          width: 44,
          height: 44,
          paddingTop: 0,
          marginTop: 0,
          marginBottom: 0,
        }}
      >
        <Ionicons name="arrow-back" size={26} color={colors.gradientbottom} />
      </Pressable>

      <HexagonDial
        progress={totalPlannedSec === 0 ? 0 : 1 - (remainingSecs / totalPlannedSec)}
        timeDisplay={timeDisplay}
        size={300}
        color={colors.gradientbottom}
        backgroundColor={colors.primary}
      />

      <View style={{
        width: '100%',
        maxWidth: 260,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 0,
        marginTop: 60,
        marginBottom: 16,
        alignSelf: 'center',
      }}>
        <TouchableOpacity
          style={[pageStyles.button, { width: 72, height: 50 }]}
          onPress={onResetPress}
        >
          <Ionicons
            name="reload"
            size={26}
            color={colors.gradientbottom}
          />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <TouchableOpacity
            style={[pageStyles.button, { width: 72, height: 50 }]}
            onPress={ontimerpress}
          >
            <Ionicons
              name={isActive ? 'pause' : 'play'}
              size={26}
              color={colors.gradientbottom}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[pageStyles.input, { width: 72, textAlign: 'center', marginBottom: 0 }]}
          keyboardType="numeric"
          value={String(initialTime)}
          onChangeText={onTimeChange}
          editable={!isActive}
          maxLength={4}
          selectTextOnFocus
          returnKeyType="done"
        />
      </View>
    </View>
  );
}