import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { Tabs } from "expo-router";

export default function GroupSettingsStackLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: Colors.light.tint,
      headerShown: false,
      tabBarButton: HapticTab, }
    }
    >
      <Tabs.Screen
        name="createGroup"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="joinGroup"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}