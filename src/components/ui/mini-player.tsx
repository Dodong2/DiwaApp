import { useEffect, useState, useRef } from "react";
import { View, Pressable, StyleSheet, PanResponder } from "react-native";
import { EaseView } from "react-native-ease";
import { BlurView } from "expo-blur";
import { ThemedText } from "./themed-text";
import {
  useCurrentTrack,
  useIsPlaying,
  usePlayerActions,
  useIsExpanded,
  useCurrentSourceFolderId,
  usePlayerStore,
} from "../../store/player-store";
import { useFoldersStore } from "../../store/folders-store";
import { colors, spacing, radius } from "../../constants/theme";

const SWIPE_THRESHOLD = 80;

export function MiniPlayer() {
  const currentTrack = useCurrentTrack();
  const isPlaying = useIsPlaying();
  const actions = usePlayerActions();
  const isExpanded = useIsExpanded();
  const sourceFolderId = useCurrentSourceFolderId();
  const folders = useFoldersStore((s) => s.folders);

  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  useEffect(() => {
    if (currentTrack) setHasPlayedOnce(true);
  }, [currentTrack]);

  const visible = !!currentTrack && !isExpanded;

  // If the current queue came from a specific album, show the ALBUM name
  // instead of the track title, and tapping should reopen that album's
  // player instead of the generic Now Playing screen.
  const sourceFolder = sourceFolderId ? folders.find((f) => f.id === sourceFolderId) : null;
  const displayLabel = sourceFolder ? sourceFolder.name : currentTrack?.title ?? "";

  const handleTitlePress = () => {
    if (sourceFolder) {
      usePlayerStore.getState().openAlbumPlayer(sourceFolder.id);
    } else {
      usePlayerStore.getState().expand();
    }
  };

  // Swipe right-to-left to dismiss + stop playback.
  // onStartShouldSetPanResponder is false and we only claim the gesture once
  // real horizontal movement is detected — this way simple taps on the
  // title or prev/play/next buttons underneath are completely unaffected.
  const swipePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5,
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          actions?.stop();
        }
      },
    })
  ).current;

  if (!hasPlayedOnce) return null;

  return (
    <EaseView
      style={styles.wrapper}
      animate={{ opacity: visible ? 1 : 0, translateY: visible ? 0 : 16 }}
      transition={{ type: "timing", duration: 220 }}
      pointerEvents={visible ? "auto" : "none"}
      {...swipePanResponder.panHandlers}
    >
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.glassTint} pointerEvents="none" />

      <Pressable style={styles.trackInfo} onPress={handleTitlePress}>
        <ThemedText variant="body" numberOfLines={1} style={styles.title}>
          {displayLabel}
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
    overflow: "hidden",
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