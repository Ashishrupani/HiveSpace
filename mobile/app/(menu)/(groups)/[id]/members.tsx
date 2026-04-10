// members.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/expo';
import axios from 'axios';
import BackButton from '@/components/ui/BackButton';
import { API_BASE_URL, IPHONE_TESTING_URL } from '@/api/constants';

type Member = {
  name: string;
  UID: string;
};

// Toggle this to switch between environments
const base = API_BASE_URL; 

export default function GroupMembersPage() {
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const [members, setMembers] = useState<Member[]>([]);
  const [adminUID, setAdminUID] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currentUserId = user?.id ?? '';
  const isAdmin = !!currentUserId && currentUserId === adminUID;

  // ── Fetch members ─────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async (silent = false) => {
    if (!groupId || !isLoaded) return;
    if (!silent) setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await axios.post(
        `${base}/api/groups/${groupId}/members`,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminUID(res?.data?.admin ?? '');
      const seen = new Set<string>();
      const unique = (res?.data?.members ?? []).filter((m: Member) => {
        if (seen.has(m.UID)) return false;
        seen.add(m.UID);
        return true;
      });
      setMembers(unique);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to load members.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, isLoaded]);

  const hasFetched = React.useRef(false);

useEffect(() => {
  hasFetched.current = false;
}, [groupId]);

useEffect(() => {
  if (!isLoaded) return;
  if (hasFetched.current) return;
  hasFetched.current = true;
  fetchMembers();
}, [isLoaded, groupId]);

  // ── Kick ──────────────────────────────────────────────────────────────────
  const handleKick = (member: Member) => {
    Alert.alert('Kick Member', `Remove ${member.name} from the group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Kick',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(member.UID);
          try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            await axios.post(
              `${base}/api/groups/${groupId}/kick`,
              { groupId, memberId: member.UID },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setMembers((prev) => prev.filter((m) => m.UID !== member.UID));
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to kick member.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  // ── Leave ─────────────────────────────────────────────────────────────────
  const handleLeave = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setActionLoading('leave');
          try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            await axios.post(
              `${base}/api/groups/${groupId}/leave`,
              { groupId },
              { headers: { Authorization: `Bearer ${token}` } }
            );
             setActionLoading(null);
            router.replace('/(menu)/(groups)/groupDashboard' as any);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to leave group.');
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    Alert.alert(
      'Delete Group',
      'This will permanently delete the group for all members. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading('delete');
            try {
              const token = await getToken();
              if (!token) throw new Error('Not authenticated');
              await axios.post(
                `${base}/api/groups/deleteGroup`,
                { groupId },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setActionLoading(null);
              router.replace('/(menu)/(groups)/groupDashboard' as any);
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message ?? 'Failed to delete group.');
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#342A5F" />
      </View>
    );
  }

  const adminMember = members.find((m) => m.UID === adminUID);
  const regularMembers = members.filter((m) => m.UID !== adminUID);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchMembers(true);
            }}
            tintColor="#342A5F"
          />
        }
      >
        <BackButton />

        <View style={styles.header}>
          <Text style={styles.title}>Members</Text>
          <Text style={styles.count}>
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </Text>
        </View>

        {/* Admin row */}
        {adminMember && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ADMIN</Text>
            <MemberRow
              member={adminMember}
              isSelf={adminMember.UID === currentUserId}
              isAdminRow
            />
          </View>
        )}

        {/* Regular members */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MEMBERS</Text>
          {regularMembers.length === 0 ? (
            <Text style={styles.emptyText}>No other members yet.</Text>
          ) : (
            regularMembers.map((member) => (
              <MemberRow
                key={member.UID}
                member={member}
                isSelf={member.UID === currentUserId}
                showKick={isAdmin}
                kicking={actionLoading === member.UID}
                anyActionLoading={actionLoading !== null}
                onKick={() => handleKick(member)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.footer}>
        {isAdmin ? (
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.deleteButton,
              actionLoading === 'delete' && styles.buttonDisabled,
            ]}
            onPress={handleDelete}
            disabled={actionLoading !== null}
          >
            {actionLoading === 'delete' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.footerButtonText}>Delete Group</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.leaveButton,
              actionLoading === 'leave' && styles.buttonDisabled,
            ]}
            onPress={handleLeave}
            disabled={actionLoading !== null}
          >
            {actionLoading === 'leave' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.footerButtonText}>Leave Group</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── MemberRow sub-component ────────────────────────────────────────────────
type MemberRowProps = {
  member: Member;
  isSelf: boolean;
  isAdminRow?: boolean;
  showKick?: boolean;
  kicking?: boolean;
  anyActionLoading?: boolean;
  onKick?: () => void;
};

function MemberRow({
  member,
  isSelf,
  isAdminRow,
  showKick,
  kicking,
  anyActionLoading,
  onKick,
}: MemberRowProps) {
  return (
    <View style={styles.memberRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(member.name?.[0] ?? '?').toUpperCase()}</Text>
      </View>
      <Text style={styles.memberName} numberOfLines={1}>
        {member.name}
        {isSelf ? '  (You)' : ''}
      </Text>
      {isAdminRow && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Admin</Text>
        </View>
      )}
      {showKick && !isSelf && (
        <TouchableOpacity
          style={[styles.kickButton, kicking && styles.buttonDisabled]}
          onPress={onKick}
          disabled={anyActionLoading}
        >
          {kicking ? (
            <ActivityIndicator size="small" color="#e74c3c" />
          ) : (
            <Text style={styles.kickText}>Kick</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  container: { paddingHorizontal: 16, paddingTop: 40, paddingBottom: 32 },

  header: { marginTop: 24, marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', color: '#342A5F' },
  count: { fontSize: 14, color: '#9b93b8', marginTop: 4 },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b0a8cc',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  emptyText: { fontSize: 14, color: '#aaa', fontStyle: 'italic' },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eef8',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#342A5F' },
  memberName: { flex: 1, fontSize: 15, color: '#2d2d44', fontWeight: '500' },

  adminBadge: {
    backgroundColor: '#ede9f8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  adminBadgeText: { fontSize: 11, fontWeight: '700', color: '#342A5F', letterSpacing: 0.5 },

  kickButton: {
    borderWidth: 1.5,
    borderColor: '#e74c3c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minWidth: 52,
    alignItems: 'center',
  },
  kickText: { color: '#e74c3c', fontSize: 13, fontWeight: '600' },

  buttonDisabled: { opacity: 0.5 },

  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0eef8',
    backgroundColor: '#fff',
  },
  footerButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButton: { backgroundColor: '#342A5F' },
  deleteButton: { backgroundColor: '#c0392b' },
  footerButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});