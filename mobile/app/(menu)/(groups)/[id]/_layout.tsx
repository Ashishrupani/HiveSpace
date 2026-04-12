import React from 'react'
import { Tabs, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GroupDataProvider } from '@/contexts/GroupDataContext';
import { ActiveGroupProvider } from '@/contexts/ActiveGroupContext';
 
export default function GroupLayout() {
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : id ?? '';
 
  return (
    // ActiveGroupProvider is the single source of truth for groupId.
    // All tab screens read from here instead of useLocalSearchParams(),
    // which lags behind on Android when useFocusEffect fires.
    <ActiveGroupProvider groupId={groupId}>
      <GroupDataProvider>
        <Tabs
          screenOptions={{ headerShown: false }}
          initialRouteName="groupHome"
        >
          <Tabs.Screen
            name="groupHome"
            initialParams={{ id }}
            options={{
              title: 'Group Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="chat"
            initialParams={{ id }}
            options={{
              title: 'Chat',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="quiz"
            initialParams={{ id }}
            options={{
              title: 'AI',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
            }}
          />
          <Tabs.Screen
            name="leaderboard"
            initialParams={{ id }}
            options={{
              title: 'Leaderboard',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
            }}
          />
          <Tabs.Screen name="groupGoals" initialParams={{ id }} options={{ href: null }} />
          <Tabs.Screen name="saved" initialParams={{ id }} options={{ href: null }} />
          <Tabs.Screen name="members" initialParams={{ id }} options={{ href: null }} />
          <Tabs.Screen name="savedQuizzes" initialParams={{ id }} options={{ href: null }} />
          <Tabs.Screen name="savedSummaries" initialParams={{ id }} options={{ href: null }} />
        </Tabs>
      </GroupDataProvider>
    </ActiveGroupProvider>
  );
}
 