import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SavedQuiz } from '@/api/ragApi';
import { useGroupData } from '@/contexts/GroupDataContext';
import { useFocusEffect } from '@react-navigation/native';
import QuizComponent, { Question as QType } from '@/components/ui/quiz/Quiz';
 
const PRIMARY = '#342A5f';
const BORDER = '#e0e0e0';
const BG = '#f5f5f5';
 
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#4CAF50',
  medium: '#FF9800',
  hard: '#d32f2f',
};
 
export default function SavedQuizzesPage() {
  const { id: rawId } = useLocalSearchParams();
  const groupId = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
 
  const { getData, fetch, isLoading } = useGroupData();
  const [refreshing, setRefreshing] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<SavedQuiz | null>(null);
 
  // Refresh on focus — context deduplicates concurrent calls
  useFocusEffect(
    React.useCallback(() => {
      fetch(groupId, ['saved']);
    }, [groupId]),
  );
 
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch(groupId, ['saved']);
    setRefreshing(false);
  };
 
  const { quizzes } = getData(groupId);
  const loading = isLoading(groupId, ['saved']);
 
  // ─── Active Quiz Screen ───────────────────────────────────────────────────
 
  if (activeQuiz) {
    const questions: QType[] = activeQuiz.questions.map((q) => ({
      id: q.id,
      text: q.question,
      choices: q.choices.map((c) => c.text),
      correctIndex: q.choices.findIndex((c) => c.id === q.answer),
    }));
 
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setActiveQuiz(null)} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.screenHeaderTitle} numberOfLines={1}>{activeQuiz.title}</Text>
          <View style={{ width: 36 }} />
        </View>
        <QuizComponent
          questions={questions}
          groupId={groupId}
          onBackToFileUpload={() => setActiveQuiz(null)}
        />
      </View>
    );
  }
 
  // ─── Loading ──────────────────────────────────────────────────────────────
 
  if (loading && quizzes.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Loading saved quizzes…</Text>
      </View>
    );
  }
 
  // ─── Empty ────────────────────────────────────────────────────────────────
 
  if (!loading && quizzes.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.centeredScroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />}
      >
        <Ionicons name="document-outline" size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>No Saved Quizzes</Text>
        <Text style={styles.emptySubtitle}>
          Generate a quiz from the AI page and save it to see it here.
        </Text>
        <Text style={styles.pullToRefresh}>Pull down to refresh</Text>
      </ScrollView>
    );
  }
 
  // ─── Quiz List ────────────────────────────────────────────────────────────
 
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentPadding}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />}
      >
        <Text style={styles.heading}>Saved Quizzes</Text>
        <Text style={styles.subheading}>
          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} saved
        </Text>
 
        {quizzes.map((quiz, idx) => {
          const difficultyCounts = quiz.questions.reduce<Record<string, number>>(
            (acc, q) => { acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1; return acc; },
            {},
          );
          const savedDate = quiz.savedAt
            ? new Date(quiz.savedAt).toLocaleDateString(undefined, {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : null;
 
          return (
            <TouchableOpacity
              key={`${quiz.title}-${idx}`}
              style={styles.quizCard}
              onPress={() => setActiveQuiz(quiz)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                  <Ionicons name="help-circle" size={22} color={PRIMARY} />
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{quiz.title}</Text>
                  {savedDate && <Text style={styles.cardDate}>Saved {savedDate}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#bbb" />
              </View>
 
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Ionicons name="list" size={14} color={PRIMARY} />
                  <Text style={styles.statText}>
                    {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
                  </Text>
                </View>
                {Object.entries(difficultyCounts).map(([level, count]) => (
                  <View
                    key={level}
                    style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLORS[level] + '22' }]}
                  >
                    <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[level] }]}>
                      {count} {level}
                    </Text>
                  </View>
                ))}
              </View>
 
              <TouchableOpacity style={styles.startButton} onPress={() => setActiveQuiz(quiz)}>
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.startButtonText}>Start Quiz</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  contentPadding: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG, padding: 32, gap: 12 },
  centeredScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG, padding: 32, gap: 12, minHeight: '100%' },
  screenHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  screenHeaderTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: PRIMARY, marginHorizontal: 8 },
  backButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 28, fontWeight: '700', color: PRIMARY, marginBottom: 4 },
  subheading: { fontSize: 14, color: '#999', marginBottom: 20 },
  quizCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  cardIconWrapper: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#e8e4f3', justifyContent: 'center', alignItems: 'center' },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', lineHeight: 22 },
  cardDate: { fontSize: 12, color: '#999', marginTop: 2 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8e4f3', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, gap: 4 },
  statText: { fontSize: 12, fontWeight: '600', color: PRIMARY },
  difficultyBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  difficultyText: { fontSize: 12, fontWeight: '600' },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 12, gap: 8 },
  startButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loadingText: { fontSize: 16, color: '#999', marginTop: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
  pullToRefresh: { fontSize: 12, color: '#bbb', marginTop: 8 },
});