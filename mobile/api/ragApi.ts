import axios from 'axios';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';

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
    explanation?: string;
  }>;
};

export type SavedQuiz = RAGQuiz & {
  savedBy: string;
  savedAt: string;
};

export const uploadNotesForSummary = async (noteText: string): Promise<RAGSummary> => {
  const response = await axios.post(`${baseUrl}/api/rag/summary`, {
    note: { text: noteText },
  });
  return response.data.summary;
};

export const uploadNotesForQuiz = async (noteText: string): Promise<RAGQuiz> => {
  const response = await axios.post(`${baseUrl}/api/rag/quiz`, {
    note: { text: noteText },
  });
  return response.data.quiz;
};

export const checkRagHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${baseUrl}/api/rag/health`);
    return response.status === 200;
  } catch {
    return false;
  }
};

export const saveQuizToGroup = async (groupId: string, quiz: RAGQuiz): Promise<void> => {
  try {
    const response = await axios.post(`${baseUrl}/api/groups/${groupId}/save-quiz`, {
      quiz,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error saving quiz:', error.response?.data || error.message);
    throw error;
  }
};

export const getSavedQuizzes = async (groupId: string): Promise<SavedQuiz[]> => {
  const response = await axios.get(`${baseUrl}/api/groups/${groupId}/saved-quizzes`);
  return response.data.quizzes;
};
