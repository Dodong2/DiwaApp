import { useState } from "react";
import { FlatList, View, Pressable } from "react-native";
import { Search } from "lucide-react-native";
import { Screen } from "../../components/ui/screen";
import { ThemedText } from "../../components/ui/themed-text";
import { Button } from "../../components/ui/button";
import { SearchModal } from "../../components/ui/search-modal";
import { useMusicLibrary, Track } from "../../hooks/use-music-library";
import { usePlayerActions, usePlayerStore } from "../../store/player-store";
import { useMusicSearchHistoryStore } from "../../store/search-history-store";
import { colors, spacing } from "../../constants/theme";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";

export default function AllMusicScreen() {
  const { permission, tracks, loading, requestAccess } = useMusicLibrary();
  const actions = usePlayerActions();
  const [searchVisible, setSearchVisible] = useState(false);

  const handleSelectFromSearch = (track: Track, index: number, list: Track[]) => {
    actions?.playQueue(list, index);
    usePlayerStore.getState().expand();
  };

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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.md, marginBottom: spacing.md }}>
        <ThemedText variant="title">All Music</ThemedText>
        <AnimatedIconButton onPress={() => setSearchVisible(true)}>
          <Search color={colors.cream} size={22} />
        </AnimatedIconButton>
      </View>

      {loading && <ThemedText variant="muted">Loading your music...</ThemedText>}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => {
              actions?.playQueue(tracks, index);
              usePlayerStore.getState().expand();
            }}
            style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.surface }}
          >
            <ThemedText variant="body">{item.title}</ThemedText>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading ? <ThemedText variant="muted">No music found on this device.</ThemedText> : null
        }
      />

      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        items={tracks}
        getId={(t) => t.id}
        getLabel={(t) => t.title}
        onSelect={handleSelectFromSearch}
        useHistoryStore={useMusicSearchHistoryStore}
        placeholder="Search your music"
        emptyLabel="songs"
      />
    </Screen>
  );
}