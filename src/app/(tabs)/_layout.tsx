import { useEffect } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { Music, Library, Download, Settings as SettingsIcon } from "lucide-react-native";
import { CustomTabBar } from "../../components/ui/tab-bar";
import { MiniPlayer } from "../../components/ui/mini-player";
import { NowPlayingModal } from "../../components/ui/now-playing-modal";
import { AlbumPlayerModal } from "../../components/ui/album-player-modal";
import { useMusicLibrary } from "../../hooks/use-music-library";
import { useFoldersStore } from "../../store/folders-store";
import { useOpenAlbumPlayerFolderId, usePlayerStore } from "../../store/player-store";
import { colors } from "@/constants/theme";
import * as SystemUI from "expo-system-ui";

export default function TabLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.bg);
  }, []);

  // Mounted globally (not inside albums.tsx) so it can be opened from any
  // tab — e.g. tapping the mini-player's title while on the "All Music" tab
  // should still be able to reopen the correct album's player.
  const { tracks } = useMusicLibrary();
  const folders = useFoldersStore((s) => s.folders);
  const openAlbumPlayerFolderId = useOpenAlbumPlayerFolderId();
  const activeFolder = folders.find((f) => f.id === openAlbumPlayerFolderId) ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: "shift",
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
      <AlbumPlayerModal
        visible={openAlbumPlayerFolderId !== null}
        onClose={() => usePlayerStore.getState().closeAlbumPlayer()}
        folder={activeFolder}
        allTracks={tracks}
      />
    </View>
  );
}