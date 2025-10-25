import { StyleSheet } from 'react-native';
import { colors } from '../theme';

export const pageStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 60,
    backgroundColor: '#f7f8fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 24,
  },
});

export default pageStyles;