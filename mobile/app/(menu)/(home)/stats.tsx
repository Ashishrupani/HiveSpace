import React from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/constants/theme";

import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";

type Marking = {
  bgColor?: string;
  textColor?: string;
  score?: number; // minutes (optional)
};

const formatDuration = (totalSeconds: number) => {
  const secs = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);

  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export default function StatsScreen() {
  const { getToken } = useAuth();

  const [markedDates, setMarkedDates] = React.useState<Record<string, Marking>>({});
  const [dailyTotals, setDailyTotals] = React.useState<Record<string, number>>({});

  // Default selected day = today
  const [selectedDate, setSelectedDate] = React.useState<string>(isoDate(new Date()));

  const [weeklyTotalSec, setWeeklyTotalSec] = React.useState<number>(0);
  const [currentStreak, setCurrentStreak] = React.useState<number>(0);

  const [activeYear, setActiveYear] = React.useState<number>(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = React.useState<number>(new Date().getMonth() + 1);

  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const buildMarkedDates = React.useCallback(
    (days: Array<{ date: string; totalSeconds: number }>) => {
      const map: Record<string, Marking> = {};

      for (const d of days) {
        const totalMin = Math.floor((d.totalSeconds || 0) / 60);

        // You asked: change “studied day color” to the BLUE instead of purple.
        // So we set a blue palette for study intensity.
        let bgColor = "rgba(255,255,255,0.05)"; // default for 0
        if (totalMin >= 90) bgColor = "rgba(0, 212, 255, 0.85)";
        else if (totalMin >= 30) bgColor = "rgba(0, 212, 255, 0.60)";
        else if (totalMin > 0) bgColor = "rgba(0, 212, 255, 0.40)";

        // Only mark days that actually have time
        if (totalMin > 0) {
          map[d.date] = {
            bgColor,
            textColor: "#fff",
            score: totalMin,
          };
        }
      }

      return map;
    },
    []
  );

  const fetchMonthly = React.useCallback(
    async (year: number, month: number) => {
      if (!API_BASE) return;

      try {
        const token = await getToken();
        const res = await axios.get(`${API_BASE}/api/stats/monthly?year=${year}&month=${month}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const days = Array.isArray(res.data?.days) ? res.data.days : [];

        setMarkedDates(buildMarkedDates(days));

        const totalsMap: Record<string, number> = {};
        for (const d of days) totalsMap[d.date] = Number(d.totalSeconds || 0);
        setDailyTotals(totalsMap);
      } catch (err: any) {
        console.log("[monthly stats error]", err?.response?.status, err?.response?.data || err?.message);
      }
    },
    [API_BASE, buildMarkedDates, getToken]
  );

  const fetchWeekly = React.useCallback(async () => {
    if (!API_BASE) return;

    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE}/api/stats/weekly`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const total = Number(res.data?.weeklyTotalSec ?? res.data?.weeklyTotalSeconds ?? 0);
      setWeeklyTotalSec(total);
    } catch (err: any) {
      console.log("[weekly stats error]", err?.response?.status, err?.response?.data || err?.message);
    }
  }, [API_BASE, getToken]);

  const [personalBest, setPersonalBest] = React.useState<number>(0);

  const fetchStreak = React.useCallback(async () => {
    if (!API_BASE) return;
    try {
      const token = await getToken();
      const res = await axios.get(`${API_BASE}/api/streak`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentStreak(Number(res.data?.currentStreak ?? 0));
      setPersonalBest(Number(res.data?.personalBest ?? 0));
    } catch (err: any) {
      console.log("[streak error]", err?.response?.status, err?.response?.data || err?.message);
    }
  }, [API_BASE, getToken]);

  React.useEffect(() => {
    fetchMonthly(activeYear, activeMonth);
    fetchWeekly();
    fetchStreak();
    
  }, [activeYear, activeMonth, fetchMonthly, fetchWeekly, fetchStreak]);

  const selectedSeconds = dailyTotals[selectedDate] || 0;

  return (
    <LinearGradient
      colors={[
        colors.gradienttop || "#0f0c29",
        colors.gradientmid || "#302b63",
        colors.gradientbottom || "#24243e",
      ]}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        {/* --- Top Cards --- */}
        <View style={styles.headerContainer}>
          {/* TOTAL THIS WEEK */}
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
            style={styles.mainCard}
          >
            <View>
              <Text style={styles.cardLabel}>TOTAL THIS WEEK</Text>
              <Text style={styles.mainStatText}>{formatDuration(weeklyTotalSec)}</Text>
            </View>
            <View style={styles.iconContainer}>
              <View style={styles.iconGlow} />
              <Ionicons name="time" size={32} color="#a5a1ff" />
            </View>
          </LinearGradient>

          {/* CURRENT STREAK + DAY TOTAL */}
          <View style={styles.statsRow}>
            {/* Current Streak */}
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
              style={styles.smallCard}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>CURRENT STREAK</Text>
                <Ionicons name="flame" size={18} color="#FF6B6B" />
              </View>
              <Text style={styles.subStatText}>{currentStreak} Days</Text>
              <Text style={styles.helperText}>Streak counts after 5 min/day</Text>
            </LinearGradient>

            {/* Day Total (selected date) */}
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
              style={styles.smallCard}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>DAY TOTAL</Text>
                <Ionicons name="calendar" size={18} color="#FFD93D" />
              </View>

              <Text style={styles.subStatText}>{formatDuration(selectedSeconds)}</Text>
              <Text style={styles.helperText}>{selectedDate}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* --- Calendar (no "Monthly Activity" text) --- */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarWrapper}>
            <Calendar
              markingType={"custom"}
              markedDates={markedDates}
              monthFormat={"MMMM yyyy"}
              hideExtraDays={true}
              firstDay={0}
              enableSwipeMonths={true}
              onMonthChange={(m) => {
                setActiveYear(m.year);
                setActiveMonth(m.month);
              }}
              dayComponent={({ date, state, marking }: any) => {
                const dateStr = date.dateString; // YYYY-MM-DD
                const hasMark = !!marking;
                const bgColor = marking?.bgColor || "transparent";

                // Every day is clickable (even if 0m)
                return (
                  <View style={styles.dayContainer}>
                    <Pressable
                      onPress={() => setSelectedDate(dateStr)}
                      disabled={state === "disabled"}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          { backgroundColor: hasMark ? bgColor : "rgba(255,255,255,0.03)" },
                          selectedDate === dateStr ? styles.selectedBorder : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            { color: state === "disabled" ? "#444" : hasMark ? "#fff" : "#aaa" },
                          ]}
                        >
                          {date.day}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                );
              }}
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "transparent",
                textSectionTitleColor: "#888",
                monthTextColor: "#fff",
                textMonthFontWeight: "bold",
                textMonthFontSize: 18,
                arrowColor: colors.text || "#fff",

                // Remove default “today” blue circle styling
                todayTextColor: "#fff",
              }}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  headerContainer: {
    marginBottom: 20,
  },

  // --- Cards ---
  mainCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  mainStatText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  iconContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
  },
  iconGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6a5acd",
    opacity: 0.4,
    shadowColor: "#6a5acd",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  smallCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subStatText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  helperText: {
    marginTop: 6,
    color: "#aaa",
    fontSize: 12,
  },

  // --- Calendar ---
  calendarContainer: {
    flex: 1,
    justifyContent: "center",
  },
  calendarWrapper: {
    backgroundColor: "rgba(30, 30, 50, 0.5)",
    borderRadius: 24,
    padding: 10,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
});