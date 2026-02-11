import React from 'react';
import { View, ScrollView, ActivityIndicator, Text, RefreshControl } from 'react-native';
import groupDashboardStyles from '../../../constants/styles/groupDashboard.styles';
import GroupCard from '@/components/ui/cards/groupCard';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/clerk-expo';

type JoinedGroup = {
  id: string;
  name: string;
  members: number;
  iconName?: string;
  logoUri?: string;
};

export default function GroupDashboard() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();

  // matches the rest of your app (GroupSetting.tsx)
  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
  const iphoneTesting = `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000`;

  const [groups, setGroups] = React.useState<JoinedGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const normalizeGroups = (payload: any): JoinedGroup[] => {
    // Your controller returns: { success: true, groups: [...] }
    const list = Array.isArray(payload)
      ? payload
      : payload?.groups ?? payload?.data ?? payload?.joinedGroups ?? [];

    return (Array.isArray(list) ? list : [])
      .map((g: any) => ({
        id: String(g.id ?? g._id ?? ''),
        name: String(g.name ?? ''),
        members: Number(g.members ?? g.memberCount ?? g.UID?.length ?? 0),
        iconName: g.iconName,
        logoUri: g.logoUri,
      }))
      .filter((g: JoinedGroup) => !!g.id);
  };

  const fetchJoinedGroups = async () => {
    if (!isLoaded || !user?.id) {
      setGroups([]);
      setError('Please sign in to see your groups.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const token = await getToken();

      // ✅ THIS matches your groupRoutes.js:
      // router.post("/my-groups", verifyAuth, getUserJoinedGroupsHandler);
      const response = await axios.post(
        `${baseUrl}/api/groups/my-groups`,
        {}, // no body needed; userId comes from verifyAuth middleware
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.status !== 200) {
        throw new Error('Failed to load your groups.');
      }

      const joined = normalizeGroups(response.data);
      setGroups(joined);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ??
        e?.message ??
        'Failed to load your groups.';
      setGroups([]);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchJoinedGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJoinedGroups();
    setRefreshing(false);
  };

  const onGroupPress = (id: string) => {
    // If you don’t have this route yet, you can comment this out.
     router.push(`/(groups)/${id}/groupHome` as any);

    // Optional: if you want to navigate somewhere else, change it here.
    console.log('Pressed group:', id);
  };

  if (loading) {
    return (
      <View
        style={[
          groupDashboardStyles.container,
          { alignItems: 'center', justifyContent: 'center' },
        ] as any}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={groupDashboardStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={groupDashboardStyles.scrollContent}>
        {!!error && <Text style={{ marginBottom: 12 } as any}>{error}</Text>}

        {!error && groups.length === 0 && (
          <Text style={{ marginBottom: 12 } as any}>
            You’re not in any groups yet. Join one from Group Settings.
          </Text>
        )}

        {groups.map((g) => (
          <GroupCard
            key={g.id}
            name={g.name}
            members={g.members}
            iconName={g.iconName ?? 'person.3.fill'}
            logoUri={g.logoUri}
            onPress={() => onGroupPress(g.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
