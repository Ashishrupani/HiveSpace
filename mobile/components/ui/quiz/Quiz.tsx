import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useAuth } from '@clerk/expo';
import { API_BASE_URL , IPHONE_TESTING_URL} from '@/api/constants';
import quizStyles from '@/constants/styles/quiz-styles';

export type Question = {
  id: string;
  text: string;
  choices: string[];
  correctIndex: number;
};

type QuizProps = {
  questions: Question[];
  groupId?: string;
  onFinish?: (result: { score: number; total: number; answers: (number | null)[] }) => void;
  onBackToFileUpload?: () => void;
};

const baseUrl = API_BASE_URL;

export default function Quiz({ questions, groupId, onFinish, onBackToFileUpload }: QuizProps) {
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [completed, setCompleted] = React.useState(false);
  const [score, setScore] = React.useState<number | null>(null);
  const { getToken } = useAuth();

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const select = (choice: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = choice;
      return next;
    });
  };

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));

  const handleReset = () => {
    setIndex(0);
    setAnswers(Array(questions.length).fill(null));
    setCompleted(false);
    setScore(null);
  };

  const finishQuiz = async () => {
    const computed = answers.reduce<number>(
      (acc, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0),
      0
    );

    setScore(computed);
    setCompleted(true);
    onFinish?.({ score: computed, total: questions.length, answers });

    if (!groupId) return;

    try {
      const token = await getToken();

      // Backend expects: { quizResult: { score, answers, total } }
      await axios.post(
        `${baseUrl}/api/groups/${groupId}/quizResults`,
        {
          quizResult: {
            score: computed,
            answers,
            total: questions.length,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err: any) {
      // Non-blocking — quiz is already marked complete locally
      console.warn(
        '[Quiz] Failed to save quiz results:',
        err?.response?.data || err?.message
      );
    }
  };

  const goNext = () => {
    if (answers[index] === null) {
      Alert.alert('Please select an answer before continuing.');
      return;
    }
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    finishQuiz();
  };

  // ─── Completed Screen ─────────────────────────────────────────────────────────

  if (completed) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={quizStyles.container}>
          <View style={quizStyles.card}>
            {onBackToFileUpload && (
              <TouchableOpacity
                style={quizStyles.fileUploadBackButton}
                onPress={onBackToFileUpload}
              >
                <Ionicons name="arrow-back" size={18} color="#342A5f" />
                <Text style={quizStyles.fileUploadBackText}>Back</Text>
              </TouchableOpacity>
            )}

            <Text style={quizStyles.resultTitle}>
              You scored {score} / {questions.length}
            </Text>

            {questions.map((q, i) => (
              <View key={q.id} style={quizStyles.reviewRow}>
                <Text style={quizStyles.reviewQuestion}>
                  {i + 1}. {q.text}
                </Text>
                <Text style={quizStyles.reviewAnswer}>
                  Your answer:{' '}
                  {answers[i] == null ? '—' : q.choices[answers[i] as number]}
                </Text>
                <Text style={quizStyles.reviewCorrect}>
                  Correct: {q.choices[q.correctIndex]}
                </Text>
              </View>
            ))}

            <TouchableOpacity style={quizStyles.tryAgainButton} onPress={handleReset}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={quizStyles.tryAgainText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Question Screen ──────────────────────────────────────────────────────────

  const q = questions[index];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={quizStyles.container}>
        <View style={quizStyles.card}>
          <Text style={quizStyles.progress}>
            Question {index + 1} / {questions.length}
          </Text>
          <Text style={quizStyles.question}>{q.text}</Text>

          <View style={quizStyles.choices}>
            {q.choices.map((c, idx) => {
              const selected = answers[index] === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => select(idx)}
                  style={[quizStyles.choice, selected && quizStyles.choiceSelected]}
                >
                  <Text
                    style={[
                      quizStyles.choiceText,
                      selected && quizStyles.choiceTextSelected,
                    ]}
                  >
                    {idx + 1}. {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={quizStyles.navRow}>
            <TouchableOpacity
              onPress={goPrev}
              style={[quizStyles.navButton, index === 0 && quizStyles.navButtonDisabled]}
              disabled={index === 0}
            >
              <Text style={quizStyles.navText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goNext}
              style={[
                quizStyles.navButton,
                answers[index] === null && quizStyles.navButtonDisabled,
              ]}
            >
              <Text style={quizStyles.navText}>
                {index === questions.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
