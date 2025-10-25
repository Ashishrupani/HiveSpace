import { StyleSheet } from 'react-native';
import { colors } from '../theme';

export const pageStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,//will need to be reduced once top banner is added
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
  rowstyles: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4
  }
});

export default pageStyles;