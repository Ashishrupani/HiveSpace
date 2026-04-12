import React from 'react'
import { Tabs, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GroupDataProvider } from '@/contexts/GroupDataContext';

export default function GroupLayout() {
  const { id } = useLocalSearchParams();

  return (
    // Provider wraps all tab screens so they share one fetch
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
  );
}