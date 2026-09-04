import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
const SWIPE_OUT_DISTANCE = 500;

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

  // Show/hide (dating EaseView) — pinalitan ng reanimated para iisang
  // consistent animation system na lang ang bahala sa opacity/position.
  const showProgress = useSharedValue(visible ? 1 : 0);
  useEffect(() => {
    showProgress.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [visible]);

  // Swipe-to-dismiss — sumusunod sa daliri habang dini-drag
  const translateX = useSharedValue(0);

  const handleDismiss = () => {
    actions?.stop();
    // i-reset para handa ulit sa susunod na track na tutugtugin
    translateX.value = 0;
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15]) // horizontal lang ang kukunin, hindi maapektuhan ang taps
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      // Malayang gumalaw pakaliwa; may "resistance" pag pakanan (di dismiss direction)
      translateX.value = e.translationX < 0 ? e.translationX : e.translationX * 0.3;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SWIPE_OUT_DISTANCE, { duration: 220 }, (finished) => {
          if (finished) runOnJS(handleDismiss)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220, mass: 0.6 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const dragFade = 1 - Math.min(Math.abs(translateX.value) / SWIPE_OUT_DISTANCE, 1);
    return {
      opacity: showProgress.value * dragFade,
      transform: [
        { translateY: (1 - showProgress.value) * 16 },
        { translateX: translateX.value },
      ],
    };
  });

  if (!hasPlayedOnce) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.wrapper, animatedStyle]}
        pointerEvents={visible ? "auto" : "none"}
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
    </GestureDetector>
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