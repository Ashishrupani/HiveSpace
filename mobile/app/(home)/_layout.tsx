import React from 'react';

import { Stack } from 'expo-router/stack'

export default function Layout() {
  return <Stack />
}

// export default function TabLayout() {

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Explore',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }
