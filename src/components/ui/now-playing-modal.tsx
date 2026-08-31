import { useEffect, useState, useRef } from "react";
import { Modal, View, Pressable, StyleSheet, Image, PanResponder } from "react-native";
import { EaseView } from "react-native-ease";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Minimize2, SkipBack, SkipForward, Play, Pause } from "lucide-react-native";
import { ThemedText } from "./themed-text";
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

  // Default album is now set from the Settings tab — this screen just reads it.
  const nowPlayingAlbumId = useSettingsStore((s) => s.nowPlayingAlbumId);

  const [imageUri, setImageUri] = useState<string | null>(null);

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

  return (
    <Modal visible={isExpanded} animationType="slide" onRequestClose={() => usePlayerStore.getState().minimize()}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.lg }]}>
        {/* header: Image */}
        {/* Big art — fades and scales in each time this screen opens, tied
            directly to isExpanded so it re-triggers on every open (the
            Modal keeps its children mounted even when hidden, so this
            can't rely on a mount effect — it has to react to the prop). */}
        <EaseView
          style={styles.artWrapper}
          animate={{ opacity: isExpanded ? 1 : 0, scale: isExpanded ? 1 : 0.92 }}
          transition={{ type: "timing", duration: 280 }}
        >
          {imageUri && (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          )}
        </EaseView>

        {/* Track info — same idea, slightly simpler motion (fade + rise) */}
        <EaseView
          style={{ marginTop: spacing.lg, alignItems: "center" }}
          animate={{ opacity: isExpanded ? 1 : 0, translateY: isExpanded ? 0 : 12 }}
          transition={{ type: "timing", duration: 280 }}
        >
          <ThemedText variant="title" style={{ textAlign: "center" }} numberOfLines={2}>
            {currentTrack.title}
          </ThemedText>
        </EaseView>

        {/* Progress bar — isolated into its own component so dragging doesn't
            re-render this whole screen (that was the cause of the flicker) */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={(seconds) => actions?.seekTo(seconds)}
        />

        {/* Transport controls */}
        <View style={styles.controls}>
          <AnimatedIconButton onPress={() => actions?.previous()} style={styles.sideButton}>
            <SkipBack color={colors.cream} size={30} fill={colors.cream} />
          </AnimatedIconButton>

        <AnimatedIconButton onPress={() => actions?.togglePlayPause()} style={styles.playButton}>
          {isPlaying ? (
        <Pause color={colors.bg} size={32} fill={colors.bg} />
          ) : (
        <Play color={colors.bg} size={32} fill={colors.bg} />
          )}
        </AnimatedIconButton>

        <AnimatedIconButton onPress={() => actions?.next()} style={styles.sideButton}>
          <SkipForward color={colors.cream} size={30} fill={colors.cream} />
        </AnimatedIconButton>
      </View>

        {/* buttom: close (left) and resize/minimize (right) */}
        <View style={styles.header}>
          <Pressable onPress={() => actions?.stop()} style={styles.iconButton}>
            <X color={colors.cream} size={24} />
          </Pressable>
          <Pressable onPress={() => usePlayerStore.getState().minimize()} style={styles.iconButton}>
            <Minimize2 color={colors.cream} size={22} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Isolated into its own component: while dragging, only THIS component
// re-renders (many times per second) instead of the whole Now Playing screen
// with its big image and icons — that isolation is what removes the flicker.
function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}) {
  const [scrubPct, setScrubPct] = useState<number | null>(null);
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
            onSeek(pct * durationRef.current);
          }
          return null;
        });
      },
    })
  ).current;

  const progress = scrubPct !== null ? scrubPct : duration > 0 ? currentTime / duration : 0;
  const displayTime = scrubPct !== null ? scrubPct * duration : currentTime;

  return (
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
  );
}

function AnimatedIconButton({
  onPress,
  style,
  children,
  scaleTo = 0.9,
}: {
  onPress: () => void;
  style?: any;
  children: React.ReactNode;
  scaleTo?: number;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <EaseView
        style={style}
        animate={{ scale: pressed ? scaleTo : 1 }}
        transition={{ type: "timing", duration: 120 }}
      >
        {children}
      </EaseView>
    </Pressable>
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
  progressHitArea: {
    paddingVertical: 12,
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
    marginLeft: -8,
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
  playButtonPressed: {
  transform: [{ scale: 0.9 }],
},
});