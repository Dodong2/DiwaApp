import { useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { Play, Pause, Music2, Shuffle, Repeat, Repeat1 } from "lucide-react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { getRandomPhotoFromAlbum } from "../../hooks/use-photo-album";
import {
  useCurrentTrack,
  useIsPlaying,
  useIsShuffled,
  useRepeatMode,
  usePlayerActions,
} from "../../store/player-store";
import { useToastStore } from "../../store/toast-store";
import { AnimatedIconButton } from "./animated-icon-button";
import { ThemedText } from "./themed-text";

type MoodCardProps = {
  title: string;
  songCount: number;
  linkedAlbumId?: string;
  fallbackImageUri: string;
  trackIds: string[];
  onPlay: () => void;
  onPressImage: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onLongPress?: () => void;
  onToggleSelect?: () => void;
};

export function MoodCard({
  title,
  songCount,
  linkedAlbumId,
  fallbackImageUri,
  trackIds,
  onPlay,
  onPressImage,
  selectionMode = false,
  selected = false,
  onLongPress,
  onToggleSelect,
}: MoodCardProps) {
  const [imageUri, setImageUri] = useState(fallbackImageUri);
  const currentTrack = useCurrentTrack();
  const isPlaying = useIsPlaying();
  const isShuffled = useIsShuffled();
  const repeatMode = useRepeatMode();
  const actions = usePlayerActions();

  const isActive = currentTrack ? trackIds.includes(currentTrack.id) : false;
  const showPause = isActive && isPlaying;

  const handlePlayButtonPress = () => {
    if (isActive) {
      actions?.togglePlayPause();
    } else {
      onPlay();
    }
  };

  const handleShufflePress = () => {
    actions?.toggleShuffle();
    useToastStore.getState().show(isShuffled ? "Shuffle off" : "Shuffle on");
  };

  const handleRepeatPress = () => {
    const next = repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
    actions?.cycleRepeatMode();
    const label = next === "off" ? "Repeat off" : next === "all" ? "Repeat all" : "Repeat one";
    useToastStore.getState().show(label);
  };

  useEffect(() => {
    if (!linkedAlbumId) {
      setImageUri(fallbackImageUri);
      return;
    }
    getRandomPhotoFromAlbum(linkedAlbumId).then((uri) => {
      if (uri) setImageUri(uri);
    });
  }, [linkedAlbumId, fallbackImageUri]);

  return (
    <Pressable
      style={styles.shadowWrapper}
      onPress={() => (selectionMode ? onToggleSelect?.() : onPressImage())}
      onLongPress={onLongPress}
    >
      <View style={styles.clipWrapper}>
        <ImageBackground
          source={{ uri: imageUri }}
          style={styles.image}
          imageStyle={{ borderRadius: radius.lg }}
        >
          <View style={styles.overlay} pointerEvents="none" />

          {selectionMode && (
            <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
              {selected && <ThemedText style={styles.checkMark}>✓</ThemedText>}
            </View>
          )}

          <View style={styles.textChip} pointerEvents="none">
            <ThemedText variant="muted" style={styles.aboveOverlay}>
              Your Daily Mood
            </ThemedText>
            <ThemedText variant="title" style={[styles.aboveOverlay, styles.titleSpacing]}>
              {title}
            </ThemedText>
            <View style={[styles.songCountRow, styles.aboveOverlay]}>
              <Music2 color={colors.muted} size={12} />
              <ThemedText variant="muted" style={styles.songCountText}>
                {songCount} {songCount === 1 ? "song" : "songs"}
              </ThemedText>
            </View>
          </View>

          {/* Shuffle — Play/Pause — Repeat, three circles in a row.
              Nested Pressables inside AnimatedIconButton naturally claim the
              touch before it can reach the outer card's onPress={onPressImage},
              same as the original single play button used to. */}
          {!selectionMode && (
            <View style={[styles.controlsRow, styles.aboveOverlay]}>
              <AnimatedIconButton
                onPress={handleShufflePress}
                withBackground={false}
                style={styles.smallCircle}
              >
                <Shuffle color={isShuffled ? colors.orange : colors.cream} size={16} />
              </AnimatedIconButton>

              <AnimatedIconButton
                onPress={handlePlayButtonPress}
                withBackground={false}
                style={styles.playButton}
              >
                {showPause ? (
                  <Pause color={colors.bg} size={22} fill={colors.bg} />
                ) : (
                  <Play color={colors.bg} size={22} fill={colors.bg} />
                )}
              </AnimatedIconButton>

              <AnimatedIconButton
                onPress={handleRepeatPress}
                withBackground={false}
                style={styles.smallCircle}
              >
                {repeatMode === "one" ? (
                  <Repeat1 color={colors.orange} size={16} />
                ) : (
                  <Repeat color={repeatMode === "all" ? colors.orange : colors.cream} size={16} />
                )}
              </AnimatedIconButton>
            </View>
          )}
        </ImageBackground>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: radius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  clipWrapper: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 256,
    justifyContent: "flex-end",
    padding: spacing.md + 4,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.olive,
    opacity: 0.6,
    borderRadius: radius.lg,
  },
  aboveOverlay: {
    zIndex: 1,
  },
  checkCircle: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.cream,
    backgroundColor: "rgba(13, 11, 12, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  checkCircleSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  checkMark: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: "bold",
  },
  textChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(13, 11, 12, 0.5)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    zIndex: 1,
  },
  titleSpacing: {
    marginBottom: 4,
  },
  songCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  songCountText: {
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  smallCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: "rgba(13, 11, 12, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});