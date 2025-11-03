import { Stack, Tabs } from 'expo-router'
import React from 'react'
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NotesLayout() {
  return (
    <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.light.tint,
            headerShown: false,
            tabBarButton: HapticTab,
          }}>
          <Tabs.Screen
            name="noteDashboard"
            options={{
              title: 'Notes',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="note" color={color} />,
            }}
          />
          <Tabs.Screen
            name="noteView"
            options={{
              href: null,
            }}
          />
          </Tabs>
  )
}


/* Notes
 * This layout component sets up the notes screen with a stack navigator.
 */