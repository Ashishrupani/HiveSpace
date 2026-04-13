import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  uploadNotesForSummary, uploadNotesForQuiz,
  RAGSummary, RAGQuiz, saveQuizToGroup, saveSummaryToGroup, QuizOptions
} from '@/api/ragApi';
import QuizComponent, { Question as QType } from '@/components/ui/quiz/Quiz';
import { useAuth } from '@clerk/expo';
import { useActiveGroupId } from '@/contexts/ActiveGroupContext';
 
// ─── Constants ────────────────────────────────────────────────────────────────
 
const PRIMARY = '#342A5f';
const GREEN = '#4CAF50';
const RED = '#d32f2f';
const BORDER = '#e0e0e0';
const BG = '#f5f5f5';
 
const DAILY_LIMIT = 4;
const QUESTION_COUNTS = [5, 10, 15, 20] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const DEFAULT_OPTIONS: QuizOptions = { numQuestions: 10, difficulty: 'medium' };
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
type AIMode = 'upload' | 'summary' | 'quiz';
type UploadedFile = { name: string; content: string };
 
// ─── Component ────────────────────────────────────────────────────────────────
 
export default function AIPage() {
  const groupId = useActiveGroupId();
  const { getToken } = useAuth();
 
  // UI state
  const [mode, setMode] = useState<AIMode>('upload');
  const [loading, setLoading] = useState(false);
  const [showQuizOptions, setShowQuizOptions] = useState(false);
 
  // Data state
  const [summaryData, setSummaryData] = useState<RAGSummary | null>(null);
  const [quizData, setQuizData] = useState<RAGQuiz | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
 
  // Options
  const [quizOptions, setQuizOptions] = useState<QuizOptions>(DEFAULT_OPTIONS);
  const [pendingQuizContent, setPendingQuizContent] = useState('');
 
  // Save state
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savingSummary, setSavingSummary] = useState(false);
 
  // Generations
  const [generationsRemaining, setGenerationsRemaining] = useState(DAILY_LIMIT);
 
  // ─── Helpers ─────────────────────────────────────────────────────────────────
 
  const decrementGenerations = () =>
    setGenerationsRemaining((prev) => Math.max(0, prev - 1));
 
  const handleApiError = (error: any, context: string) => {
    console.error(`[${context}]`, error);
    const data = error?.response?.data;
    if (
      data?.details?.includes('quota') ||
      data?.details?.includes('RESOURCE_EXHAUSTED')
    ) {
      Alert.alert(
        'Daily Limit Reached',
        'The AI service has hit its daily quota. Please try again in 24 hours.'
      );
    } else {
      const msg = data?.message || error?.message || `Failed to ${context}`;
      Alert.alert('Error', msg);
    }
  };
 
  const getAuthToken = async (): Promise<string | null> => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Session Expired', 'Please sign in again to continue.');
    }
    return token;
  };
 
  const getCombinedContent = () =>
    uploadedFiles.map((f) => f.content).join('\n\n---\n\n');
 
  // ─── File Handling ────────────────────────────────────────────────────────────
 
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf', 'application/msword'],
      });
      if (result.canceled) return;
 
      const file = result.assets[0];
      setLoading(true);
 
      let content = '';
      try {
        content = await FileSystem.readAsStringAsync(file.uri);
      } catch {
        content = file.name ?? 'Unable to read file content';
      }
 
      setUploadedFiles((prev) => [...prev, { name: file.name, content }]);
    } catch {
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  const removeFile = (fileName: string) =>
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
 
  // ─── Generation ───────────────────────────────────────────────────────────────
 
  const handleGenerateFromFiles = (type: 'summary' | 'quiz') => {
    if (uploadedFiles.length === 0) {
      Alert.alert('No Files', 'Please upload at least one file first.');
      return;
    }
    if (generationsRemaining <= 0) {
      Alert.alert('Limit Reached', 'You have no generations remaining today.');
      return;
    }
    if (type === 'quiz') {
      setPendingQuizContent(getCombinedContent());
      setShowQuizOptions(true);
    } else {
      generateSummary(getCombinedContent());
    }
  };
 
  const generateSummary = async (content: string) => {
    setLoading(true);
    try {
      const result = await uploadNotesForSummary(content);
      setSummaryData(result);
      setMode('summary');
      decrementGenerations();
    } catch (error) {
      handleApiError(error, 'generate summary');
    } finally {
      setLoading(false);
    }
  };
 
  const generateQuiz = async (content: string, options: QuizOptions) => {
    setLoading(true);
    try {
      const result = await uploadNotesForQuiz(content, options);
      setQuizData(result);
      setQuizScore(null);
      setMode('quiz');
      decrementGenerations();
    } catch (error) {
      handleApiError(error, 'generate quiz');
    } finally {
      setLoading(false);
    }
  };
 
  // ─── Save Handlers ────────────────────────────────────────────────────────────
 
  const handleSaveQuiz = async () => {
    if (!quizData) {
      Alert.alert('Error', 'No quiz data available to save.');
      return;
    }
    if (!groupId) {
      Alert.alert('Error', 'No group selected. Please navigate here from a group page.');
      return;
    }
 
    const token = await getAuthToken();
    if (!token) return;
 
    setSavingQuiz(true);
    try {
      await saveQuizToGroup(groupId, quizData, token, quizScore ?? undefined);
      Alert.alert('Saved!', 'Quiz has been saved to the group.');
    } catch (error) {
      handleApiError(error, 'save quiz');
    } finally {
      setSavingQuiz(false);
    }
  };
 
  const handleSaveSummary = async () => {
    if (!summaryData) {
      Alert.alert('Error', 'No summary available to save.');
      return;
    }
    if (!groupId) {
      Alert.alert('Error', 'No group selected. Please navigate here from a group page.');
      return;
    }
 
    const token = await getAuthToken();
    if (!token) return;
 
    setSavingSummary(true);
    try {
      await saveSummaryToGroup(groupId, summaryData, token);
      Alert.alert('Saved!', 'Summary has been saved to the group.');
    } catch (error) {
      handleApiError(error, 'save summary');
    } finally {
      setSavingSummary(false);
    }
  };
 
  // ─── Quiz Options Modal ───────────────────────────────────────────────────────
 
  if (showQuizOptions) {
    return (
      <Modal transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
 
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customize Quiz</Text>
              <TouchableOpacity onPress={() => setShowQuizOptions(false)} hitSlop={8}>
                <Ionicons name="close" size={24} color={PRIMARY} />
              </TouchableOpacity>
            </View>
 
            <ScrollView style={styles.modalBody}>
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>
                  Number of Questions: {quizOptions.numQuestions}
                </Text>
                <View style={styles.optionRow}>
                  {QUESTION_COUNTS.map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.optionButton,
                        quizOptions.numQuestions === num && styles.optionButtonActive,
                      ]}
                      onPress={() => setQuizOptions((o) => ({ ...o, numQuestions: num }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        quizOptions.numQuestions === num && styles.optionButtonTextActive,
                      ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
 
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>Difficulty</Text>
                <View style={styles.optionRow}>
                  {DIFFICULTIES.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.optionButton,
                        quizOptions.difficulty === level && styles.optionButtonActive,
                      ]}
                      onPress={() => setQuizOptions((o) => ({ ...o, difficulty: level }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        quizOptions.difficulty === level && styles.optionButtonTextActive,
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
 
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => {
                  setQuizOptions(DEFAULT_OPTIONS);
                  setShowQuizOptions(false);
                  generateQuiz(pendingQuizContent, DEFAULT_OPTIONS);
                }}
              >
                <Text style={styles.skipButtonText}>
                  Use Defaults (10 Questions · Medium)
                </Text>
              </TouchableOpacity>
 
              <TouchableOpacity
                style={styles.generateButton}
                onPress={() => {
                  setShowQuizOptions(false);
                  generateQuiz(pendingQuizContent, quizOptions);
                }}
              >
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.generateButtonText}>Generate Quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
 
  // ─── Loading ──────────────────────────────────────────────────────────────────
 
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Generating AI content…</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    );
  }
 
  // ─── Quiz Screen ──────────────────────────────────────────────────────────────
 
  if (mode === 'quiz' && quizData) {
    const questions: QType[] = quizData.questions.map((q) => ({
      id: q.id,
      text: q.question,
      choices: q.choices.map((c) => c.text),
      correctIndex: q.choices.findIndex((c) => c.id === q.answer),
    }));
 
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setMode('upload')} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.screenHeaderTitle}>Quiz</Text>
          <TouchableOpacity
            style={[styles.saveButton, savingQuiz && styles.saveButtonDisabled]}
            onPress={handleSaveQuiz}
            disabled={savingQuiz}
          >
            {savingQuiz ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="bookmark" size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save Quiz</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <QuizComponent
          questions={questions}
          groupId={groupId}
          onBackToFileUpload={() => setMode('upload')}
        />
      </View>
    );
  }
 
  // ─── Summary Screen ───────────────────────────────────────────────────────────
 
  if (mode === 'summary' && summaryData) {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => setMode('upload')} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.screenHeaderTitle}>Summary</Text>
          <TouchableOpacity
            style={[styles.saveButton, savingSummary && styles.saveButtonDisabled]}
            onPress={handleSaveSummary}
            disabled={savingSummary}
          >
            {savingSummary ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="bookmark" size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save Summary</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
 
        <ScrollView contentContainerStyle={styles.contentPadding}>
          <Text style={styles.title}>{summaryData.title}</Text>
          <View style={styles.bulletContainer}>
            {summaryData.bullets.map((bullet, idx) => (
              <View key={idx} style={styles.bulletPoint}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
          {summaryData.keyTerms.length > 0 && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsTitle}>Key Terms</Text>
              {summaryData.keyTerms.map((item, idx) => (
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
 
  // ─── Upload Screen ────────────────────────────────────────────────────────────
 
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
      <Text style={styles.heading}>AI Learning Assistant</Text>
      <Text style={styles.description}>
        Upload your notes and let AI generate summaries or quizzes to help you study.
      </Text>
 
      <View style={styles.counterCard}>
        <Ionicons name="flash" size={18} color={generationsRemaining > 0 ? GREEN : RED} />
        <Text style={[styles.counterText, generationsRemaining === 0 && styles.counterTextZero]}>
          {generationsRemaining} / {DAILY_LIMIT}{' '}
          {generationsRemaining === 1 ? 'generation' : 'generations'} remaining today
        </Text>
      </View>
 
      <TouchableOpacity
        style={[styles.uploadButton, loading && styles.disabledButton]}
        onPress={pickDocument}
        disabled={loading}
      >
        <Ionicons name="cloud-upload" size={24} color="#fff" />
        <Text style={styles.uploadButtonText}>Upload Notes</Text>
      </TouchableOpacity>
 
      {uploadedFiles.length > 0 && (
        <View style={styles.fileListCard}>
          <Text style={styles.fileListTitle}>Uploaded Files ({uploadedFiles.length})</Text>
          {uploadedFiles.map((file, idx) => (
            <View key={idx} style={styles.fileRow}>
              <Ionicons name="document-text" size={18} color={PRIMARY} />
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <TouchableOpacity onPress={() => removeFile(file.name)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={RED} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
 
      {uploadedFiles.length > 0 && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.summaryButton]}
            onPress={() => handleGenerateFromFiles('summary')}
          >
            <Ionicons name="book" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Summary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.quizButton]}
            onPress={() => handleGenerateFromFiles('quiz')}
          >
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
 
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={PRIMARY} />
        <Text style={styles.infoText}>Supported formats: PDF, Word, plain text</Text>
      </View>
    </ScrollView>
  );
}
 
// ─── Styles ───────────────────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  contentPadding: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
  screenHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: BORDER },
  screenHeaderTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: PRIMARY },
  backButton: { width: 36, height: 36, borderRadius: 8, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  saveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: GREEN, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, gap: 6 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  heading: { fontSize: 28, fontWeight: '700', color: PRIMARY, marginBottom: 8 },
  description: { fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 20 },
  counterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: BORDER, gap: 8 },
  counterText: { fontSize: 14, fontWeight: '600', color: GREEN },
  counterTextZero: { color: RED },
  uploadButton: { backgroundColor: PRIMARY, borderRadius: 12, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 },
  uploadButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabledButton: { opacity: 0.6 },
  fileListCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  fileListTitle: { fontSize: 14, fontWeight: '600', color: PRIMARY, marginBottom: 12 },
  fileRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: BG, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: PRIMARY, gap: 10 },
  fileName: { flex: 1, fontSize: 13, color: '#333' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButton: { flex: 1, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  summaryButton: { backgroundColor: GREEN },
  quizButton: { backgroundColor: PRIMARY },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  infoBox: { backgroundColor: '#e8e4f3', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  infoText: { color: PRIMARY, fontSize: 14, flex: 1 },
  loadingText: { fontSize: 18, fontWeight: '600', color: PRIMARY, marginTop: 24 },
  loadingSubtext: { fontSize: 14, color: '#999', marginTop: 8 },
  title: { fontSize: 24, fontWeight: '700', color: PRIMARY, marginBottom: 16 },
  bulletContainer: { marginBottom: 24 },
  bulletPoint: { flexDirection: 'row', marginBottom: 12 },
  bulletDot: { fontSize: 20, color: PRIMARY, marginRight: 8, marginTop: -2 },
  bulletText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },
  termsContainer: { marginTop: 24 },
  termsTitle: { fontSize: 18, fontWeight: '600', color: PRIMARY, marginBottom: 12 },
  termItem: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: PRIMARY },
  termName: { fontWeight: '600', color: PRIMARY, fontSize: 14 },
  termDef: { color: '#666', fontSize: 13, marginTop: 4, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: BORDER },
  modalTitle: { fontSize: 20, fontWeight: '700', color: PRIMARY },
  modalBody: { paddingHorizontal: 20, paddingVertical: 20 },
  optionSection: { marginBottom: 28 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: PRIMARY, marginBottom: 12 },
  optionRow: { flexDirection: 'row', gap: 10 },
  optionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: BG, borderWidth: 2, borderColor: BORDER, alignItems: 'center' },
  optionButtonActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  optionButtonText: { fontSize: 14, fontWeight: '600', color: '#666' },
  optionButtonTextActive: { color: '#fff' },
  modalActions: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  skipButton: { paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: PRIMARY, alignItems: 'center' },
  skipButtonText: { fontSize: 13, fontWeight: '600', color: PRIMARY },
  generateButton: { paddingVertical: 14, borderRadius: 8, backgroundColor: PRIMARY, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  generateButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});