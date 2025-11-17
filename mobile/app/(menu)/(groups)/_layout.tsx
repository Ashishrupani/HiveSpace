import React from 'react'
import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function GroupLayout() {

  return (
    <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.light.tint,
            headerShown: false,
            tabBarButton: HapticTab,
          }}>
          <Tabs.Screen
            name="groupDashboard"
            options={{
              title: 'Group Dashboard',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="groupSetting"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
            }}
          />
          <Tabs.Screen
            name="[id]"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
            }}
          />
          <Tabs.Screen
            name="groupSettings"
            options={{
              href: null,
              tabBarStyle: { display: 'none' },
            }} 
          />
        </Tabs>
  )
}


/* Notes
 * This layout component sets up the group screen with a tab navigator.
 */
