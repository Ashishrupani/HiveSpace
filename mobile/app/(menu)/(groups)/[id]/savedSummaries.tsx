import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@clerk/expo';
import { getSavedSummaries, SavedSummary } from '@/api/ragApi';

const PRIMARY = '#342A5f';
const BORDER = '#e0e0e0';
const BG = '#f5f5f5';

export default function SavedSummariesPage() {
  const { id: rawId, prefetchedSummaries, prefetchedGroupId } = useLocalSearchParams();
  const groupId = Array.isArray(rawId) ? rawId[0] : rawId ?? '';
  const { getToken } = useAuth();

  const parsePrefetched = (): SavedSummary[] | null => {
    const raw = Array.isArray(prefetchedSummaries) ? prefetchedSummaries[0] : prefetchedSummaries;
    const fromGroupId = Array.isArray(prefetchedGroupId) ? prefetchedGroupId[0] : prefetchedGroupId;
    if (!raw || fromGroupId !== groupId) return null;
    try {
      return JSON.parse(raw) as SavedSummary[];
    } catch {
      return null;
    }
  };

  const [summaries, setSummaries] = useState<SavedSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<SavedSummary | null>(null);

  // ─── Fetch ───────────────────────────────────────────────────────────────────

  const fetchSummaries = async () => {
    if (!groupId) {
      setError('No group ID found.');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const token = await getToken();
      const data = await getSavedSummaries(groupId, token);
      setSummaries(data);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load saved summaries.';
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!groupId) return;
    setRefreshing(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await getSavedSummaries(groupId, token);
      setSummaries(data);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load saved summaries.';
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Always reset when groupId changes
    setSummaries([]);
    setError(null);
    setActiveSummary(null);

    const prefetched = parsePrefetched();
    if (prefetched !== null) {
      // Valid prefetch for this group — use it, skip API call
      setSummaries(prefetched);
      setLoading(false);
      return;
    }

    // No valid prefetch — fetch from API
    setLoading(true);
    fetchSummaries();
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Active Summary Screen ────────────────────────────────────────────────────

  if (activeSummary) {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity
            onPress={() => setActiveSummary(null)}
            style={styles.backButton}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.screenHeaderTitle} numberOfLines={1}>
            {activeSummary.title}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentPadding}>
          <Text style={styles.summaryTitle}>{activeSummary.title}</Text>
          {activeSummary.savedAt && (
            <Text style={styles.summaryDate}>
              Saved{' '}
              {new Date(activeSummary.savedAt).toLocaleDateString(undefined, {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </Text>
          )}

          <View style={styles.bulletContainer}>
            {activeSummary.bullets.map((bullet, idx) => (
              <View key={idx} style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>

          {activeSummary.keyTerms.length > 0 && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsTitle}>Key Terms</Text>
              {activeSummary.keyTerms.map((item, idx) => (
                <View key={idx} style={styles.termItem}>
                  <Text style={styles.termName}>{item.term}</Text>
                  <Text style={styles.termDef}>{item.definition}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Loading saved summaries…</Text>
      </View>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.centeredScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />
        }
      >
        <Ionicons name="cloud-offline-outline" size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>Something went wrong</Text>
        <Text style={styles.emptySubtitle}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => { setLoading(true); fetchSummaries(); }}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── Empty ────────────────────────────────────────────────────────────────────

  if (summaries.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.centeredScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />
        }
      >
        <Ionicons name="document-outline" size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>No Saved Summaries</Text>
        <Text style={styles.emptySubtitle}>
          Generate a summary from the AI page and save it to see it here.
        </Text>
        <Text style={styles.pullToRefresh}>Pull down to refresh</Text>
      </ScrollView>
    );
  }

  // ─── Summary List ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentPadding}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />
        }
      >
        <Text style={styles.heading}>Saved Summaries</Text>
        <Text style={styles.subheading}>
          {summaries.length} {summaries.length === 1 ? 'summary' : 'summaries'} saved
        </Text>

        {summaries.map((summary, idx) => {
          const savedDate = summary.savedAt
            ? new Date(summary.savedAt).toLocaleDateString(undefined, {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : null;

          return (
            <TouchableOpacity
              key={`${summary.title}-${idx}`}
              style={styles.summaryCard}
              onPress={() => setActiveSummary(summary)}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrapper}>
                  <Ionicons name="book" size={22} color={PRIMARY} />
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{summary.title}</Text>
                  {savedDate && <Text style={styles.cardDate}>Saved {savedDate}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#bbb" />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Ionicons name="list" size={14} color={PRIMARY} />
                  <Text style={styles.statText}>
                    {summary.bullets.length}{' '}
                    {summary.bullets.length === 1 ? 'point' : 'points'}
                  </Text>
                </View>
                {summary.keyTerms.length > 0 && (
                  <View style={styles.statBadge}>
                    <Ionicons name="pricetag" size={14} color={PRIMARY} />
                    <Text style={styles.statText}>
                      {summary.keyTerms.length}{' '}
                      {summary.keyTerms.length === 1 ? 'term' : 'terms'}
                    </Text>
                  </View>
                )}
              </View>

              {summary.bullets[0] && (
                <Text style={styles.previewText} numberOfLines={2}>
                  {summary.bullets[0]}
                </Text>
              )}

              <TouchableOpacity
                style={styles.readButton}
                onPress={() => setActiveSummary(summary)}
              >
                <Ionicons name="book-outline" size={16} color="#fff" />
                <Text style={styles.readButtonText}>Read Summary</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    padding: 32,
    gap: 12,
  },
  centeredScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    padding: 32,
    gap: 12,
    minHeight: '100%',
  },
  screenHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  screenHeaderTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: PRIMARY, marginHorizontal: 8 },
  backButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 28, fontWeight: '700', color: PRIMARY, marginBottom: 4 },
  subheading: { fontSize: 14, color: '#999', marginBottom: 20 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  cardIconWrapper: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#e8e4f3', justifyContent: 'center', alignItems: 'center' },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', lineHeight: 22 },
  cardDate: { fontSize: 12, color: '#999', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8e4f3', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, gap: 4 },
  statText: { fontSize: 12, fontWeight: '600', color: PRIMARY },
  previewText: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 14, fontStyle: 'italic' },
  readButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 12, gap: 8 },
  readButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  summaryTitle: { fontSize: 24, fontWeight: '700', color: PRIMARY, marginBottom: 4 },
  summaryDate: { fontSize: 13, color: '#999', marginBottom: 20 },
  bulletContainer: { marginBottom: 24 },
  bulletPoint: { flexDirection: 'row', marginBottom: 12 },
  bulletDot: { fontSize: 20, color: PRIMARY, marginRight: 8, marginTop: -2 },
  bulletText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 22 },
  termsContainer: { marginTop: 8 },
  termsTitle: { fontSize: 18, fontWeight: '600', color: PRIMARY, marginBottom: 12 },
  termItem: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: PRIMARY },
  termName: { fontWeight: '600', color: PRIMARY, fontSize: 14 },
  termDef: { color: '#666', fontSize: 13, marginTop: 4, lineHeight: 18 },
  loadingText: { fontSize: 16, color: '#999', marginTop: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
  pullToRefresh: { fontSize: 12, color: '#bbb', marginTop: 8 },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, gap: 8, marginTop: 8 },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});