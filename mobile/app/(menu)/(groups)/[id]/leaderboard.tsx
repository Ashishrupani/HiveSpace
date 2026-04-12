import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, FlatList,
  Pressable, Image, ActivityIndicator, TouchableOpacity,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { API_BASE_URL , IPHONE_TESTING_URL} from '@/api/constants';
import BackButton from '@/components/ui/BackButton';

const bee = require('../../../../assets/images/bee_astronanut.jpg');
const queen = require('../../../../assets/images/queen_bee.avif');

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = '#342A5f';
const BORDER = '#e0e0e0';
const BG = '#f5f5f5';

const TABS = ['Daily', 'Weekly', 'All time'] as const;
type Tab = typeof TABS[number];
const baseUrl = API_BASE_URL;
// ─── Types ────────────────────────────────────────────────────────────────────

type Player = {
  UID: string;
  name: string;
  points: number;
};

// ─── API ──────────────────────────────────────────────────────────────────────

const fetchLeaderboard = async (groupId: string): Promise<Player[]> => {
  const response = await axios.get(`${baseUrl}/api/groups/${groupId}/leaderboard`);
  if (!response.data.success) {
    throw new Error(response.data.message ?? 'Failed to fetch leaderboard');
  }
  return response.data.leaderboard as Player[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.points - a.points);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id ?? '';
  const [tab, setTab] = useState<Tab>('All time');

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard against calling the API while a request is already in flight
  const isFetching = useRef(false);

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const loadLeaderboard = useCallback(async (isRefresh = false) => {
    if (!groupId || isFetching.current) return;
    isFetching.current = true;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const data = await fetchLeaderboard(groupId);
      setPlayers(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load leaderboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetching.current = false;
    }
  }, [groupId]);

  // Fires every time the screen comes into focus — won't spam because
  // isFetching ref blocks concurrent calls
  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [loadLeaderboard])
  );

  const handleRefresh = () => loadLeaderboard(true);

  // ─── Derived data ──────────────────────────────────────────────────────────

  const sorted = sortPlayers(players);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Loading leaderboard…</Text>
      </View>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────

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
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── Empty ─────────────────────────────────────────────────────────────────

  if (sorted.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.centeredScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />
        }
      >
        <Ionicons name="trophy-outline" size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>No players yet</Text>
        <Text style={styles.emptySubtitle}>
          Complete quizzes to appear on the leaderboard.
        </Text>
        <Text style={styles.pullToRefresh}>Pull down to refresh</Text>
      </ScrollView>
    );
  }

  // ─── Main ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentPadding}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PRIMARY} />
        }
      >
        <BackButton />

        <Text style={styles.heading}>Leaderboard</Text>

        {/* Tab Row */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Podium */}
        <View style={styles.podiumRow}>
          {/* 2nd place */}
          <View style={styles.podiumSide}>
            {top3[1] && (
              <View style={styles.podiumItem}>
                <Text style={styles.medalText}>🥈</Text>
                <Image source={bee} style={[styles.avatarLarge, styles.avatarSilver]} />
                <View style={styles.podiumCard}>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[1].name}
                  </Text>
                  <Text style={styles.podiumPoints}>{top3[1].points} pts</Text>
                </View>
              </View>
            )}
          </View>

          {/* 1st place */}
          <View style={styles.podiumCenter}>
            {top3[0] && (
              <View style={styles.podiumItem}>
                <Text style={styles.medalText}>🥇</Text>
                <Image source={queen} style={[styles.avatarXL, styles.avatarGold]} />
                <View style={[styles.podiumCard, styles.podiumCardCenter]}>
                  <Text style={[styles.podiumName, styles.podiumNameCenter]} numberOfLines={1}>
                    {top3[0].name}
                  </Text>
                  <Text style={[styles.podiumPoints, styles.podiumPointsCenter]}>
                    {top3[0].points} pts
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* 3rd place */}
          <View style={styles.podiumSide}>
            {top3[2] && (
              <View style={styles.podiumItem}>
                <Text style={styles.medalText}>🥉</Text>
                <Image source={bee} style={[styles.avatarLarge, styles.avatarBronze]} />
                <View style={styles.podiumCard}>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[2].name}
                  </Text>
                  <Text style={styles.podiumPoints}>{top3[2].points} pts</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Rest of list */}
        {rest.length > 0 && (
          <View style={styles.listWrap}>
            <FlatList
              data={rest}
              keyExtractor={(p) => p.UID}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item, index }) => (
                <View style={styles.listCard}>
                  <View style={styles.listLeft}>
                    <Text style={styles.rankNumber}>{index + 4}</Text>
                    <View style={styles.avatarSmall}>
                      <Text style={styles.avatarInitials}>
                        {getInitials(item.name)}
                      </Text>
                    </View>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  <Text style={styles.playerPoints}>{item.points} pts</Text>
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  contentPadding: { padding: 20, paddingTop: 40, flexGrow: 1 },
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

  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: PRIMARY,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#e8e4f3',
    borderRadius: 999,
    padding: 4,
    marginBottom: 24,
  },
  tab: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 999 },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: 13, fontWeight: '600', color: PRIMARY },
  tabTextActive: { color: '#fff' },

  // Empty
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
  pullToRefresh: { fontSize: 12, color: '#bbb', marginTop: 8 },

  // Podium
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 28,
    gap: 8,
  },
  podiumSide: { width: 110, alignItems: 'center' },
  podiumCenter: { width: 130, alignItems: 'center' },
  podiumItem: { alignItems: 'center' },
  medalText: { fontSize: 22, marginBottom: 4 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  avatarXL: { width: 88, height: 88, borderRadius: 44, marginBottom: 8 },
  avatarSilver: { borderWidth: 3, borderColor: '#C0C0C0' },
  avatarGold: { borderWidth: 3, borderColor: '#FFD700' },
  avatarBronze: { borderWidth: 3, borderColor: '#CD7F32' },
  podiumCard: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    width: '100%',
  },
  podiumCardCenter: { borderColor: '#FFD700', borderWidth: 2 },
  podiumName: { fontSize: 12, fontWeight: '700', color: PRIMARY },
  podiumNameCenter: { fontSize: 14 },
  podiumPoints: { fontSize: 12, fontWeight: '600', color: '#666' },
  podiumPointsCenter: { fontSize: 14, fontWeight: '700', color: PRIMARY },

  // List
  listWrap: { marginTop: 4 },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
  },
  listLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rankNumber: {
    width: 24,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    marginRight: 10,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e4f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: { color: PRIMARY, fontWeight: '700', fontSize: 13 },
  playerName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  playerPoints: { fontSize: 14, fontWeight: '700', color: PRIMARY },

  // Loading / error
  loadingText: { fontSize: 16, color: '#999', marginTop: 12 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});