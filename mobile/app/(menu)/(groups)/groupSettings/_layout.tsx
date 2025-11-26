import { Stack } from "expo-router";

export default function GroupSettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_left", // adds the animation
        gestureEnabled: true,          // enables swipe back on iOS
      }}
    />
  );
}