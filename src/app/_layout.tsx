import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { OnboardingScreen } from "../components/ui/onboarding-screen";
import { PlayerProvider } from "../context/player-context";
import { useOnboardingStore } from "../store/onboarding-store";
import { colors } from "../constants/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Kailangan sa module level, hindi sa loob ng component
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg);
    // dito mo rin ilagay yung font loading, atbp. na existing setup mo
    setAppReady(true);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <PlayerProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.bg }} onLayout={onLayoutRootView}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>

        {!hasOnboarded && <OnboardingScreen />}
      </View>
      </GestureHandlerRootView>
    </PlayerProvider>
  );
}