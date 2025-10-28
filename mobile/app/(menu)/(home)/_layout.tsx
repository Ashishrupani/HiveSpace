import React from 'react'
import { Tabs, useNavigation } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
//import colors from '@/constants/theme';
//import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeLayout() {
    //const colorScheme = useColorScheme() as 'light' | 'dark' | undefined;

  return (
    <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.light.tint,
            headerShown: false,
            tabBarButton: HapticTab,
          }}>
          <Tabs.Screen
            name="dashboard"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="timer"
            options={{
              title: 'Timer',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            }}
          />
        </Tabs>
  )
}


/* Notes
 * This layout component sets up the home screen with a tab navigator.
 */