import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BaseCard from './baseCard';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
  onPress?: () => void;
  width?: number;
  height?: number;
  nextQuiz?: { title: string; questions: number };
};

export default function QuizCard({ onPress, width = 140, height = 150, nextQuiz }: Props) {
  const sample = nextQuiz ?? { title: 'Daily Quiz', questions: 5 };

  return (
    <BaseCard width={width} height={height} onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="reader" size={18} color="#342A5f" />
        <Text style={styles.headerText}> Quiz</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.quizTitle}>{sample.title}</Text>
        <Text style={styles.quizMeta}>{sample.questions} questions</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontWeight: '700',
    color: '#342A5f',
    marginLeft: 6,
  },
  body: {
    marginTop: 6,
  },
  quizTitle: {
    fontWeight: '700',
    color: '#222',
  },
  quizMeta: {
    color: '#666',
    marginTop: 6,
    fontSize: 12,
  },
});
