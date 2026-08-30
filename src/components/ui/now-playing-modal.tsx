import { useEffect, useState, useRef } from "react";
import { Modal, View, Pressable, StyleSheet, Image, PanResponder } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Minimize2, SkipBack, SkipForward, Play, Pause } from "lucide-react-native";
import { ThemedText } from "./themed-text";
import { AlbumPickerModal } from "./album-picker-modal";
import {
  useCurrentTrack,
  useIsPlaying,
  useCurrentTime,
  useDuration,
  usePlayerActions,
  useIsExpanded,
  usePlayerStore,
} from "../../store/player-store";
import { useSettingsStore } from "../../store/settings-store";
import { getRandomPhotoFromAlbum } from "../../hooks/use-photo-album";
import { formatTime } from "../../utils/format-time";
import { colors, radius, spacing } from "../../constants/theme";

export function NowPlayingModal() {
  const insets = useSafeAreaInsets();
  const isExpanded = useIsExpanded();
  const currentTrack = useCurrentTrack();
  const isPlaying = useIsPlaying();
  const currentTime = useCurrentTime();
  const duration = useDuration();
  const actions = usePlayerActions();

  const nowPlayingAlbumId = useSettingsStore((s) => s.nowPlayingAlbumId);
  const setNowPlayingAlbum = useSettingsStore((s) => s.setNowPlayingAlbum);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [albumPickerVisible, setAlbumPickerVisible] = useState(false);

  // --- Interactive progress bar (tap or drag to seek) ---
  const [scrubPct, setScrubPct] = useState<number | null>(null); // null = not dragging, use real progress
  const barRef = useRef<View>(null);
  const barLayoutRef = useRef({ x: 0, width: 0 });
  const durationRef = useRef(duration);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

  const measureBar = () => {
    barRef.current?.measure((_fx, _fy, width, _height, pageX) => {
      barLayoutRef.current = { x: pageX, width };
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_evt, gestureState) => {
        const { x, width } = barLayoutRef.current;
        if (width === 0) return;
        setScrubPct(clamp01((gestureState.x0 - x) / width));
      },
      onPanResponderMove: (_evt, gestureState) => {
        const { x, width } = barLayoutRef.current;
        if (width === 0) return;
        setScrubPct(clamp01((gestureState.moveX - x) / width));
      },
      onPanResponderRelease: () => {
        setScrubPct((pct) => {
          if (pct !== null) {
            actions?.seekTo(pct * durationRef.current);
          }
          return null;
        });
      },
    })
  ).current;

  // Pick a new random photo every time the track changes (or the linked album changes).
  useEffect(() => {
    if (!currentTrack) return;

    if (!nowPlayingAlbumId) {
      setImageUri(`https://picsum.photos/seed/${currentTrack.id}/800/800`);
      return;
    }

    getRandomPhotoFromAlbum(nowPlayingAlbumId).then((uri) => {
      setImageUri(uri ?? `https://picsum.photos/seed/${currentTrack.id}/800/800`);
    });
  }, [currentTrack?.id, nowPlayingAlbumId]);

  if (!currentTrack) return null;

  const progress = scrubPct !== null ? scrubPct : duration > 0 ? currentTime / duration : 0;
  const displayTime = scrubPct !== null ? scrubPct * duration : currentTime;

  return (
    <Modal visible={isExpanded} animationType="slide" onRequestClose={() => usePlayerStore.getState().minimize()}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Header: close (left) and resize/minimize (right) */}
        <View style={styles.header}>
          <Pressable onPress={() => actions?.stop()} style={styles.iconButton}>
            <X color={colors.cream} size={24} />
          </Pressable>
          <Pressable onPress={() => usePlayerStore.getState().minimize()} style={styles.iconButton}>
            <Minimize2 color={colors.cream} size={22} />
          </Pressable>
        </View>

        {/* Big art — tap to set/change the photo album used for this screen */}
        <Pressable style={styles.artWrapper} onPress={() => setAlbumPickerVisible(true)}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          )}
          {!nowPlayingAlbumId && (
            <View style={styles.artHint}>
              <ThemedText variant="muted" style={{ fontSize: 11 }}>
                Tap to set photo album
              </ThemedText>
            </View>
          )}
        </Pressable>

        {/* Track info */}
        <View style={{ marginTop: spacing.lg, alignItems: "center" }}>
          <ThemedText variant="title" style={{ textAlign: "center" }} numberOfLines={2}>
            {currentTrack.title}
          </ThemedText>
        </View>

        {/* Progress bar — tap or drag to seek */}
        <View style={{ marginTop: spacing.lg }}>
          <View
            ref={barRef}
            onLayout={measureBar}
            style={styles.progressHitArea}
            {...panResponder.panHandlers}
          >
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
            </View>
          </View>
          <View style={styles.timeRow}>
            <ThemedText variant="muted" style={{ fontSize: 12 }}>
              {formatTime(displayTime)}
            </ThemedText>
            <ThemedText variant="muted" style={{ fontSize: 12 }}>
              {formatTime(duration)}
            </ThemedText>
          </View>
        </View>

        {/* Transport controls */}
        <View style={styles.controls}>
          <Pressable onPress={() => actions?.previous()} style={styles.sideButton}>
            <SkipBack color={colors.cream} size={30} fill={colors.cream} />
          </Pressable>

          <Pressable onPress={() => actions?.togglePlayPause()} style={styles.playButton}>
            {isPlaying ? (
              <Pause color={colors.bg} size={32} fill={colors.bg} />
            ) : (
              <Play color={colors.bg} size={32} fill={colors.bg} />
            )}
          </Pressable>

          <Pressable onPress={() => actions?.next()} style={styles.sideButton}>
            <SkipForward color={colors.cream} size={30} fill={colors.cream} />
          </Pressable>
        </View>
      </View>

      <AlbumPickerModal
        visible={albumPickerVisible}
        onClose={() => setAlbumPickerVisible(false)}
        onSelect={setNowPlayingAlbum}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    padding: spacing.xs,
  },
  artWrapper: {
    marginTop: spacing.xl,
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  artImageWrapper: {
    ...StyleSheet.absoluteFill,
  },
  artHint: {
    position: "absolute",
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  progressHitArea: {
    paddingVertical: 12, // bigger invisible touch target, since a 4px bar is too thin to tap accurately
    justifyContent: "center",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.orange,
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.orange,
    marginLeft: -8, // center the thumb over the exact progress point
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    marginTop: spacing.xl,
  },
  sideButton: {
    padding: spacing.sm,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
});