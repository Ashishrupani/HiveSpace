
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform , StyleSheet} from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '@/components/ui/BackButton';
import colors from '@/constants/theme';

export default function CreateGroup() {
	const [groupName, setGroupName] = useState('');
	const [members, setMembers] = useState('');
	const router = useRouter();

	const handleCreate = () => {
		if (!groupName.trim()) {
			Alert.alert('Error', 'Group name is required.');
			return;
		}
		// TODO: Replace with API call to create group
		Alert.alert('Success', `Group "${groupName}" created!`);
		setGroupName('');
		setMembers('');
		router.back();
	};

	return (
		<KeyboardAvoidingView
			style={createGroupStyles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<BackButton onPress={() => router.navigate('/groupSetting')}/>
			<Text style={createGroupStyles.title}>Create a New Group</Text>
			<TextInput
				placeholder="Group Name"
				value={groupName}
				onChangeText={setGroupName}
				style={createGroupStyles.input}
				placeholderTextColor="#b0b0b0"
				autoCapitalize="words"
				returnKeyType="done"
			/>
			<TextInput
				placeholder="Number of Members (optional)"
				value={members}
				onChangeText={setMembers}
				style={createGroupStyles.input}
				placeholderTextColor="#b0b0b0"
				keyboardType="numeric"
				returnKeyType="done"
			/>
			<TouchableOpacity style={createGroupStyles.button} onPress={handleCreate}>
				<Text style={createGroupStyles.buttonText}>Create Group</Text>
			</TouchableOpacity>
		</KeyboardAvoidingView>
	);
}


const createGroupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    padding: 24,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
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
    marginBottom: 18,
    color: colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
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


