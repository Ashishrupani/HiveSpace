import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import colors from '@/constants/theme';
import pageStyles from '@/constants/styles/page-styles';

export default function StatsScreen() {
//test data will be removed once api and DB are setup
  const data = {
    '2025-10-27': { bgColor: '#4a3f7a', time: '2h 30m', streak: true },
    '2025-10-28': { bgColor: '#5d4f8f', time: '4h 15m', streak: true },
    '2025-10-29': { bgColor: '#7060a5', time: '6h 0m', streak: true },
    '2025-10-30': { bgColor: '#8372ba', time: '8h 20m', streak: true },
    '2025-10-31': { bgColor: '#5d4f8f', time: '3h 45m', streak: true },
    '2025-11-02': { bgColor: '#7060a5', time: '5h 10m', streak: true },
    '2025-11-03': { bgColor: '#7060a5', time: '5h 10m', streak: true },
  } as any;
  // for future reference when finishing this page the background color will be calculated to be some value using min, max and,floor to find a value in a range of defined colors list saving 
  // us the cost of calculating this and sending it from the backend. The Heat map may be a bad idea since the streak boarder makes it hard to see the color difference.
  // At this time its not clear how the DB will handle streaks but this will also be possible to calculate in the frontend.
  // I would also like ot make each date touchable so that we can  get more fine grained statistics but its not clear if we will have that data yet.
  return (
      <View style={pageStyles.scrollContent}>
       
        <View style={styles.statsCard}>
          <Text style={styles.statsText}>Total this week: 36h 10m</Text>
          <Text style={styles.streakText}>Current streak: 2 days</Text>
          <Text style={styles.streakText}>Personal best: 5 days</Text>
        </View>
        
        <Calendar
          markingType={'custom'}
          markedDates={data}
          dayComponent={({date, marking}: any) => {
            const bgColor = marking?.bgColor;
            const hasStreak = marking?.streak;
            const timeText = marking?.time || '0m';
            
            return (
              <View style={[styles.day, {backgroundColor: bgColor}, hasStreak && styles.streakBorder]}>
                <Text style={styles.dayText}>{date.day}</Text>
                <Text style={styles.time}>{timeText}</Text>
              </View>
            );
          }}
          theme={{
            calendarBackground: colors.primary,
            monthTextColor: colors.text,
            arrowColor: colors.gradientbottom,
          }}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  streakText: {
    fontSize: 16,
    color: colors.text,
  },
  day: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  streakBorder: {
    borderWidth: 2,
    borderColor: colors.gradientbottom,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    fontSize: 10,
    marginTop: 2,
    color: colors.text,
  },
});