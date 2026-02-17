import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from 'expo-router';
import quizStyles from '@/constants/styles/quiz-styles';
import BackButton from '@/components/ui/BackButton';

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
};

export default function Quiz({ questions, groupId, onFinish }: QuizProps) {
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>(Array(questions.length).fill(null));
  const [completed, setCompleted] = React.useState(false);
  const [score, setScore] = React.useState<number | null>(null);
  const navigation = useNavigation();
  const select = (choice: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[index] = choice;
      return next;
    });
  };

  const goPrev = () => setIndex(i => Math.max(0, i - 1));

  const finishQuiz = async () => {
    // compute score
    const computed = answers.reduce((acc: number, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0), 0);
    setScore(computed);
    setCompleted(true);

    const payload = { groupId, answers, score: computed, total: questions.length };

    if (groupId) {
      try {
        await fetch(`/api/groups/${groupId}/quizResults`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Failed to persist quiz results', err);
      }
    }

    onFinish?.({ score: computed as number, total: questions.length, answers });
  };

  const goNext = () => {
    if (answers[index] === null) {
      Alert.alert('Please select an answer before continuing');
      return;
    }

    if (index < questions.length - 1) {
      setIndex(i => i + 1);
      return;
    }

    finishQuiz();
  };

  const handleReset = () => {
    setIndex(0);
    setAnswers(Array(questions.length).fill(null));
    setCompleted(false);
    setScore(null);
  }

  if (completed) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={quizStyles.container}>
          <View style={quizStyles.card}>
            <Text style={quizStyles.resultTitle}>You scored {score} / {questions.length}</Text>

            {questions.map((q, i) => (
              <View key={q.id} style={quizStyles.reviewRow}>
                <Text style={quizStyles.reviewQuestion}>{i + 1}. {q.text}</Text>
                <Text style={quizStyles.reviewAnswer}>Your answer: {answers[i] == null ? '—' : q.choices[answers[i] as number]}</Text>
                <Text style={quizStyles.reviewCorrect}>Correct: {q.choices[q.correctIndex]}</Text>
              </View>
            ))}

            <TouchableOpacity 
              style={quizStyles.tryAgainButton}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={quizStyles.tryAgainText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const q = questions[index];

  return (
    <View style={{ flex: 1 }}>
      <BackButton />
      <ScrollView contentContainerStyle={quizStyles.container}>
        <View style={quizStyles.card}>
        <Text style={quizStyles.progress}>{`Question ${index + 1} / ${questions.length}`}</Text>
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
                <Text style={[quizStyles.choiceText, selected && quizStyles.choiceTextSelected]}>
                  {`${idx + 1}. ${c}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={quizStyles.navRow}>
          <TouchableOpacity onPress={goPrev} style={[quizStyles.navButton, index === 0 && quizStyles.navButtonDisabled]} disabled={index === 0}>
            <Text style={quizStyles.navText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goNext} style={[quizStyles.navButton, answers[index] === null && quizStyles.navButtonDisabled]}>
            <Text style={quizStyles.navText}>{index === questions.length - 1 ? 'Finish' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

