import { View, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import {
  useCurrentTrack,
  useIsPlaying,
  usePlayerActions,
  useIsExpanded,
  usePlayerStore,
} from "../../store/player-store";
import { colors, spacing, radius } from "../../constants/theme";

export function MiniPlayer() {
  const currentTrack = useCurrentTrack();
  const isPlaying = useIsPlaying();
  const actions = usePlayerActions();
  const isExpanded = useIsExpanded();

  // Hide entirely when nothing is playing, OR when the big player is showing instead.
  if (!currentTrack || !actions || isExpanded) return null;

  return (
    <View style={styles.wrapper}>
      {/* Tapping the title/track area reopens the big Now Playing screen */}
      <Pressable
        style={styles.trackInfo}
        onPress={() => usePlayerStore.getState().expand()}
      >
        <ThemedText variant="body" numberOfLines={1} style={styles.title}>
          {currentTrack.title}
        </ThemedText>
      </Pressable>

      <View style={styles.controls}>
        <Pressable onPress={actions.previous} style={styles.button}>
          <ThemedText style={styles.icon}>⏮</ThemedText>
        </Pressable>
        <Pressable onPress={actions.togglePlayPause} style={styles.button}>
          <ThemedText style={styles.icon}>{isPlaying ? "⏸" : "▶"}</ThemedText>
        </Pressable>
        <Pressable onPress={actions.next} style={styles.button}>
          <ThemedText style={styles.icon}>⏭</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  trackInfo: { flex: 1, marginRight: spacing.sm },
  title: { fontWeight: "600" },
  controls: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  button: { padding: spacing.xs },
  icon: { color: colors.orange, fontSize: 18 },
});