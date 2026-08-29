import { useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { getRandomPhotoFromAlbum } from "../../hooks/use-photo-album";
import { ThemedText } from "./themed-text";

type MoodCardProps = {
  title: string;
  subtitle: string;
  linkedAlbumId?: string; // if set, we pull a random photo from this album
  fallbackImageUri: string; // used until an album is linked
  onPlay: () => void;
  onPressImage: () => void; // opens the album picker
};

export function MoodCard({
  title,
  subtitle,
  linkedAlbumId,
  fallbackImageUri,
  onPlay,
  onPressImage,
}: MoodCardProps) {
  const [imageUri, setImageUri] = useState(fallbackImageUri);

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
    <Pressable style={styles.wrapper} onPress={onPressImage}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.image}
        imageStyle={{ borderRadius: radius.lg }}
      >
        <View style={styles.overlay} />

        <ThemedText variant="muted" style={styles.aboveOverlay}>
          Your Daily Mood
        </ThemedText>
        <ThemedText variant="title" style={[styles.aboveOverlay, styles.titleSpacing]}>
          {title}
        </ThemedText>
        <ThemedText variant="muted" style={[styles.aboveOverlay, styles.subtitleSpacing]}>
          {subtitle}
        </ThemedText>

        <Pressable
          onPress={(e) => {
            e.stopPropagation(); // don't trigger onPressImage when tapping play
            onPlay();
          }}
          style={[styles.playButton, styles.aboveOverlay]}
        >
          <ThemedText style={styles.playIcon}>▶</ThemedText>
        </Pressable>

        {!linkedAlbumId && (
          <View style={styles.linkHint}>
            <ThemedText variant="muted" style={styles.linkHintText}>
              Tap to set photo album
            </ThemedText>
          </View>
        )}
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
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
  titleSpacing: {
    marginBottom: 4,
  },
  subtitleSpacing: {
    marginBottom: spacing.md,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    color: colors.bg,
    fontSize: 20,
  },
  linkHint: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    zIndex: 1,
  },
  linkHintText: {
    fontSize: 11,
  },
});