import { StyleSheet, Platform } from 'react-native';

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
		color: '#222',
		marginBottom: 8,
		letterSpacing: 0.5,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#666',
		marginBottom: 24,
		textAlign: 'center',
	},
	input: {
		width: '100%',
		maxWidth: 350,
		height: 48,
		backgroundColor: '#fff',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#e0e0e0',
		paddingHorizontal: 16,
		fontSize: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
		shadowRadius: 2,
		elevation: 2,
	},
	button: {
		width: '100%',
		maxWidth: 350,
		height: 48,
		backgroundColor: '#2563eb',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 8,
		shadowColor: '#2563eb',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
	buttonText: {
		color: '#fff',
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
		color: '#444',
		fontSize: 15,
	},
	link: {
		marginLeft: 6,
	},
	linkText: {
		color: '#2563eb',
		fontWeight: 'bold',
		fontSize: 15,
	},
});

export default authStyles;
