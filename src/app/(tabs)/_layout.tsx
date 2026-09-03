import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Music, Library, Download, Settings as SettingsIcon } from "lucide-react-native";
import { colors, radius, spacing } from "../../constants/theme";
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
          tabBarInactiveTintColor: colors.cream,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 2,
          },
          // Floating pill: inset from the screen edges on all sides, fully
          // rounded, solid olive background — matches the reference image.
          tabBarStyle: {
            position: "absolute",
            left: spacing.lg,
            right: spacing.lg,
            bottom: insets.bottom + spacing.sm,
            height: 64,
            borderRadius: radius.full,
            backgroundColor: colors.olive,
            borderTopWidth: 0,
            paddingTop: spacing.sm,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
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
          name="download"
          options={{
            title: "Download",
            tabBarIcon: ({ color, size }) => <Download color={color} size={size} />,
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