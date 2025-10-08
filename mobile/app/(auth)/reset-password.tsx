import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import authStyles from '../../styles/auth.styles'
import React from 'react';
import { Stack } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';

export default function PwReset() {
	const [emailAddress, setEmailAddress] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [code, setCode] = React.useState('');
	const [successfulCreation, setSuccessfulCreation] = React.useState(false);
	const { signIn, setActive } = useSignIn();

	// Request a passowrd reset code by email
	const onRequestReset = async () => {
		try {
			await signIn!.create({
				strategy: 'reset_password_email_code',
				identifier: emailAddress
			});
			setSuccessfulCreation(true);
		} catch (err: any) {
			alert(err.errors[0].message);
		}
	};

	// Reset the password with the code and the new password
	const onReset = async () => {
		try {
			const result = await signIn!.attemptFirstFactor({
				strategy: 'reset_password_email_code',
				code,
				password
			});
			//console.log(result);
			alert('Password reset successfully');

			// Set the user session active, which will log in the user automatically
			await setActive!({ session: result.createdSessionId });
		} catch (err: any) {
			alert(err.errors[0].message);
		}
	};

		return (
			<View style={authStyles.container}>
				<Stack.Screen options={{ headerBackVisible: !successfulCreation }} />

				{!successfulCreation && (
					<>
						<Text style={authStyles.title}>Reset Password</Text>
						<Text style={authStyles.subtitle}>Enter your email to receive a reset code.</Text>
						<TextInput
							style={authStyles.input}
							autoCapitalize="none"
							placeholder="Email address"
							value={emailAddress}
							onChangeText={setEmailAddress}
							placeholderTextColor="#888"
							keyboardType="email-address"
						/>
						<TouchableOpacity style={authStyles.button} onPress={onRequestReset}>
							<Text style={authStyles.buttonText}>Send Reset Email</Text>
						</TouchableOpacity>
					</>
				)}

				{successfulCreation && (
					<>
						<Text style={authStyles.title}>Enter Reset Code</Text>
						<Text style={authStyles.subtitle}>Check your email for the code and set a new password.</Text>
						<TextInput
							style={authStyles.input}
							value={code}
							placeholder="Code"
							onChangeText={setCode}
							placeholderTextColor="#888"
						/>
						<TextInput
							style={authStyles.input}
							placeholder="New password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry={true}
							placeholderTextColor="#888"
						/>
						<TouchableOpacity style={authStyles.button} onPress={onReset}>
							<Text style={authStyles.buttonText}>Set New Password</Text>
						</TouchableOpacity>
					</>
				)}
			</View>
		);
}

