import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/constants/theme'; // Assuming this path exists based on your snippet

// Helper to get screen width for responsive sizing
const { width, height } = Dimensions.get('window');

export default function StatsScreen() {
  // FIXED: Updated data to actually reflect a 2-day streak (Today + Yesterday)
  // and removed the contradiction.
  const data = {
    '2025-10-27': { bgColor: 'rgba(112, 96, 165, 0.4)', textColor: '#fff', score: 2 },
    '2025-10-28': { bgColor: 'rgba(131, 114, 186, 0.6)', textColor: '#fff', score: 4 },
    '2025-10-29': { bgColor: 'rgba(157, 137, 222, 0.8)', textColor: '#fff', score: 6 },
    '2025-10-30': { bgColor: '#8372ba', textColor: '#fff', score: 8 },
    '2025-10-31': { bgColor: 'rgba(112, 96, 165, 0.4)', textColor: '#fff', score: 3 },

    // Previous cluster
    '2025-11-02': { bgColor: 'rgba(112, 96, 165, 0.5)', textColor: '#fff', score: 5 },
    '2025-11-03': { bgColor: 'rgba(112, 96, 165, 0.5)', textColor: '#fff', score: 5 },

    // Current Week Streak (Yesterday + Today)
    '2025-11-25': { bgColor: 'rgba(131, 114, 186, 0.6)', textColor: '#fff', score: 4 },
    '2025-11-26': { bgColor: colors.accent || '#00D4FF', textColor: '#fff', isToday: true },
  } as any;

  return (
    <LinearGradient
      colors={[colors.gradienttop || '#0f0c29', colors.gradientmid || '#302b63', colors.gradientbottom || '#24243e']}
      style={styles.container}
    >
      {/* FIXED: Removed ScrollView, using View with flex: 1 to fit on one page */}
      <View style={styles.contentContainer}>

        {/* --- Top Stats Section --- */}
        <View style={styles.headerContainer}>

          {/* Main Card: Total This Week */}
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.mainCard}
          >
            <View>
              <Text style={styles.cardLabel}>TOTAL THIS WEEK</Text>
              {/* FIXED: Updated time to be realistic for 2 days of activity */}
              <Text style={styles.mainStatText}>12h 30m</Text>
            </View>
            <View style={styles.iconContainer}>
              <View style={styles.iconGlow} />
              <Ionicons name="time" size={32} color="#a5a1ff" />
            </View>
          </LinearGradient>

          {/* Row for Streak & Best */}
          <View style={styles.statsRow}>
            {/* Current Streak */}
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.smallCard}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>CURRENT STREAK</Text>
                <Ionicons name="flame" size={18} color="#FF6B6B" />
              </View>
              <Text style={styles.subStatText}>2 Days</Text>
            </LinearGradient>

            {/* Personal Best */}
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.smallCard}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>PERSONAL BEST</Text>
                <Ionicons name="trophy" size={18} color="#FFD93D" />
              </View>
              <Text style={styles.subStatText}>5 Days</Text>
            </LinearGradient>
          </View>

        </View>

        {/* --- Calendar Section --- */}
        {/* Added flex: 1 to fill remaining space properly without scrolling */}
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>Monthly Activity</Text>

          <View style={styles.calendarWrapper}>
            <Calendar
              markingType={'custom'}
              markedDates={data}
              monthFormat={'MMMM yyyy'}
              hideExtraDays={true}
              firstDay={0} // Sunday
              enableSwipeMonths={true}
              dayComponent={({ date, state, marking }: any) => {
                const isSelected = !!marking;
                const bgColor = marking?.bgColor || 'transparent';
                const isToday = marking?.isToday;
                const borderStyle = isToday ? styles.todayBorder : {};

                return (
                  <View style={styles.dayContainer}>
                    <View style={[
                      styles.dayCircle,
                      { backgroundColor: isSelected ? bgColor : 'rgba(255,255,255,0.03)' },
                      borderStyle
                    ]}>
                      <Text style={[
                        styles.dayText,
                        { color: state === 'disabled' ? '#444' : (isSelected ? '#fff' : '#aaa') }
                      ]}>
                        {date.day}
                      </Text>
                    </View>
                  </View>
                );
              }}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: '#888',
                monthTextColor: '#fff',
                textMonthFontWeight: 'bold',
                textMonthFontSize: 18,
                arrowColor: colors.text || '#fff',
                todayTextColor: colors.accent || '#00D4FF',
              }}
            />
          </View>
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 60, // Safe area
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'flex-start', // Start from top, let cards push down
  },
  headerContainer: {
    marginBottom: 20, // Reduced margin slightly to save space
  },
  // --- Cards Styling ---
  mainCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  mainStatText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  iconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6a5acd',
    opacity: 0.4,
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subStatText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // --- Calendar Styling ---
  calendarContainer: {
    flex: 1, // Take up remaining space
    justifyContent: 'center', // Center vertically in remaining space
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginLeft: 4,
  },
  calendarWrapper: {
    backgroundColor: 'rgba(30, 30, 50, 0.5)',
    borderRadius: 24,
    padding: 10,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
});