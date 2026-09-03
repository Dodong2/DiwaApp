import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Music, Library, Download, Settings as SettingsIcon } from "lucide-react-native";
import { colors } from "../../constants/theme";
import { MiniPlayer } from "../../components/ui/mini-player";
import { NowPlayingModal } from "../../components/ui/now-playing-modal";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.orange,
          tabBarInactiveTintColor: colors.muted,
          // Floats the tab bar over the content (instead of pushing it up),
          // which is what lets the blur actually show content behind it.
          tabBarStyle: {
            position: "absolute",
            backgroundColor: "transparent",
            borderTopColor: colors.surface,
            height: 58 + insets.bottom,
            paddingBottom: insets.bottom + 6,
            paddingTop: 6,
          },
          tabBarBackground: () => (
            <>
              <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.tabGlassTint} pointerEvents="none" />
            </>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "All Music",
            tabBarIcon: ({ color, size }) => <Music color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="albums"
          options={{
            title: "Albums",
            tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
      <NowPlayingModal />
    </View>
  );
}

const styles = StyleSheet.create({
  tabGlassTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bg,
    opacity: 0.55,
  },
});