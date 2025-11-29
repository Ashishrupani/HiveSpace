import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BackButton from '@/components/ui/BackButton';
import colors from '@/constants/theme';

export default function JoinGroup() {
	const [groupName, setGroupName] = useState('');
	const [groupId, setGroupId] = useState('');
	const router = useRouter();
	const params = useLocalSearchParams();

	useEffect(() => {
		if (params.groupId && typeof params.groupId === 'string') {
			setGroupId(params.groupId);
		}
	}, [params.groupId]);

	const handleJoin = () => {
		if (!groupName.trim() && !groupId.trim()) {
			Alert.alert('Error', 'Please enter a group name or group ID.');
			return;
		}
		// TODO: Replace with API call to join group
		Alert.alert('Success', 'You have joined the group!');
		setGroupName('');
		setGroupId('');
		router.back();
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<BackButton onPress={() => router.replace('/(menu)/(groups)/groupSetting')}/>
			<Text style={styles.title}>Join a Group</Text>
			<TextInput
				placeholder="Group Name"
				value={groupName}
				onChangeText={setGroupName}
				style={styles.input}
				placeholderTextColor="#b0b0b0"
				autoCapitalize="words"
				returnKeyType="done"
			/>
			<Text style={styles.orText}>or</Text>
			<TextInput
				placeholder="Group ID"
				value={groupId}
				onChangeText={setGroupId}
				style={styles.input}
				placeholderTextColor="#b0b0b0"
				autoCapitalize="none"
				returnKeyType="done"
			/>
			<TouchableOpacity style={styles.button} onPress={handleJoin}>
				<Text style={styles.buttonText}>Join Group</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f7f8fa',
		padding: 24,
		justifyContent: 'flex-start',
	},
	title: {
		fontSize: 26,
		fontWeight: '700',
		color: '#000',
		marginBottom: 18,
		textAlign: 'center',
		letterSpacing: 0.2,
	},
	input: {
		backgroundColor: '#fff',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e0e0e0',
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		marginBottom: 12,
		color: '#000',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	orText: {
		textAlign: 'center',
		color: '#888',
		marginVertical: 6,
		fontSize: 15,
		fontWeight: '500',
	},
	button: {
		backgroundColor: colors.primary,
		borderRadius: 10,
		paddingVertical: 14,
		alignItems: 'center',
		marginTop: 12,
		shadowColor: colors.primary,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 4,
		elevation: 2,
	},
	buttonText: {
		color: '#fff',
		fontSize: 17,
		fontWeight: '600',
		letterSpacing: 0.2,
	},
});

