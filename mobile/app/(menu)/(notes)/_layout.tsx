import { Stack, Tabs } from 'expo-router'
import React from 'react'
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';

export default function NotesLayout() {
  return (
    <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.light.tint,
            headerShown: false,
            tabBarButton: HapticTab,
          }}>

          </Tabs>
  )
}


/* Notes
 * This layout component sets up the notes screen with a stack navigator.
 */