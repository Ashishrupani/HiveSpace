import React from 'react';
import { View, ScrollView, ActivityIndicator, Text, RefreshControl } from 'react-native';
import groupDashboardStyles from '../../../constants/styles/groupDashboard.styles';
import GroupCard from '@/components/ui/cards/groupCard';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth, useUser } from '@clerk/expo';
import { API_BASE_URL, IPHONE_TESTING_URL } from '@/api/constants';

type JoinedGroup = {
  id: string;
  name: string;
  members: number;
  about?: string;
  iconName?: string;
  logoUri?: string;
  color?: string;
};

const resolveGroupDescription = (_groupName?: string, about?: string) => {
  const trimmedAbout = String(about ?? '').trim();
  return trimmedAbout || 'A place to collaborate and grow together.';
};

export default function GroupDashboard() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();

  // matches the rest of your app (GroupSetting.tsx)
 /*IMPORTANT- Please do not change these URLs */
   const baseUrl = API_BASE_URL;
   const iphoneTesting = IPHONE_TESTING_URL;
/* If you want to change them go to the file named constants.ts it is in the api folder. (mobile/api) */

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
        about: resolveGroupDescription(g.name, g.about),
        iconName: g.icon ?? g.iconName ?? 'person.3.fill', // Map 'icon' from backend to 'iconName'
        logoUri: g.logoUri,
        color: g.color ?? '#342A5f', // Add color mapping with default
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

      const enrichedGroups = await Promise.all(
        joined.map(async (group) => {
          try {
            const detailsResponse = await axios.post(
              `${baseUrl}/api/groups/${group.id}`,
              { groupId: group.id },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const details = detailsResponse?.data?.groupDetails;

            if (!details) return group;

            return {
              ...group,
              name: String(details.name ?? group.name),
              members: Number(details.UID?.length ?? group.members),
              iconName: details.icon ?? details.iconName ?? group.iconName,
              logoUri: details.logoUri ?? group.logoUri,
              color: details.color ?? group.color,
              about: resolveGroupDescription(details.name ?? group.name, details.about ?? group.about),
            };
          } catch {
            return group;
          }
        })
      );

      setGroups(enrichedGroups);
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

  useFocusEffect(
    React.useCallback(() => {
      fetchJoinedGroups();
    }, [isLoaded, user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJoinedGroups();
    setRefreshing(false);
  };

  const onGroupPress = (id: string) => {
    // If you don't have this route yet, you can comment this out.
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
        <Text style={groupDashboardStyles.pageTitle}>My Groups</Text>

        {!!error && <Text style={{ marginBottom: 12 } as any}>{error}</Text>}

        {!error && groups.length === 0 && (
          <Text style={{ marginBottom: 12 } as any}>
            You're not in any groups yet. Join one from Group Settings.
          </Text>
        )}

        {groups.map((g) => (
          <GroupCard
            key={g.id}
            name={g.name}
            members={g.members}
            about={g.about}
            iconName={g.iconName}
            logoUri={g.logoUri}
            color={g.color}
            onPress={() => onGroupPress(g.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}