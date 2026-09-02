import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { EaseView } from "react-native-ease";
import { BlurView } from "expo-blur";
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
      transition={{ type: "timing", duration: 220 }}
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Frosted glass background: blur layer + a subtle color tint on top
          of it so it still reads as "on brand" rather than plain gray glass. */}
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.glassTint} pointerEvents="none" />

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
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden", // required so the blur respects the rounded corners
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glassTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface,
    opacity: 0.45,
  },
  trackInfo: { flex: 1, marginRight: spacing.sm },
  title: { fontWeight: "600" },
  controls: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  button: { padding: spacing.xs },
  icon: { color: colors.orange, fontSize: 18 },
});