import { StyleSheet, Platform } from 'react-native';

export const colors = {
  primary: '#342A5f',
  accent: '#FFFFFF',

  text: '#F5F5F7',
  subtext: '#808080',
  link: '#342A5F',

  shadow: '#342A5F',
  shadowbox: '#D9D9D9',
  
  gradienttop: '#00082B',
  gradientmid: '#351C38',
  gradientbottom: '#EA9615',
};

const authStyles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
		backgroundColor: '#f7f8fa',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: colors.text,
		marginBottom: 8,
		letterSpacing: 0.5,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: colors.subtext,
		marginBottom: 24,
		textAlign: 'center',
	},
	input: {
		width: '100%',
		maxWidth: 350,
		height: 48,
		backgroundColor: colors.primary,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.shadow,
		paddingHorizontal: 16,
		fontSize: 16,
		marginBottom: 16,
		shadowColor: colors.shadow,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
		shadowRadius: 2,
		elevation: 2,
	},
	button: {
		width: '100%',
		maxWidth: 350,
		height: 48,
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
	buttonText: {
		color: colors.text,
		fontSize: 18,
		fontWeight: '600',
		letterSpacing: 0.5,
	},
	footerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		marginTop: 8,
	},
	footerText: {
		color: colors.subtext,
		fontSize: 15,
	},
	link: {
		marginLeft: 6,
	},
	linkText: {
		color: colors.link,
		fontWeight: 'bold',
		fontSize: 15,
	},
	noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    opacity: 0.5,
  	},

});

export default authStyles;
