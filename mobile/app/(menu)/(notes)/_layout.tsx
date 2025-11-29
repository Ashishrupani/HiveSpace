
import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { migrate } from "../../../lib/db";


export default function NotesLayout() {
  // Run DB migration once when this layout mounts
  useEffect(() => {
    migrate().catch((err) => {
      console.error("DB migration failed:", err);
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="noteDashboard"
        options={{
          title: "Notes",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="note" color={color} />
          ),
        }}
      />

      {/* Hidden screen: you can navigate here with router.push, but it won't appear in the tab bar */}
      <Tabs.Screen
        name="noteView"
        options={{
          href: null, // hide from tab bar
        }}
      />
    </Tabs>
  );
}

/* Notes
 * This layout component sets up the Notes tab and runs SQLite migrations
 * so the notes table exists before noteDashboard/noteView use it.
 */
