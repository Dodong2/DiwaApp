import { useEffect, useState, useRef } from "react";
import { View, Pressable, StyleSheet, PanResponder, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
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

const SWIPE_THRESHOLD = 100;
const SCREEN_WIDTH = Dimensions.get("window").width;

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

  const sourceFolder = sourceFolderId ? folders.find((f) => f.id === sourceFolderId) : null;
  const displayLabel = sourceFolder ? sourceFolder.name : currentTrack?.title ?? "";

  const handleTitlePress = () => {
    if (sourceFolder) {
      usePlayerStore.getState().openAlbumPlayer(sourceFolder.id);
    } else {
      usePlayerStore.getState().expand();
    }
  };

  // --- Slide animation (reanimated) ---
  const translateX = useSharedValue(0); // live horizontal drag offset
  const showProgress = useSharedValue(0); // 0 = hidden, 1 = visible

  // Tracks whether the mini-player is disappearing because of the swipe
  // gesture itself (which already plays its own exit animation) — if so,
  // the normal show/hide effect below should snap instantly instead of
  // playing a second, redundant fade+slide-down animation.
  const isDismissingViaSwipeRef = useRef(false);

  useEffect(() => {
    if (isDismissingViaSwipeRef.current) {
      showProgress.value = visible ? 1 : 0; // instant, no animation — swipe already handled the exit visually
      isDismissingViaSwipeRef.current = false; // reset for the next time
      return;
    }
    showProgress.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [visible]);

  // Whenever a genuinely new track starts, snap back to center — otherwise
  // it would reappear already off to whichever side it was last swiped to.
  useEffect(() => {
    if (currentTrack) translateX.value = 0;
  }, [currentTrack?.id]);

  const stopPlaybackFromSwipe = () => {
    isDismissingViaSwipeRef.current = true;
    usePlayerStore.getState().actions?.stop();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: showProgress.value,
    transform: [
      { translateY: interpolate(showProgress.value, [0, 1], [16, 0]) },
      { translateX: translateX.value },
    ],
  }));

  // onStartShouldSetPanResponder is false and we only claim the gesture once
  // real horizontal movement is detected — this way simple taps on the
  // title or prev/play/next buttons underneath are completely unaffected.
  const swipePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5,
      onPanResponderMove: (_evt, gestureState) => {
        translateX.value = gestureState.dx; // follow the finger live, either direction
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          // Past the threshold — finish sliding off in the same direction,
          // then stop playback once it's fully off-screen.
          const direction = gestureState.dx > 0 ? 1 : -1;
          translateX.value = withTiming(
            direction * SCREEN_WIDTH,
            { duration: 200 },
            (finished) => {
              if (finished) {
                runOnJS(stopPlaybackFromSwipe)();
              }
            }
          );
        } else {
          // Didn't reach the threshold — spring back to center.
          translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
        }
      },
    })
  ).current;

  if (!hasPlayedOnce) return null;

  return (
    <Animated.View
      style={[styles.wrapper, animatedStyle]}
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
    </Animated.View>
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