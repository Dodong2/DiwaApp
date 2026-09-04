import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "@expo-google-fonts/manrope/useFonts";
import { Manrope_400Regular } from "@expo-google-fonts/manrope/400Regular";
import { Manrope_500Medium } from "@expo-google-fonts/manrope/500Medium";
import { Manrope_600SemiBold } from "@expo-google-fonts/manrope/600SemiBold";
import { Manrope_700Bold } from "@expo-google-fonts/manrope/700Bold";
import { Manrope_800ExtraBold } from "@expo-google-fonts/manrope/800ExtraBold";
import { OnboardingScreen } from "../components/ui/onboarding-screen";
import { PlayerProvider } from "../context/player-context";
import { useOnboardingStore } from "../store/onboarding-store";
import { colors } from "../constants/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasOnboarded = useOnboardingStore((s) => s.hasOnboarded);
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg);
  }, []);

  useEffect(() => {
    if (fontsLoaded) setAppReady(true);
  }, [fontsLoaded]);

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