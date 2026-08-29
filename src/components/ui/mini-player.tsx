import { Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { useCurrentTrack, useIsPlaying, usePlayerActions } from "../../store/player-store";
import { ThemedText } from "./themed-text";

export function MiniPlayer() {
  const currentTrack = useCurrentTrack();
  const isPlaying = useIsPlaying();
  const actions = usePlayerActions();

  if (!currentTrack || !actions) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.trackInfo}>
        <ThemedText variant="body" numberOfLines={1} style={styles.title}>
          {currentTrack.title}
        </ThemedText>
      </View>

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
    bottom: 100,
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