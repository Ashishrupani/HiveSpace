import { Stack } from "expo-router";
import React from "react";

export default function NotesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      {/* Dashboard screen (list of notes) */}
      <Stack.Screen
        name="noteDashboard"
        options={{
          headerShown: false,
        }}
      />

      {/* Note details screen */}
      <Stack.Screen
        name="noteView"
        options={{
          title: "Note Details",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
