import { useEffect } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { Music, Library, Download, Settings as SettingsIcon } from "lucide-react-native";
import { CustomTabBar } from "../../components/ui/tab-bar";
import { MiniPlayer } from "../../components/ui/mini-player";
import { NowPlayingModal } from "../../components/ui/now-playing-modal";
import { colors } from "@/constants/theme";
import * as SystemUI from "expo-system-ui"


export default function TabLayout() {

  useEffect(() => {
  SystemUI.setBackgroundColorAsync(colors.bg);
}, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: "shift", // <- slide transition pag nagpalit ng tab
          sceneStyle: { backgroundColor: colors.bg },
          transitionSpec: {
            animation: "spring",
            config: {
              stiffness: 220,
              damping: 24,
              mass: 0.7,
            },
          },
        }}
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