import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Ionicons from '@expo/vector-icons/Ionicons';
import { uploadNotesForSummary, uploadNotesForQuiz, RAGSummary, RAGQuiz, saveQuizToGroup } from '@/api/ragApi';
import QuizComponent, { Question as QType } from '@/components/ui/quiz/Quiz';

type AIMode = 'upload' | 'summary' | 'quiz';

type UploadedFile = {
  name: string;
  content: string;
};

export default function AIPage() {
  const { id: rawId } = useLocalSearchParams();
  const groupId = Array.isArray(rawId) ? rawId[0] : rawId || '';
  
  const [mode, setMode] = useState<AIMode>('upload');
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<RAGSummary | null>(null);
  const [quizData, setQuizData] = useState<RAGQuiz | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  const pickAndUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf', 'application/msword'],
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setLoading(true);

      // Read file content
      let fileContent: string = '';
      try {
        fileContent = await FileSystem.readAsStringAsync(file.uri);
      } catch {
        // If binary, try to extract text (basic approach)
        fileContent = file.name || 'Unable to read file content';
      }

      // Add file to uploaded files list
      setUploadedFiles([...uploadedFiles, { name: file.name, content: fileContent }]);
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
      setLoading(false);
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.name !== fileName));
  };

  const generateFromFiles = (type: 'summary' | 'quiz') => {
    if (uploadedFiles.length === 0) {
      Alert.alert('No files', 'Please upload at least one file first');
      return;
    }

    // Combine all file contents
    const combinedContent = uploadedFiles.map((f) => f.content).join('\n\n---\n\n');

    if (type === 'summary') {
      generateSummary(combinedContent);
    } else {
      generateQuiz(combinedContent);
    }
  };

  const generateSummary = async (content: string) => {
    try {
      setLoading(true);
      const result = await uploadNotesForSummary(content);
      setSummaryData(result);
      setMode('summary');
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate summary');
      setLoading(false);
    }
  };

  const generateQuiz = async (content: string) => {
    try {
      setLoading(true);
      const result = await uploadNotesForQuiz(content);
      setQuizData(result);
      setMode('quiz');
      setLoading(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate quiz');
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizData || !groupId) {
      console.log('Save quiz - Missing data:', { quizData: !!quizData, groupId });
      Alert.alert('Error', 'Unable to save quiz - Missing quiz data or group ID');
      return;
    }

    setSavingQuiz(true);
    try {
      console.log('Saving quiz to group:', groupId);
      await saveQuizToGroup(groupId, quizData);
      Alert.alert('Success', 'Quiz saved to group!');
      setSavingQuiz(false);
    } catch (error: any) {
      console.error('Save quiz error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save quiz';
      Alert.alert('Error', errorMsg);
      setSavingQuiz(false);
    }
  };

  if (mode === 'quiz' && quizData) {
    const questions: QType[] = quizData.questions.map((q) => ({
      id: q.id,
      text: q.question,
      choices: q.choices.map((c) => c.text),
      correctIndex: q.choices.findIndex((c) => c.id === q.answer),
    }));

    return (
      <View style={styles.container}>
        <View style={styles.quizHeaderContainer}>
          <TouchableOpacity onPress={() => setMode('upload')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#342A5f" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.saveQuizButton, savingQuiz && styles.saveQuizButtonDisabled]}
            onPress={handleSaveQuiz}
            disabled={savingQuiz}
          >
            {savingQuiz ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="bookmark" size={18} color="#fff" />
                <Text style={styles.saveQuizButtonText}>Save Quiz</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <QuizComponent questions={questions} groupId={groupId} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#342A5f" />
        <Text style={styles.loadingText}>Generating AI content...</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    );
  }

  if (mode === 'summary' && summaryData) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => setMode('upload')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#342A5f" />
        </TouchableOpacity>
        <View style={styles.contentPadding}>
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
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentPadding}>
        <Text style={styles.heading}>AI Learning Assistant</Text>
        <Text style={styles.description}>
          Upload your notes and let AI generate summaries or quizzes to help you learn.
        </Text>

        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={pickAndUploadDocument}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={24} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Notes to AI</Text>
            </>
          )}
        </TouchableOpacity>

        {uploadedFiles.length > 0 && (
          <View style={styles.filesListContainer}>
            <Text style={styles.filesListTitle}>Uploaded Files ({uploadedFiles.length})</Text>
            {uploadedFiles.map((file, idx) => (
              <View key={idx} style={styles.fileItem}>
                <View style={styles.fileInfo}>
                  <Ionicons name="document-text" size={18} color="#342A5f" />
                  <Text style={styles.fileName}>{file.name}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFile(file.name)}>
                  <Ionicons name="trash" size={18} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {uploadedFiles.length > 0 && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => generateFromFiles('summary')}
            >
              <Ionicons name="book" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Generate Summary</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.quizButton]}
              onPress={() => generateFromFiles('quiz')}
            >
              <Ionicons name="sparkles" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Generate Quiz</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#342A5f" />
          <Text style={styles.infoText}>Supported formats: PDF, Word, Text files</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentPadding: {
    padding: 20,
  },
  backButton: {
    margin: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#342A5f',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: '#342A5f',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoBox: {
    backgroundColor: '#e8e4f3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#342A5f',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#342A5f',
    marginBottom: 16,
  },
  bulletContainer: {
    marginBottom: 24,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletDot: {
    fontSize: 20,
    color: '#342A5f',
    marginRight: 8,
    marginTop: -2,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  termsContainer: {
    marginTop: 24,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#342A5f',
    marginBottom: 12,
  },
  termItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#342A5f',
  },
  termName: {
    fontWeight: '600',
    color: '#342A5f',
    fontSize: 14,
  },
  termDef: {
    color: '#666',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  filesListContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filesListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#342A5f',
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#342A5f',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizButton: {
    backgroundColor: '#342A5f',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#342A5f',
    marginTop: 24,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  quizHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  saveQuizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  saveQuizButtonDisabled: {
    opacity: 0.6,
  },
  saveQuizButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

