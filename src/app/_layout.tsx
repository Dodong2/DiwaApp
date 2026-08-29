import { Stack } from "expo-router";
import { PlayerProvider } from "../context/player-context";

export default function RootLayout() {
  return (
    <PlayerProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PlayerProvider>
  );
}