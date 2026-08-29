import { Tabs } from "expo-router";
import { Download, Library, Music } from "lucide-react-native";
import { View } from "react-native";
import { MiniPlayer } from "../../components/ui/mini-player";
import { colors } from "../../constants/theme";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.orange,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.surface },
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
      </Tabs>
      <MiniPlayer />
    </View>
  );
}