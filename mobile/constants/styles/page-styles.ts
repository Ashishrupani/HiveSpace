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
    color: colors.primary,
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
  },
  timerdial: {
    justifyContent: 'center',
		alignItems: 'center',
    padding: 20
  },
  button: {
		width: '100%',
		maxWidth: 50,
		height: 50,
		backgroundColor: colors.primary,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 8,
		shadowColor: colors.shadow,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
  icon:{
    fontSize: 40,
		fontWeight: 'bold',
  },
  input: {
    maxWidth: 350,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.shadow,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.gradientbottom,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
});

export default pageStyles;