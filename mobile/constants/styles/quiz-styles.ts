import { StyleSheet } from 'react-native';

export const quizStyles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, minHeight: '100%', justifyContent: 'center', backgroundColor: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  progress: { fontSize: 14, color: '#666', marginBottom: 8 },
  question: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  choices: { marginTop: 8 },
  choice: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8, backgroundColor: '#fff' },
  choiceSelected: { backgroundColor: '#342A5f', borderColor: '#342A5f' },
  choiceText: { color: '#111', fontSize: 16 },
  choiceTextSelected: { color: '#fff' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  navButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#342A5f' },
  navButtonDisabled: { backgroundColor: '#ddd', opacity: 0.7 },
  navText: { color: '#fff', fontWeight: '600' },
  fileUploadBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  fileUploadBackText: {
    color: '#342A5f',
    fontSize: 14,
    fontWeight: '600',
  },
  resultTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  reviewRow: { marginBottom: 12 },
  reviewQuestion: { fontWeight: '600' },
  reviewAnswer: { color: '#333' },
  reviewCorrect: { color: '#0a7ea4' },
  tryAgainButton: {
    marginTop: 24,
    backgroundColor: '#342A5f',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tryAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default quizStyles;