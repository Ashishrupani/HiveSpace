import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/ui/BackButton';
import BaseCard from '@/components/ui/cards/baseCard';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSavedQuizzes, getSavedSummaries, SavedQuiz, SavedSummary } from '@/api/ragApi';
import { useAuth } from '@clerk/expo';

export default function SavedItemsPage() {
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id || '';

  const [loading, setLoading] = React.useState(true);
  const [quizzes, setQuizzes] = React.useState<SavedQuiz[]>([]);
  const [summaries, setSummaries] = React.useState<SavedSummary[]>([]);
  const { getToken } = useAuth();

  React.useEffect(() => {
    const loadSavedItems = async () => {

      const token = await getToken();

      try {
        setLoading(true);
        const [savedQuizzes, savedSummaries] = await Promise.all([
          getSavedQuizzes(groupId, token),
          getSavedSummaries(groupId, token),
        ]);
        setQuizzes(savedQuizzes || []);
        setSummaries(savedSummaries || []);
      } catch {
        setQuizzes([]);
        setSummaries([]);
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      loadSavedItems();
    }
  }, [groupId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />

      <Text style={styles.title}>Saved</Text>
      <Text style={styles.subtitle}>Group ID: {groupId}</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#342A5f" />
        </View>
      ) : (
        <>
          <BaseCard width={'100%'} height={110} style={styles.summaryCard} onPress={() => router.push(`/${groupId}/savedQuizzes`)}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="reader" size={18} color="#342A5f" />
              <Text style={styles.cardTitle}>Saved quizzes</Text>
              <Text style={styles.subtitle}>Click to view saved quizzes</Text>
            </View>
            <Text style={styles.countText}>{quizzes.length}</Text>
          </BaseCard>

          <BaseCard width={'100%'} height={110} style={styles.summaryCard} onPress={() => router.push(`/${groupId}/savedSummaries`)}>
            <View style={styles.cardHeaderRow}>
              <Ionicons name="document-text" size={18} color="#342A5f" />
              <Text style={styles.cardTitle}>Saved summaries</Text>
              <Text style={styles.subtitle}>Click to view saved summaries</Text>
            </View>
            <Text style={styles.countText}>{summaries.length}</Text>
          </BaseCard>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#342A5f',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  loadingWrap: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#342A5f',
    fontWeight: '700',
    fontSize: 14,
  },
  countText: {
    marginTop: 14,
    color: '#342A5f',
    fontSize: 30,
    fontWeight: '700',
  },
});
