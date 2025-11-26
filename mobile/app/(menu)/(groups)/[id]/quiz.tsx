import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import QuizComponent, { Question as QType } from '@/components/ui/quiz/Quiz';

const QUESTIONS: QType[] = [
  { id: 'q1', text: 'What is 2 + 2?', choices: ['3', '4', '5', '6'], correctIndex: 1 },
  { id: 'q2', text: 'What color is the sky on a clear day?', choices: ['Green', 'Blue', 'Red', 'Yellow'], correctIndex: 1 },
  { id: 'q3', text: 'Which is a fruit?', choices: ['Carrot', 'Apple', 'Potato', 'Onion'], correctIndex: 1 },
  { id: 'q4', text: 'What is the capital of France?', choices: ['Berlin', 'Paris', 'Rome', 'Madrid'], correctIndex: 1 },
  { id: 'q5', text: 'Which number is prime?', choices: ['4', '6', '9', '7'], correctIndex: 3 },
  { id: 'q6', text: 'Which animal barks?', choices: ['Cat', 'Dog', 'Cow', 'Sheep'], correctIndex: 1 },
  { id: 'q7', text: 'What do bees make?', choices: ['Milk', 'Honey', 'Silk', 'Cheese'], correctIndex: 1 },
  { id: 'q8', text: 'How many days in a week?', choices: ['5', '6', '7', '8'], correctIndex: 2 },
  { id: 'q9', text: 'Which is a programming language?', choices: ['Banana', 'React', 'Python', 'Car'], correctIndex: 2 },
  { id: 'q10', text: 'Which direction does the sun rise?', choices: ['West', 'East', 'North', 'South'], correctIndex: 1 },
];

export default function Quiz() {
  const { id } = useLocalSearchParams();

  return <QuizComponent questions={QUESTIONS} groupId={id as string | undefined} />;
}

