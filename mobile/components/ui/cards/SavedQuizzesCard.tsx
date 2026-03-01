import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSavedQuizzes, getSavedSummaries, SavedQuiz, SavedSummary } from '@/api/ragApi';
import BaseCard from './baseCard';

type Props = {
  groupId: string;
  width?: number;
  height?: number;
  onSelectQuiz?: (quiz: SavedQuiz) => void;
};

export default function SavedQuizzesCard({ groupId, width = 140, height = 150, onSelectQuiz }: Props) {
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [summaries, setSummaries] = useState<SavedSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedQuizzes();
  }, [groupId]);

  const fetchSavedQuizzes = async () => {
    try {
      setLoading(true);
      const [quizData, summaryData] = await Promise.all([
        getSavedQuizzes(groupId),
        getSavedSummaries(groupId),
      ]);
      setQuizzes(quizData || []);
      setSummaries(summaryData || []);
    } catch (err) {
      setQuizzes([]);
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseCard width={width} height={height} style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#342A5f" />
        </View>
      </BaseCard>
    );
  }

  return (
    <BaseCard width={width} height={height} style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="bookmark" size={18} color="#342A5f" />
        <Text style={styles.headerText}> Saved</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.metricColumn}>
          <Text style={styles.metricCount}>{quizzes.length}</Text>
          <Text style={styles.metricLabel}>Saved quizzes</Text>
        </View>
        <View style={styles.metricColumn}>
          <Text style={styles.metricCount}>{summaries.length}</Text>
          <Text style={styles.metricLabel}>Saved summaries</Text>
        </View>
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontWeight: '700',
    color: '#342A5f',
    marginLeft: 6,
    fontSize: 13,
  },
  body: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    flex: 1,
  },
  metricColumn: {
    alignItems: 'center',
    flex: 1,
  },
  metricCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#342A5f',
  },
  metricLabel: {
    color: '#666',
    marginTop: 4,
    fontSize: 10,
    textAlign: 'center',
  },
});
