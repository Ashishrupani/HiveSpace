import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSavedQuizzes, SavedQuiz } from '@/api/ragApi';
import BaseCard from './baseCard';

type Props = {
  groupId: string;
  width?: number;
  height?: number;
  onSelectQuiz?: (quiz: SavedQuiz) => void;
};

export default function SavedQuizzesCard({ groupId, width = 140, height = 150, onSelectQuiz }: Props) {
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedQuizzes();
  }, [groupId]);

  const fetchSavedQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getSavedQuizzes(groupId);
      setQuizzes(data || []);
    } catch (err) {
      setQuizzes([]);
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
        <Text style={styles.quizCount}>{quizzes.length}</Text>
        <Text style={styles.quizMeta}>Saved Quizzes</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  quizCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#342A5f',
  },
  quizMeta: {
    color: '#666',
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
  },
});
