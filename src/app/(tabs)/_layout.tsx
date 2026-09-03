import { View } from "react-native";
import { Tabs } from "expo-router";
import { Music, Library, Download, Settings as SettingsIcon } from "lucide-react-native";
import { CustomTabBar } from "../../components/ui/tab-bar";
import { MiniPlayer } from "../../components/ui/mini-player";
import { NowPlayingModal } from "../../components/ui/now-playing-modal";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
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