import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './constants';

// ─── Client ───────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuizOptions = {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  numChoices?: number;
  includeExplanations?: boolean;
};

export type RAGSummary = {
  title: string;
  bullets: string[];
  keyTerms: Array<{ term: string; definition: string }>;
};

export type RAGQuiz = {
  title: string;
  questions: Array<{
    id: string;
    question: string;
    choices: Array<{ id: string; text: string }>;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation?: string | null;
  }>;
};

export type SavedQuiz = RAGQuiz & {
  savedBy: string;
  savedAt: string;
};

export type SavedSummary = RAGSummary & {
  savedBy: string;
  savedAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authHeaders = (token: string | null): AxiosRequestConfig => ({
  headers: { Authorization: `Bearer ${token}` },
});

const handleError = (error: any, context: string): never => {
  const msg = error?.response?.data?.message || error?.message || context;
  console.error(`[ragApi] ${context}:`, error?.response?.data || error?.message);
  throw new Error(msg);
};

// ─── RAG Generation ───────────────────────────────────────────────────────────

export const uploadNotesForSummary = async (noteText: string): Promise<RAGSummary> => {
  try {
    const response = await api.post('/api/rag/summary', {
      note: { text: noteText },
    });
    if (!response.data.success) {
      throw new Error(response.data.message ?? 'Failed to generate summary');
    }
    return response.data.summary as RAGSummary;
  } catch (error) {
    return handleError(error, 'generate summary'); // ← return added
  }
};

export const uploadNotesForQuiz = async (
  noteText: string,
  options?: QuizOptions
): Promise<RAGQuiz> => {
  try {
    const response = await api.post('/api/rag/quiz', {
      note: { text: noteText },
      options: {
        numQuestions: options?.numQuestions ?? 10,
        difficulty: options?.difficulty ?? 'medium',
        numChoices: options?.numChoices ?? 4,
        includeExplanations: options?.includeExplanations ?? true,
      },
    });
    if (!response.data.success) {
      throw new Error(response.data.message ?? 'Failed to generate quiz');
    }
    return response.data.quiz as RAGQuiz;
  } catch (error) {
    return handleError(error, 'generate quiz'); // ← return added
  }
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const checkRagHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/api/rag/health');
    return response.data.success === true;
  } catch {
    return false;
  }
};

// ─── Save ─────────────────────────────────────────────────────────────────────

export const saveQuizToGroup = async (
  groupId: string,
  quiz: RAGQuiz,
  token: string | null,
  score?: number
): Promise<void> => {
  try {
    const response = await api.post(
      `/api/groups/${groupId}/save-quiz`,
      {
        quiz,
        ...(score !== undefined ? { score } : {}),
      },
      authHeaders(token)
    );
    if (!response.data.success) {
      throw new Error(response.data.message ?? 'Failed to save quiz');
    }
  } catch (error) {
    return handleError(error, 'save quiz'); // ← return added
  }
};

export const saveSummaryToGroup = async (
  groupId: string,
  summary: RAGSummary,
  token: string | null
): Promise<void> => {
  try {
    const response = await api.post(
      `/api/groups/${groupId}/save-summary`,
      { summary },
      authHeaders(token)
    );
    if (!response.data.success) {
      throw new Error(response.data.message ?? 'Failed to save summary');
    }
  } catch (error) {
    return handleError(error, 'save summary'); // ← return added
  }
};

// ─── Fetch Saved ──────────────────────────────────────────────────────────────

export const getSavedQuizzes = async (
  groupId: string,
  token: string | null
): Promise<SavedQuiz[]> => {
  try {
    const response = await api.get(
      `/api/groups/${groupId}/saved-quizzes`,
      authHeaders(token)
    );
    return response.data.quizzes as SavedQuiz[];
  } catch (error) {
    return handleError(error, 'fetch saved quizzes'); // ← return added
  }
};

export const getSavedSummaries = async (
  groupId: string,
  token: string | null
): Promise<SavedSummary[]> => {
  try {
    const response = await api.get(
      `/api/groups/${groupId}/saved-summaries`,
      authHeaders(token)
    );
    return response.data.summaries as SavedSummary[];
  } catch (error) {
    return handleError(error, 'fetch saved summaries'); // ← return added
  }
};