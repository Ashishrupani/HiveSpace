/**
 * GroupDataContext
 *
 * Single source of truth for all group-level remote data.
 * All screens read from this cache — no screen owns its own fetch loop.
 *
 * Cached slices
 * ─────────────
 *  • quizzes / summaries   (ragApi)
 *  • members + adminUID    (groups/:id/members)
 *  • leaderboard           (groups/:id/leaderboard)
 *  • groupMeta             (groups/:id)
 *
 * Usage
 * ─────
 *  const { getData, fetch, isLoading, invalidate } = useGroupData();
 *  const { quizzes, members, leaderboard, groupMeta } = getData(groupId);
 */
 
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useAuth } from '@clerk/expo';
import axios from 'axios';
import { getSavedQuizzes, getSavedSummaries, SavedQuiz, SavedSummary } from '@/api/ragApi';
import { API_BASE_URL } from '@/api/constants';
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
export type Member = { UID: string; name: string };
 
export type LeaderboardPlayer = { UID: string; name: string; points: number };
 
export type GroupMeta = {
  name: string;
  color: string;
  iconName: string;
  about?: string;
  logoUri?: string;
};
 
export type GroupData = {
  quizzes: SavedQuiz[];
  summaries: SavedSummary[];
  members: Member[];
  adminUID: string;
  leaderboard: LeaderboardPlayer[];
  groupMeta: GroupMeta | null;
};
 
// Which slices can be fetched independently
export type GroupDataSlice = 'saved' | 'members' | 'leaderboard' | 'groupMeta';
 
type LoadingMap = Record<string, Partial<Record<GroupDataSlice, boolean>>>;
 
type GroupDataContextType = {
  /** Returns cached data for a group (empty defaults if not yet fetched) */
  getData: (groupId: string) => GroupData;
  /** Fetch one or more slices. No-ops if already in-flight. */
  fetch: (groupId: string, slices?: GroupDataSlice[]) => Promise<void>;
  /** True while any of the requested slices are loading */
  isLoading: (groupId: string, slices?: GroupDataSlice[]) => boolean;
  /** Force-clear cached slices so next fetch() hits the network */
  invalidate: (groupId: string, slices?: GroupDataSlice[]) => void;
  /** Optimistically patch quizzes/summaries counts after a save */
  patchSavedCounts: (groupId: string, delta: { quizzes?: number; summaries?: number }) => void;
};
 
// ─── Defaults ─────────────────────────────────────────────────────────────────
 
const EMPTY_DATA: GroupData = {
  quizzes: [],
  summaries: [],
  members: [],
  adminUID: '',
  leaderboard: [],
  groupMeta: null,
};
 
const ALL_SLICES: GroupDataSlice[] = ['saved', 'members', 'leaderboard', 'groupMeta'];
 
// ─── Context ──────────────────────────────────────────────────────────────────
 
const GroupDataContext = createContext<GroupDataContextType | null>(null);
 
export function GroupDataProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
 
  // Keyed by groupId
  const cache = useRef<Record<string, GroupData>>({});
  // Per-slice in-flight guard: fetchingRef[groupId][slice] = true
  const fetchingRef = useRef<Record<string, Partial<Record<GroupDataSlice, boolean>>>>({});
  // Reactive loading state for UI
  const [loadingMap, setLoadingMap] = useState<LoadingMap>({});
 
  // ─── Helpers ─────────────────────────────────────────────────────────────
 
  const getCached = useCallback((groupId: string): GroupData => {
    return cache.current[groupId] ?? { ...EMPTY_DATA };
  }, []);
 
  const setSliceLoading = (groupId: string, slice: GroupDataSlice, value: boolean) => {
    setLoadingMap((prev) => ({
      ...prev,
      [groupId]: { ...prev[groupId], [slice]: value },
    }));
  };
 
  const patchCache = (groupId: string, patch: Partial<GroupData>) => {
    cache.current[groupId] = { ...(cache.current[groupId] ?? { ...EMPTY_DATA }), ...patch };
  };
 
  // ─── Slice fetchers ───────────────────────────────────────────────────────
 
  const fetchSaved = useCallback(async (groupId: string, token: string) => {
    const ref = (fetchingRef.current[groupId] ??= {});
    if (ref.saved) return;
    ref.saved = true;
    setSliceLoading(groupId, 'saved', true);
    try {
      const [quizzes, summaries] = await Promise.all([
        getSavedQuizzes(groupId, token),
        getSavedSummaries(groupId, token),
      ]);
      patchCache(groupId, {
        quizzes: quizzes ?? [],
        summaries: summaries ?? [],
      });
    } catch {
      patchCache(groupId, { quizzes: [], summaries: [] });
    } finally {
      ref.saved = false;
      setSliceLoading(groupId, 'saved', false);
    }
  }, []);
 
  const fetchMembers = useCallback(async (groupId: string, token: string) => {
    const ref = (fetchingRef.current[groupId] ??= {});
    if (ref.members) return;
    ref.members = true;
    setSliceLoading(groupId, 'members', true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/groups/${groupId}/members`,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const adminUID: string = res?.data?.admin ?? '';
      const seen = new Set<string>();
      const unique: Member[] = (res?.data?.members ?? []).filter((m: Member) => {
        if (seen.has(m.UID)) return false;
        seen.add(m.UID);
        return true;
      });
      patchCache(groupId, { members: unique, adminUID });
    } catch {
      patchCache(groupId, { members: [], adminUID: '' });
    } finally {
      ref.members = false;
      setSliceLoading(groupId, 'members', false);
    }
  }, []);
 
  const fetchLeaderboard = useCallback(async (groupId: string, _token: string) => {
    const ref = (fetchingRef.current[groupId] ??= {});
    if (ref.leaderboard) return;
    ref.leaderboard = true;
    setSliceLoading(groupId, 'leaderboard', true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/groups/${groupId}/leaderboard`);
      if (!res.data.success) throw new Error(res.data.message ?? 'Leaderboard fetch failed');
      patchCache(groupId, { leaderboard: res.data.leaderboard ?? [] });
    } catch {
      patchCache(groupId, { leaderboard: [] });
    } finally {
      ref.leaderboard = false;
      setSliceLoading(groupId, 'leaderboard', false);
    }
  }, []);
 
  const fetchGroupMeta = useCallback(async (groupId: string, token: string) => {
    const ref = (fetchingRef.current[groupId] ??= {});
    if (ref.groupMeta) return;
    ref.groupMeta = true;
    setSliceLoading(groupId, 'groupMeta', true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/groups/${groupId}`,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const g = res?.data?.groupDetails;
      if (g) {
        patchCache(groupId, {
          groupMeta: {
            name: g.name ?? `Group ${groupId}`,
            color: g.color ?? '#342A5f',
            iconName: g.icon ?? g.iconName ?? 'person.3.fill',
            about: g.about,
            logoUri: g.logoUri,
          },
        });
      }
    } catch {
      // Leave groupMeta null — callers can show a fallback
    } finally {
      ref.groupMeta = false;
      setSliceLoading(groupId, 'groupMeta', false);
    }
  }, []);
 
  // ─── Public API ───────────────────────────────────────────────────────────
 
  const getData = useCallback(
    (groupId: string): GroupData => getCached(groupId),
    [getCached],
  );
 
  const fetch = useCallback(
    async (groupId: string, slices: GroupDataSlice[] = ALL_SLICES) => {
      if (!groupId) return;
      const token = await getToken();
      if (!token) return;
 
      await Promise.all(
        slices.map((slice) => {
          switch (slice) {
            case 'saved':       return fetchSaved(groupId, token);
            case 'members':     return fetchMembers(groupId, token);
            case 'leaderboard': return fetchLeaderboard(groupId, token);
            case 'groupMeta':   return fetchGroupMeta(groupId, token);
          }
        }),
      );
    },
    [getToken, fetchSaved, fetchMembers, fetchLeaderboard, fetchGroupMeta],
  );
 
  const isLoading = useCallback(
    (groupId: string, slices: GroupDataSlice[] = ALL_SLICES): boolean => {
      const map = loadingMap[groupId] ?? {};
      return slices.some((s) => !!map[s]);
    },
    [loadingMap],
  );
 
  const invalidate = useCallback(
    (groupId: string, slices: GroupDataSlice[] = ALL_SLICES) => {
      if (!cache.current[groupId]) return;
      const patch: Partial<GroupData> = {};
      for (const slice of slices) {
        switch (slice) {
          case 'saved':       patch.quizzes = []; patch.summaries = []; break;
          case 'members':     patch.members = []; patch.adminUID = ''; break;
          case 'leaderboard': patch.leaderboard = []; break;
          case 'groupMeta':   patch.groupMeta = null; break;
        }
      }
      patchCache(groupId, patch);
    },
    [],
  );
 
  /**
   * Call after saving a quiz or summary to bump the visible count on GroupHome
   * without waiting for a full refetch.
   */
  const patchSavedCounts = useCallback(
    (groupId: string, delta: { quizzes?: number; summaries?: number }) => {
      const current = getCached(groupId);
      patchCache(groupId, {
        quizzes: delta.quizzes !== undefined
          ? Array(current.quizzes.length + delta.quizzes) // length-only bump
          : current.quizzes,
        summaries: delta.summaries !== undefined
          ? Array(current.summaries.length + delta.summaries)
          : current.summaries,
      });
      // Trigger re-render
      setLoadingMap((prev) => ({ ...prev }));
    },
    [getCached],
  );
 
  return (
    <GroupDataContext.Provider
      value={{ getData, fetch, isLoading, invalidate, patchSavedCounts }}
    >
      {children}
    </GroupDataContext.Provider>
  );
}
 
export function useGroupData() {
  const ctx = useContext(GroupDataContext);
  if (!ctx) throw new Error('useGroupData must be used inside <GroupDataProvider>');
  return ctx;
}