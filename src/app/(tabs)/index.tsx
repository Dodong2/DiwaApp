import { usePlayerActions } from "@/store/player-store";
import { FlatList, Pressable, View } from "react-native";
import { Button } from "../../components/ui/button";
import { Screen } from "../../components/ui/screen";
import { ThemedText } from "../../components/ui/themed-text";
import { colors, spacing } from "../../constants/theme";
import { useMusicLibrary } from "../../hooks/use-music-library";

export default function AllMusicScreen() {
  const { permission, tracks, loading, requestAccess } = useMusicLibrary();
  const actions = usePlayerActions();

  if (permission !== "granted") {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}>
          <ThemedText variant="title" style={{ textAlign: "center" }}>
            Diwa needs access to your music
          </ThemedText>
          <ThemedText variant="muted" style={{ textAlign: "center" }}>
            {permission === "denied"
              ? "Permission was denied. Please enable it in your phone settings to continue."
              : "We only read your local audio files — nothing leaves your phone."}
          </ThemedText>
          <Button label="Allow Access" onPress={requestAccess} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ThemedText variant="title" style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
        All Music
      </ThemedText>

      {loading && <ThemedText variant="muted">Loading your music...</ThemedText>}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 140 }} // leaves room so MiniPlayer doesn't cover the last item
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => actions?.playQueue(tracks, index)}
            style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surface }}
          >
            <ThemedText variant="body">{item.title}</ThemedText>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? <ThemedText variant="muted">No music found on this device.</ThemedText> : null
        }
      />
    </Screen>
  );
}