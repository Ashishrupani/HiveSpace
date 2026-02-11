import React from 'react';
import { Drawer } from 'expo-router/drawer';

/**
 * Simple Drawer navigation using Expo Router's Drawer helper.
 * Screens reference the route names defined in `app/` (dashboard, groups, notes).
 * The drawer is positioned on the left by default; additional styling/options
 */
export default function DrawerNavigation() {
  return (
    <Drawer
      screenOptions={{
        drawerPosition: 'left'
      }}>
      <Drawer.Screen name="(home)" options={{ title: 'Home' }} />
      <Drawer.Screen name="(groups)" options={{ title: 'Groups' }} />
      <Drawer.Screen name="(notes)" options={{ title: 'Notes' }} />
    </Drawer>
  );
}