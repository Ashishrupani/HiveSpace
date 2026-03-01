import BackButton from '@/components/ui/BackButton';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import BaseCard from '@/components/ui/cards/baseCard';
import GoalsCard from '@/components/ui/cards/goalsCard';
import { useGroupGoals } from '@/contexts/GroupGoalsContext';
import { getSavedQuizzes, getSavedSummaries } from '@/api/ragApi';
import { IconSymbol } from '@/components/ui/icon-symbol';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { API_BASE_URL, IPHONE_TESTING_URL } from '@/api/constants';

type GroupMeta = {
  name: string;
  color: string;
  iconName: string;
  about?: string;
  logoUri?: string;
};

const getHardcodedGroupDescription = (groupName?: string, about?: string) => {
  const normalized = String(groupName ?? '').trim().toLowerCase();

  if (normalized === 'creativity') return 'Where we get creative';
  if (normalized === "talia's group" || normalized === 'talias group') return 'Testing stuff';
  if (normalized === 'book club') return 'Where we read';

  const trimmedAbout = String(about ?? '').trim();
  return trimmedAbout || 'A place to collaborate and grow together.';
};

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
  '#342A5f', '#6c5ce7', '#da07bddc'
];

export default function GroupHome() {
    const {id} = useLocalSearchParams();
    const router = useRouter();
    const { getTopThreeGroupGoals } = useGroupGoals();
    const { getToken } = useAuth();
    const { isLoaded, user } = useUser();
    const [savedQuizCount, setSavedQuizCount] = React.useState(0);
    const [savedSummaryCount, setSavedSummaryCount] = React.useState(0);
    const [groupMeta, setGroupMeta] = React.useState<GroupMeta>({
      name: 'Group',
      color: '#342A5f',
      iconName: 'person.3.fill',
    });
    const [editModalVisible, setEditModalVisible] = React.useState(false);
    const [editGroupName, setEditGroupName] = React.useState('');
    const [editAbout, setEditAbout] = React.useState('');
    const [selectedIconId, setSelectedIconId] = React.useState<number>(1);
    const [selectedColor, setSelectedColor] = React.useState<string>('#342A5f');
    const [savingGroupEdit, setSavingGroupEdit] = React.useState(false);
    const apiBaseCandidates = React.useMemo(() => {
      const raw = [API_BASE_URL, IPHONE_TESTING_URL].filter(Boolean);
      return Array.from(new Set(raw));
    }, []);

    // Add refs to prevent duplicate API calls
    const savedCountsFetchedRef = React.useRef<string | null>(null);
    const groupMetaFetchedRef = React.useRef<string | null>(null);

    const postWithBaseFallback = React.useCallback(
      async (path: string, body: any, token: string) => {
        let lastError: any = null;
        for (const base of apiBaseCandidates) {
          try {
            return await axios.post(`${base}${path}`, body, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (error: any) {
            lastError = error;
          }
        }
        throw lastError;
      },
      [apiBaseCandidates]
    );

    const updateGroupWithFallback = React.useCallback(
      async (groupIdValue: string, payload: any, token: string) => {
        const path = `/api/groups/updateGroup`;

        let lastError: any = null;
          try {
            const body = path ? { ...payload, groupId: groupIdValue } : payload;

            const response = await postWithBaseFallback(path, body, token);
            return response;
          } catch (error: any) {
            lastError = error;
          }

        throw lastError;
      },
      [postWithBaseFallback]
    );

    const groupId = Array.isArray(id) ? id[0] : id;

    React.useEffect(() => {
      const fetchSavedCounts = async () => {
        if (!groupId || savedCountsFetchedRef.current === groupId) return;
        savedCountsFetchedRef.current = groupId;
        try {
          const [quizzes, summaries] = await Promise.all([
            getSavedQuizzes(groupId),
            getSavedSummaries(groupId),
          ]);
          setSavedQuizCount(quizzes?.length ?? 0);
          setSavedSummaryCount(summaries?.length ?? 0);
        } catch {
          setSavedQuizCount(0);
          setSavedSummaryCount(0);
        }
      };

      fetchSavedCounts();
    }, [groupId]);

    React.useEffect(() => {
      const fetchGroupMeta = async () => {
        if (!groupId || !isLoaded || !user?.id || groupMetaFetchedRef.current === groupId) return;
        groupMetaFetchedRef.current = groupId;
        try {
          const token = await getToken();
          if (!token) return;

          const response = await postWithBaseFallback(`/api/groups/${groupId}`, { groupId }, token);

          const currentGroup = response?.data?.groupDetails;

          if (currentGroup) {
            const iconName = currentGroup.icon ?? currentGroup.iconName ?? 'person.3.fill';
            const color = currentGroup.color ?? '#342A5f';

            setGroupMeta({
              name: currentGroup.name ?? `Group ${groupId}`,
              color,
              iconName,
              about: getHardcodedGroupDescription(currentGroup.name, currentGroup.about),
              logoUri: currentGroup.logoUri,
            });

            setEditGroupName(currentGroup.name ?? '');
            setEditAbout(currentGroup.about ?? '');
            setSelectedColor(color);

            const matchingIcon = GROUP_ICONS.find((item) => item.name === iconName);
            setSelectedIconId(matchingIcon?.id ?? 1);
          }
        } catch {
          setGroupMeta((prev) => ({
            ...prev,
            name: groupId ? `Group ${groupId}` : 'Group',
          }));
        }
      };

      fetchGroupMeta();
    }, [groupId, getToken, isLoaded, user?.id, postWithBaseFallback]);

    React.useEffect(() => {
      // keep mount/unmount logs for debugging only; do not mutate navigator here
      console.log('GroupHome mounted');
      return () => {
        console.log('GroupHome unmounted');
      };
    }, []);

  const groupName = groupMeta.name;
  const selectedEditIconName = GROUP_ICONS.find((icon) => icon.id === selectedIconId)?.name ?? 'person.3.fill';
  const livePreviewMeta: GroupMeta = {
    name: editGroupName.trim() || groupMeta.name,
    color: selectedColor || groupMeta.color,
    iconName: selectedEditIconName,
    about: getHardcodedGroupDescription(editGroupName.trim() || groupMeta.name, editAbout),
    logoUri: groupMeta.logoUri,
  };
  const displayedGroupMeta = editModalVisible ? livePreviewMeta : groupMeta;

  const onGroupGoalsPress = () => {
    if (!groupId) return;
    router.push(`/(groups)/${groupId}/groupGoals` as any);
  };

  const openEditModal = () => {
    setEditGroupName(groupMeta.name ?? '');
    setEditAbout(groupMeta.about ?? '');
    setSelectedColor(groupMeta.color ?? '#342A5f');

    const matchingIcon = GROUP_ICONS.find((item) => item.name === (groupMeta.iconName ?? 'person.3.fill'));
    setSelectedIconId(matchingIcon?.id ?? 1);
    setEditModalVisible(true);
  };

  const handleSaveGroupEdits = async () => {
    if (!groupId) {
      Alert.alert('Error', 'Group ID is missing. Please reopen this group and try again.');
      return;
    }

    if (!editGroupName.trim()) {
      Alert.alert('Error', 'Group name is required.');
      return;
    }

    if (!isLoaded || !user?.id) {
      Alert.alert('Error', 'Please sign in to edit group details.');
      return;
    }

    try {
      setSavingGroupEdit(true);
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not available. Please sign in again.');
        return;
      }
      const selectedIcon = GROUP_ICONS.find((icon) => icon.id === selectedIconId);

      const response = await updateGroupWithFallback(
        groupId,
        {
          groupId,
          groupName: editGroupName.trim(),
          about: editAbout,
          iconName: selectedIcon?.name ?? 'person.3.fill',
          color: selectedColor,
        },
        token
      );

      if (response?.data?.success === false) {
        const msg = response?.data?.message ?? 'Failed to update group details.';
        Alert.alert('Error', msg);
        return;
      }

      const updated = response?.data?.group;
      if (updated) {
        setGroupMeta((prev) => ({
          ...prev,
          name: updated.name ?? prev.name,
          about: getHardcodedGroupDescription(updated.name ?? prev.name, updated.about ?? prev.about),
          iconName: updated.icon ?? prev.iconName,
          color: updated.color ?? prev.color,
        }));
      }

      // Re-fetch canonical group data to ensure banner reflects persisted backend values
      try {
        const detailsResponse = await postWithBaseFallback(`/api/groups/${groupId}`, { groupId }, token);

        const refreshedGroup = detailsResponse?.data?.groupDetails;
        if (refreshedGroup) {
          setGroupMeta((prev) => ({
            ...prev,
            name: refreshedGroup.name ?? prev.name,
            about: getHardcodedGroupDescription(refreshedGroup.name ?? prev.name, refreshedGroup.about ?? prev.about),
            iconName: refreshedGroup.icon ?? prev.iconName,
            color: refreshedGroup.color ?? prev.color,
            logoUri: refreshedGroup.logoUri ?? prev.logoUri,
          }));
        }
      } catch {
        // Keep optimistic updated UI when refresh request fails.
      }

      setEditModalVisible(false);
      Alert.alert('Success', 'Group details updated successfully.');
    } catch (error: any) {
      const rawData = error?.response?.data;
      const backendBody = typeof error?.response?.data === 'string' ? error.response.data : '';
      const routeMissing = backendBody.includes('Cannot POST') && backendBody.includes('/api/groups');

      const msg = routeMissing
        ? 'Update endpoint not found on the running backend. Please restart the backend server on port 5000 and try again.'
        :
        (typeof rawData === 'string' ? rawData : rawData?.message) ??
        error?.message ??
        'Failed to update group details.';
      Alert.alert('Error', msg);
    } finally {
      setSavingGroupEdit(false);
    }
  };

  const HorizontalCard = ({
    icon,
    title,
    subtitle,
    detail,
    onPress,
  }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    subtitle: string;
    detail?: string;
    onPress?: () => void;
  }) => (
    <BaseCard
      width={'100%'}
      height={108}
      onPress={onPress}
      style={styles.horizontalCard}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardIconWrap}>
          <Ionicons name={icon} size={20} color="#342A5f" />
        </View>
        <View style={styles.cardTextWrap}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
          {detail ? <Text style={styles.cardDetail}>{detail}</Text> : null}
        </View>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={20} color="#8b84a8" /> : null}
    </BaseCard>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />

      <View style={[styles.groupBanner, { backgroundColor: displayedGroupMeta.color }]}> 
        <View style={styles.bannerLeft}>
          {displayedGroupMeta.logoUri ? (
            <Image source={{ uri: displayedGroupMeta.logoUri }} style={styles.bannerLogo} resizeMode="cover" />
          ) : (
            <View style={styles.bannerIconCircle}>
              <IconSymbol name={displayedGroupMeta.iconName as any} size={30} color="#fff" />
            </View>
          )}
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>{displayedGroupMeta.name || groupName}</Text>
            <Text style={styles.bannerId}>ID: {groupId}</Text>
            <Text style={styles.bannerAbout} numberOfLines={2}>
              {getHardcodedGroupDescription(displayedGroupMeta.name, displayedGroupMeta.about)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bannerColorPill} onPress={openEditModal}>
          <View style={styles.bannerColorDot} />
          <Text style={styles.bannerColorText}>Edit</Text>
        </TouchableOpacity>
      </View>
      

      <GoalsCard 
        goals={getTopThreeGroupGoals(groupId)}
        onPress={onGroupGoalsPress}
      />

      <View style={styles.horizontalCardsList}>
        <HorizontalCard
          icon="podium"
          title="Leaderboard"
          subtitle="Top contributors and points"
          detail="View full rankings"
          onPress={() => router.push(`/(groups)/${id}/leaderboard` as any)}
        />

        <HorizontalCard
          icon="reader"
          title="AI"
          subtitle="Quiz and summary generation"
          detail="Upload files and generate study content"
          onPress={() => router.push(`/(groups)/${id}/quiz` as any)}
        />

        <HorizontalCard
          icon="bookmark"
          title="Saved"
          subtitle={`Saved quizzes: ${savedQuizCount}`}
          detail={`Saved summaries: ${savedSummaryCount}`}
          onPress={() => router.push(`/(groups)/${id}/saved` as any)}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          if (!savingGroupEdit) setEditModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Group</Text>
              <TouchableOpacity onPress={() => !savingGroupEdit && setEditModalVisible(false)} disabled={savingGroupEdit}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Group Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconScrollContent}>
                {GROUP_ICONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.iconOption,
                      { backgroundColor: selectedColor },
                      selectedIconId === item.id && styles.iconOptionSelected,
                    ]}
                    disabled={savingGroupEdit}
                    onPress={() => setSelectedIconId(item.id)}
                  >
                    <IconSymbol name={item.name} size={28} color="#fff" />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionLabel}>Group Color</Text>
              <View style={styles.colorGrid}>
                {GROUP_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    disabled={savingGroupEdit}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <TextInput
                value={editGroupName}
                onChangeText={setEditGroupName}
                placeholder="Group Name"
                placeholderTextColor="#b0b0b0"
                style={styles.modalInput}
                autoCapitalize="words"
                returnKeyType="done"
                editable={!savingGroupEdit}
              />

              <TextInput
                value={editAbout}
                onChangeText={setEditAbout}
                placeholder="About this group (optional)"
                placeholderTextColor="#b0b0b0"
                style={[styles.modalInput, styles.modalTextArea]}
                multiline
                textAlignVertical="top"
                maxLength={300}
                editable={!savingGroupEdit}
              />

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: selectedColor }, savingGroupEdit && styles.saveButtonDisabled]}
                onPress={handleSaveGroupEdits}
                disabled={savingGroupEdit}
              >
                <Text style={styles.saveButtonText}>{savingGroupEdit ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent visible={savingGroupEdit} animationType="fade">
        <View style={styles.savingOverlay}>
          <View style={styles.savingCard}>
            <ActivityIndicator size="large" color="#342A5f" />
            <Text style={styles.savingText}>Saving group changes...</Text>
          </View>
        </View>
      </Modal>

    </ScrollView>
  )

}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  horizontalCardsList: {
    marginTop: 16,
    gap: 12,
  },
  groupBanner: {
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bannerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  bannerId: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    marginTop: 2,
  },
  bannerAbout: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
    paddingRight: 8,
  },
  bannerColorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },
  bannerColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  bannerColorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#342A5f',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#342A5f',
    marginBottom: 10,
    marginTop: 6,
  },
  iconScrollContent: {
    paddingRight: 8,
    marginBottom: 10,
  },
  iconOption: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    borderColor: '#4CAF50',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#000',
  },
  modalInput: {
    backgroundColor: '#f7f8fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    marginTop: 10,
  },
  modalTextArea: {
    minHeight: 84,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  savingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    minWidth: 220,
  },
  savingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#342A5f',
  },
  horizontalCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f0fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#342A5f',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  cardDetail: {
    fontSize: 12,
    color: '#8b84a8',
    marginTop: 4,
  },
});
