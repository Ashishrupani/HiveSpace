import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SignedIn } from '@clerk/clerk-expo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import pageStyles from '@/constants/styles/page-styles';
import authStyles from '@/constants/styles/auth.styles';

export default function CreateGroup() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a group name.');
      return;
    }

    setLoading(true);
    try {
      // TODO: replace with real API call (POST /api/groups)
      // const res = await fetch('/api/groups', { method: 'POST', body: JSON.stringify({ name, description, isPrivate }) })
      // await res.json();

      // Simulate network
      await new Promise((r) => setTimeout(r, 700));

      Alert.alert('Success', `Group "${name}" created.`);
      // Navigate to groups list or newly created group page
      router.replace('../groups');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Could not create group. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignedIn>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={pageStyles.scrollContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={28} color="#666" />
            <Text style={pageStyles.title}>Create Group</Text>
          </View>

          <View>
            <Text style={authStyles.label}>Group name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Study Buddies"
              style={authStyles.input}
              editable={!loading}
              returnKeyType="next"
            />

            <Text style={authStyles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Short description of the group"
              style={[authStyles.input, { minHeight: 100, textAlignVertical: 'top' }]}
              multiline
              numberOfLines={4}
              editable={!loading}
            />

            <View style={[pageStyles.rowstyles, { alignItems: 'center', marginBottom: 18 }]}> 
              <Text style={authStyles.label}>Private group</Text>
              <Switch value={isPrivate} onValueChange={setIsPrivate} disabled={loading} />
            </View>

            <TouchableOpacity style={[authStyles.button, loading ? { opacity: 0.6 } : undefined]} onPress={onSubmit} disabled={loading}>
              <Text style={authStyles.buttonText}>{loading ? 'Creating...' : 'Create Group'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ alignItems: 'center', marginTop: 12 }} onPress={() => router.back()} disabled={loading}>
              <Text style={authStyles.linkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SignedIn>
  );
}

