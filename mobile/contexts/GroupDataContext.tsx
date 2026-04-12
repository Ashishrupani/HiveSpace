import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/expo';
import { getSavedQuizzes, getSavedSummaries, SavedQuiz, SavedSummary } from '@/api/ragApi';

type GroupData = {
  quizzes: SavedQuiz[];
  summaries: SavedSummary[];
  quizCount: number;
  summaryCount: number;
};

type GroupDataContextType = {
  getGroupData: (groupId: string) => GroupData;
  fetchGroupData: (groupId: string) => Promise<void>;
  isLoading: (groupId: string) => boolean;
  invalidate: (groupId: string) => void;
};

const GroupDataContext = createContext<GroupDataContextType | null>(null);

export function GroupDataProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  // Cache keyed by groupId
  const cache = useRef<Record<string, GroupData>>({});
  const fetchingRef = useRef<Record<string, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const isLoading = useCallback((groupId: string) => !!loadingMap[groupId], [loadingMap]);

  const getGroupData = useCallback((groupId: string): GroupData => {
    return cache.current[groupId] ?? {
      quizzes: [],
      summaries: [],
      quizCount: 0,
      summaryCount: 0,
    };
  }, []);

  const fetchGroupData = useCallback(async (groupId: string) => {
    if (!groupId || fetchingRef.current[groupId]) return;
    fetchingRef.current[groupId] = true;
    setLoadingMap((prev) => ({ ...prev, [groupId]: true }));

    try {
      const token = await getToken();
      const [quizzes, summaries] = await Promise.all([
        getSavedQuizzes(groupId, token),
        getSavedSummaries(groupId, token),
      ]);

      cache.current[groupId] = {
        quizzes: quizzes ?? [],
        summaries: summaries ?? [],
        quizCount: quizzes?.length ?? 0,
        summaryCount: summaries?.length ?? 0,
      };
    } catch {
      cache.current[groupId] = {
        quizzes: [],
        summaries: [],
        quizCount: 0,
        summaryCount: 0,
      };
    } finally {
      fetchingRef.current[groupId] = false;
      setLoadingMap((prev) => ({ ...prev, [groupId]: false }));
    }
  }, [getToken]);

  // Call this after saving a new quiz/summary to force a fresh fetch next time
  const invalidate = useCallback((groupId: string) => {
    delete cache.current[groupId];
  }, []);

  return (
    <GroupDataContext.Provider value={{ getGroupData, fetchGroupData, isLoading, invalidate }}>
      {children}
    </GroupDataContext.Provider>
  );
}

export function useGroupData() {
  const ctx = useContext(GroupDataContext);
  if (!ctx) throw new Error('useGroupData must be used inside GroupDataProvider');
  return ctx;
}