import { useEffect, useState } from "react";
import { Modal, View, Pressable, FlatList, Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Play, Pause } from "lucide-react-native";
import { ThemedText } from "./themed-text";
import { AlbumPickerModal } from "./album-picker-modal";
import { getRandomPhotoFromAlbum } from "../../hooks/use-photo-album";
import { Track } from "../../hooks/use-music-library";
import { Folder, useFoldersStore } from "../../store/folders-store";
import { useCurrentTrack, useIsPlaying, usePlayerActions } from "../../store/player-store";
import { colors, radius, spacing } from "../../constants/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  folder: Folder | null;
  allTracks: Track[];
};

export function AlbumPlayerModal({ visible, onClose, folder, allTracks }: Props) {
  const insets = useSafeAreaInsets();
  const currentTrack = useCurrentTrack();
  const isPlaying = useIsPlaying();
  const actions = usePlayerActions();
  const linkAlbum = useFoldersStore((s) => s.linkAlbum);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [albumPickerVisible, setAlbumPickerVisible] = useState(false);

  // Resolve this folder's trackIds into full Track objects, preserving the
  // order the user added them in — this order is also what "N" is based on.
  const folderTracks: Track[] = folder
    ? folder.trackIds
        .map((id) => allTracks.find((t) => t.id === id))
        .filter((t): t is Track => Boolean(t))
    : [];

  const isThisFolderActive = currentTrack
    ? folder?.trackIds.includes(currentTrack.id) ?? false
    : false;

  // New random photo every time the currently-playing track changes,
  // as long as it belongs to this folder.
  useEffect(() => {
    if (!folder) return;

    if (!folder.linkedAlbumId) {
      const seed = currentTrack?.id ?? folder.id;
      setImageUri(`https://picsum.photos/seed/${seed}/800/800`);
      return;
    }

    getRandomPhotoFromAlbum(folder.linkedAlbumId).then((uri) => {
      const seed = currentTrack?.id ?? folder.id;
      setImageUri(uri ?? `https://picsum.photos/seed/${seed}/800/800`);
    });
  }, [currentTrack?.id, folder?.linkedAlbumId, folder?.id]);

  if (!folder) return null;

  const handleTrackPress = (index: number) => {
    actions?.playQueue(folderTracks, index);
  };

  const handlePlayPause = () => {
    if (isThisFolderActive) {
      actions?.togglePlayPause();
    } else if (folderTracks.length > 0) {
      actions?.playQueue(folderTracks, 0);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <ArrowLeft color={colors.cream} size={22} />
        </Pressable>

        {/* Big art — tap to set/change the linked photo album */}
        <Pressable style={styles.artWrapper} onPress={() => setAlbumPickerVisible(true)}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={[StyleSheet.absoluteFill, styles.artImage]} resizeMode="cover" />
          )}
          {!folder.linkedAlbumId && (
            <View style={styles.artHint}>
              <ThemedText variant="muted" style={{ fontSize: 11 }}>
                Tap to set photo album
              </ThemedText>
            </View>
          )}

          {/* Play/Pause pinned to the bottom-center of the image, half-overlapping the edge */}
          <View style={styles.playButtonAnchor} pointerEvents="box-none">
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              style={styles.playButton}
            >
              {isThisFolderActive && isPlaying ? (
                <Pause color={colors.bg} size={26} fill={colors.bg} />
              ) : (
                <Play color={colors.bg} size={26} fill={colors.bg} />
              )}
            </Pressable>
          </View>
        </Pressable>

        <ThemedText variant="title" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
          {folder.name}
        </ThemedText>

        <FlatList
          data={folderTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
          renderItem={({ item, index }) => {
            const isRowActive = currentTrack?.id === item.id;
            return (
              <Pressable
                onPress={() => handleTrackPress(index)}
                style={[styles.trackRow, isRowActive && styles.trackRowActive]}
              >
                <ThemedText
                  variant="body"
                  style={{ fontWeight: "600", color: isRowActive ? colors.orange : colors.cream }}
                >
                  {folder.name} {index + 1}
                </ThemedText>
                <ThemedText variant="muted" style={{ fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                  {item.title}
                </ThemedText>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <ThemedText variant="muted" style={{ marginTop: spacing.md }}>
              No songs in this folder yet.
            </ThemedText>
          }
        />
      </View>

      <AlbumPickerModal
        visible={albumPickerVisible}
        onClose={() => setAlbumPickerVisible(false)}
        onSelect={(albumId) => linkAlbum(folder.id, albumId)}
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
  backButton: {
    padding: spacing.xs,
    alignSelf: "flex-start",
  },
  artWrapper: {
    marginTop: spacing.md,
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: "visible", // the play button is allowed to spill past the image edge
    backgroundColor: colors.surface,
  },
  artImage: {
    borderRadius: radius.lg,
  },
  artHint: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  playButtonAnchor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    transform: [{ translateY: 28 }], // half the button's height, so it straddles the image's bottom edge
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  trackRow: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  trackRowActive: {
    backgroundColor: colors.surface,
  },
});