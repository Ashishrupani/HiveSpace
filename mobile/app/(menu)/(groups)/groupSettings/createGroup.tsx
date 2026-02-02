
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform , StyleSheet} from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '@/components/ui/BackButton';
import colors from '@/constants/theme';
import axios from 'axios';
import { useUser } from '@clerk/clerk-expo';
import showErrorToast from '@/components/ui/toast/ErrorToast';
import showSuccessToast from '@/components/ui/toast/SuccessToast';
import showInfoToast from '@/components/ui/toast/InfoToast';


export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [about, setAbout] = useState('');
  const router = useRouter();
  const { user } = useUser();

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name is required.');
      return;
    }

    //sending post request to /api/groups/createGroup
    try{
    const response = await axios.post(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/groups/createGroup`, { groupName, about, user });

    //messy handle response but okay for now
    if (response.data.success === false) {

      if (response.data.error == 'group-name-exists'){
        showInfoToast('Group name already exists. Please choose another name.');
      }
      else {
        showErrorToast(`Failed to create group: ${response.data.error}`);
      }
    }
    else {
      showSuccessToast(`Group "${groupName}" created successfully!`);
    }
  }
    catch (error){
      showErrorToast('Failed to create group.');
      return;
    }

    

    setGroupName('');
    setAbout('');
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={createGroupStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackButton onPress={ () => router.replace('/(menu)/(groups)/groupSetting') }/>
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
        placeholder="About this group (optional)"
        value={about}
        onChangeText={setAbout}
        style={[createGroupStyles.input, {height: 90, textAlignVertical: 'top'}]}
        placeholderTextColor="#b0b0b0"
        multiline
        maxLength={300}
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
    marginBottom: 18,
    color: '#000',
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


