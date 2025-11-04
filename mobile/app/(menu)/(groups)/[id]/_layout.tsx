import React from 'react'
import { Tabs , Stack} from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function GroupLayout() {

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="groupHome"
        options={{
          title: 'Group Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chatbubble-ellipses.fill" color={color} />,
        }}
      /> */}
    </Tabs>
  )
}