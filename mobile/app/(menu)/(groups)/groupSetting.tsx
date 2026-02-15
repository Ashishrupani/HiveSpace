import React, { useState } from 'react'
import { View, ScrollView, TextInput, TouchableOpacity, Text, Alert, Modal, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import groupSettingsStyles from '@/constants/styles/group-settings.styles';
import { useRouter } from 'expo-router';
import GroupCardWithJoin from '@/components/ui/cards/groupCardWithJoin';
import colors from '@/constants/theme';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-expo';
import showErrorToast from '@/components/ui/toast/ErrorToast';
import showSuccessToast from '@/components/ui/toast/SuccessToast';
import showInfoToast from '@/components/ui/toast/InfoToast';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { IconSymbol } from '@/components/ui/icon-symbol';

//available group icons
const GROUP_ICONS = [
  { id: 1, name: 'person.3.fill' as const },
  { id: 2, name: 'book.fill' as const },
  { id: 3, name: 'gamecontroller.fill' as const },
  { id: 4, name: 'music.note' as const },
  { id: 5, name: 'briefcase.fill' as const },
  { id: 6, name: 'dumbbell.fill' as const },
  { id: 7, name: 'camera.fill' as const },
  { id: 8, name: 'heart.fill' as const },
  { id: 9, name: 'lightbulb.fill' as const },
  { id: 10, name: 'flame.fill' as const },
  { id: 11, name: 'star.fill' as const },
  { id: 12, name: 'sparkles' as const },
  { id: 13, name: 'atom' as const },
  { id: 14, name: 'crown.fill' as const },
  { id: 15, name: 'bolt.fill' as const },
  { id: 16, name: 'leaf.fill' as const },
];

const GROUP_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52B788', '#E76F51', '#2A9D8F', 
  '#342A5f', '#6c5ce7'
];

export default function GroupSetting() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
  // For Expo Go app testing on physical iPhone, use the local network IP address instead of localhost
  // Replace baseUrl with iphoneTesting when running on Expo Go on iOS
  const iphoneTesting = `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000`;
  // Only use Iphone testing URL if running on Expo Go on iOS, otherwise use the standard base URL
  
  const [query, setQuery] = React.useState('');
  const [joined, setJoined] = React.useState<Record<string, boolean>>({});
  const [groups, setGroups] = React.useState<Array<{ 
  id: string; 
  name: string; 
  members: number; 
  iconName?: string;
  color?: string; // Add color to the type
}>>([]);
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Modal states
  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [selectedIconId, setSelectedIconId] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>(GROUP_COLORS[0]);
  
  // Create group form states
  const [groupName, setGroupName] = React.useState('');
  const [about, setAbout] = React.useState('');

  const handleJoin = async (id: string, name: string) => {
    if (!isLoaded || !user?.id) {
      Alert.alert('Error', 'Please sign in to join a group.');
      return;
    }

    const token = await getToken();

    try {
      const response = await axios.post(
        `${baseUrl}/api/groups/${id}/join`,
        { groupId: id }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (response.status !== 200) {
        Alert.alert('Error', 'Failed to join group. Please try again.');
        return;
      }

      setJoined(prev => ({ ...prev, [id]: true }));
      Alert.alert('Success!', `You joined ${name}`);
    } catch (error: any) {
      const payload = error?.response?.data;
      if (payload?.error === 'already-a-member') {
        setJoined(prev => ({ ...prev, [id]: true }));
        Alert.alert('Info', `You are already a member of ${name}`);
        return;
      }

      const message = payload?.message ?? 'Failed to join group. Please try again.';
      Alert.alert('Error', message);
    }
  }

  const handleFindGroup = async () => {
  const token = await getToken();
  try {
    const response = await axios.get(
      `${baseUrl}/api/groups/find`,
      { 
        params: query.trim() ? { search: query.trim() } : undefined,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );

    const payload = response.data;
    const results = Array.isArray(payload)
      ? payload
      : payload?.groups ?? payload?.data ?? [];

    setGroups(
      results.map((group: any) => ({
        id: String(group.id ?? group._id ?? ''),
        name: group.name ?? '',
        members: Number(group.members ?? group.memberCount ?? 0),
        iconName: group.icon ?? 'person.3.fill', // Changed from group.iconName to group.icon
        color: group.color ?? '#342A5f', // Added default color
      }))
    );
  } catch (error: any) {
    const message = error?.response?.data?.message ?? 'Failed to load groups.';
    showErrorToast(message);
  }
}

  React.useEffect(() => {
    handleFindGroup();
  }, []);

  React.useEffect(() => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      if (query.trim()) {
        handleFindGroup();
      }
    }, 350);

    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, [query]);

  const handleCreateGroup = async () => {
  if (!groupName.trim()) {
    showInfoToast('Group name is required.');
    return;
  }

  if (!isLoaded || !user?.id) {
    showInfoToast('Please sign in to create a group.');
    return;
  }

  const token = await getToken();

  // Get the selected icon name
  const selectedIcon = GROUP_ICONS.find(icon => icon.id === selectedIconId);

  try {
    const response = await axios.post(
      `${baseUrl}/api/groups/createGroup`,
      {
        groupName,
        about,
        iconName: selectedIcon?.name || 'person.3.fill', // Send the icon name
        color: selectedColor, // Send the selected color
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success == false) {
      if (response.data.error == 'group-name-exists') {
        showInfoToast('Group name already exists. Please choose another name.');
      } else {
        showErrorToast(`Failed to create group: ${response.data.error}`);
      }
    } else {
      showSuccessToast(`Group "${groupName}" created successfully!`);
      if (response.data?.groupId) {
        setJoined(prev => ({ ...prev, [response.data.groupId]: true }));
      }
      handleFindGroup();
      setCreateModalVisible(false);
      
      // Reset all form fields including icon and color
      setGroupName('');
      setAbout('');
      setSelectedIconId(1);
      setSelectedColor(GROUP_COLORS[0]);
    }
  } catch (error) {
    const message = (error as any)?.response?.data?.message ?? 'Failed to create group.';
    showErrorToast(message);
    return;
  }
};

  return (
    <>
      <ScrollView style={groupSettingsStyles.container}>
        <View style={[groupSettingsStyles.navRow, { marginBottom: 28 }]}> 
          <TouchableOpacity 
            style={groupSettingsStyles.navButton} 
            onPress={() => setCreateModalVisible(true)}
          >
            <Text style={groupSettingsStyles.navButtonText}>Create a Group</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search groups"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholderTextColor="#b0b0b0"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleFindGroup}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {groups.map((item) => (
        <GroupCardWithJoin
          key={item.id}
          id={item.id}
          name={item.name}
          members={item.members}
          iconName={item.iconName}
          color={item.color} // Add this line
          isJoined={!!joined[item.id]}
          onJoin={handleJoin}
          onPress={() => {}} // Add an empty onPress handler if needed
        />))}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
  animationType="slide"
  transparent={true}
  visible={createModalVisible}
  onRequestClose={() => setCreateModalVisible(false)}
>
  <KeyboardAvoidingView
    style={modalStyles.modalOverlay}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <View style={modalStyles.modalContent}>
      {/* Header */}
      <View style={modalStyles.modalHeader}>
        <Text style={modalStyles.modalTitle}>Create a New Group</Text>
        <TouchableOpacity
          onPress={() => setCreateModalVisible(false)}
          style={modalStyles.closeButton}
        >
          <Ionicons name="close" size={28} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView
        style={modalStyles.modalBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon Selection Section */}
        <View style={modalStyles.imageSection}>
          <Text style={modalStyles.sectionLabel}>Group Icon</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={modalStyles.imageScrollView}
            contentContainerStyle={modalStyles.scrollContentContainer}
          >
            {GROUP_ICONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  modalStyles.iconOption,
                  { backgroundColor: selectedColor },
                  selectedIconId === item.id && modalStyles.iconOptionSelected,
                ]}
                onPress={() => setSelectedIconId(item.id)}
              >
                <IconSymbol name={item.name} size={32} color="#fff" />
                {selectedIconId === item.id && (
                  <View style={modalStyles.iconCheckmark}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Color Picker Section */}
        <View style={modalStyles.colorSection}>
          <Text style={modalStyles.sectionLabel}>Group Color</Text>
          <View style={modalStyles.colorGrid}>
            {GROUP_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  modalStyles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && modalStyles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text Inputs */}
        <TextInput
          placeholder="Group Name"
          value={groupName}
          onChangeText={setGroupName}
          style={modalStyles.input}
          placeholderTextColor="#b0b0b0"
          autoCapitalize="words"
          returnKeyType="done"
        />
        <TextInput
          placeholder="About this group (optional)"
          value={about}
          onChangeText={setAbout}
          style={[modalStyles.input, modalStyles.textArea]}
          placeholderTextColor="#b0b0b0"
          multiline
          maxLength={300}
          textAlignVertical="top"
        />

        {/* Create Button */}
        <TouchableOpacity
          style={[modalStyles.button, { backgroundColor: selectedColor }]}
          onPress={handleCreateGroup}
        >
          <Text style={modalStyles.buttonText}>Create Group</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </KeyboardAvoidingView>
</Modal>
    </>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  // Icon Selection Styles
  imageSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  imageScrollView: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    paddingRight: 12,
  },
  iconOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconOptionSelected: {
    borderColor: '#4CAF50',
  },
  iconCheckmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  // Color Picker Styles
  colorSection: {
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  colorOptionSelected: {
    borderColor: '#000',
    borderWidth: 3,
  },
  // Input Styles
  input: {
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  textArea: {
    height: 90,
    paddingTop: 14,
  },
  orText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});


