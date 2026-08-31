import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { EaseView } from "react-native-ease";
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

  // Once a track has been loaded at least once, keep this component mounted
  // permanently (even when hidden) so EaseView can animate its fade in/out.
  // Before the very first track ever plays, we skip rendering entirely —
  // no point animating an invisible touch area that's never had content.
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  useEffect(() => {
    if (currentTrack) setHasPlayedOnce(true);
  }, [currentTrack]);

  const visible = !!currentTrack && !isExpanded;

  if (!hasPlayedOnce) return null;

  return (
    <EaseView
      style={styles.wrapper}
      animate={{ opacity: visible ? 1 : 0, translateY: visible ? 0 : 16 }}
      transition={{ type: "timing", duration: 520 }}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Pressable
        style={styles.trackInfo}
        onPress={() => usePlayerStore.getState().expand()}
      >
        <ThemedText variant="body" numberOfLines={1} style={styles.title}>
          {currentTrack?.title ?? ""}
        </ThemedText>
      </Pressable>

      <View style={styles.controls}>
        <Pressable onPress={actions?.previous} style={styles.button}>
          <ThemedText style={styles.icon}>⏮</ThemedText>
        </Pressable>
        <Pressable onPress={actions?.togglePlayPause} style={styles.button}>
          <ThemedText style={styles.icon}>{isPlaying ? "⏸" : "▶"}</ThemedText>
        </Pressable>
        <Pressable onPress={actions?.next} style={styles.button}>
          <ThemedText style={styles.icon}>⏭</ThemedText>
        </Pressable>
      </View>
    </EaseView>
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