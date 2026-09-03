import { useEffect, useState } from "react";
import { Modal, View, Pressable, FlatList, Image, TextInput, StyleSheet } from "react-native";
import { EaseView } from "react-native-ease";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, MoreVertical, Play, Pause, X, Plus, Check, Shuffle, Repeat, Repeat1 } from "lucide-react-native";
import { ThemedText } from "./themed-text";
import { AlbumPickerModal } from "./album-picker-modal";
import { AddMusicModal } from "./add-music-modal";
import { AnimatedIconButton } from "./animated-icon-button";
import { Toast } from "./toast";
import { useToastStore } from "../../store/toast-store";
import { getRandomPhotoFromAlbum } from "../../hooks/use-photo-album";
import { Track } from "../../hooks/use-music-library";
import { Folder, useFoldersStore } from "../../store/folders-store";
import {
  useCurrentTrack,
  useIsPlaying,
  useIsShuffled,
  useRepeatMode,
  usePlayerActions,
} from "../../store/player-store";
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
  const isShuffled = useIsShuffled();
  const repeatMode = useRepeatMode();
  const actions = usePlayerActions();
  const linkAlbum = useFoldersStore((s) => s.linkAlbum);
  const removeTrackFromFolder = useFoldersStore((s) => s.removeTrackFromFolder);
  const renameFolder = useFoldersStore((s) => s.renameFolder);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [albumPickerVisible, setAlbumPickerVisible] = useState(false);
  const [addMusicVisible, setAddMusicVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  const folderTracks: Track[] = folder
    ? folder.trackIds
        .map((id) => allTracks.find((t) => t.id === id))
        .filter((t): t is Track => Boolean(t))
    : [];

  // Tracks not yet in this folder — what the "Add music" modal offers.
  const availableToAdd: Track[] = folder
    ? allTracks.filter((t) => !folder.trackIds.includes(t.id))
    : [];

  const isThisFolderActive = currentTrack
    ? folder?.trackIds.includes(currentTrack.id) ?? false
    : false;

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

  // Reset edit mode whenever this modal closes.
  useEffect(() => {
    if (!visible) setEditMode(false);
  }, [visible]);

  // Sync the rename draft with the folder's real name whenever edit mode
  // turns on (or the folder itself changes while editing).
  useEffect(() => {
    if (editMode && folder) setTitleDraft(folder.name);
  }, [editMode, folder?.name]);

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

  const handleRemoveTrack = (track: Track) => {
    removeTrackFromFolder(folder.id, track.id);
    useToastStore.getState().show(`Removed from "${folder.name}"`);
  };

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== folder.name) {
      renameFolder(folder.id, trimmed);
      useToastStore.getState().show(`Renamed to "${trimmed}"`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.outer}>
        {/* Blurred, dimmed version of the same art, filling the whole screen
            behind the content — the sharp version stays in the small art
            card below. Same treatment as the Now Playing screen. */}
        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={["transparent", colors.bg]}
              locations={[0, 0.85]}
              style={styles.bottomGradient}
              pointerEvents="none"
            />
          </>
        )}

        <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        <Toast />

        {/* Header: back (left), edit toggle (right) */}
        <View style={styles.header}>
          <AnimatedIconButton onPress={onClose}>
            <ArrowLeft color={colors.cream} size={22} />
          </AnimatedIconButton>

          <AnimatedIconButton onPress={() => setEditMode((v) => !v)}>
            <MoreVertical color={editMode ? colors.orange : colors.cream} size={22} />
          </AnimatedIconButton>
        </View>

        {/* Big art — tappable to set/change the linked photo album, only in edit mode */}
        <Pressable
          style={styles.artWrapper}
          onPress={() => editMode && setAlbumPickerVisible(true)}
        >
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={[StyleSheet.absoluteFill, styles.artImage]}
              resizeMode="cover"
            />
          )}

          {/* Always mounted (not conditionally rendered) so the opacity
              change actually animates — a conditional render would just pop
              in/out instantly instead of fading. */}
          <EaseView
            style={[StyleSheet.absoluteFill, styles.artImage]}
            animate={{ opacity: editMode ? 1 : 0 }}
            transition={{ type: "timing", duration: 220 }}
            pointerEvents={editMode ? "auto" : "none"}
          >
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.artHintCentered} pointerEvents="none">
              <ThemedText style={styles.artHintText}>Tap to set photo album</ThemedText>
            </View>
          </EaseView>

          {/* Shuffle — Play/Pause — Repeat, all sharing the same gradient
              circle style, pinned at the mid-bottom of the image edge. */}
          <View style={styles.playButtonAnchor} pointerEvents="box-none">
            <View style={styles.playButtonShadow}>
              <AnimatedIconButton
                onPress={handleShufflePress}
                withBackground={false}
                gradient={[colors.orange, "#D98800"]}
                style={styles.plaoptionyButton}
              >
                <Shuffle color={colors.bg} size={20} />
              </AnimatedIconButton>
            </View>

            <View style={styles.playButtonShadow}>
              <AnimatedIconButton
                onPress={handlePlayPause}
                withBackground={false}
                gradient={[colors.orange, "#D98800"]}
                style={styles.playButton}
              >
                {isThisFolderActive && isPlaying ? (
                  <Pause color={colors.bg} size={26} fill={colors.bg} />
                ) : (
                  <Play color={colors.bg} size={26} fill={colors.bg} />
                )}
              </AnimatedIconButton>
            </View>

            <View style={styles.playButtonShadow}>
              <AnimatedIconButton
                onPress={handleRepeatPress}
                withBackground={false}
                gradient={[colors.orange, "#D98800"]}
                style={styles.plaoptionyButton}
              >
                {repeatMode === "one" ? (
                  <Repeat1 color={colors.bg} size={20} />
                ) : (
                  <Repeat color={colors.bg} size={20} />
                )}
              </AnimatedIconButton>
            </View>
          </View>
        </Pressable>

        {/* Title row: plain text normally, editable input + "+" add-music
            button when in edit mode. */}
        <View style={styles.titleRow}>
          {editMode ? (
            <>
              <TextInput
                value={titleDraft}
                onChangeText={setTitleDraft}
                style={styles.titleInput}
                onSubmitEditing={handleSaveTitle}
                returnKeyType="done"
              />
              <AnimatedIconButton onPress={handleSaveTitle} size={36}>
                <Check color={colors.orange} size={20} />
              </AnimatedIconButton>
            </>
          ) : (
            <ThemedText variant="title" style={{ flex: 1 }}>
              {folder.name}
            </ThemedText>
          )}

          <AnimatedIconButton onPress={() => setAddMusicVisible(true)} size={36}>
            <Plus color={colors.orange} size={22} />
          </AnimatedIconButton>
        </View>

        <FlatList
          data={folderTracks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
          renderItem={({ item, index }) => {
            const isRowActive = currentTrack?.id === item.id;
            return (
              <View style={[styles.trackRow, isRowActive && styles.trackRowActive]}>
                <Pressable onPress={() => handleTrackPress(index)} style={{ flex: 1 }}>
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

                {editMode && (
                  <AnimatedIconButton onPress={() => handleRemoveTrack(item)} size={36}>
                    <X color={colors.muted} size={18} />
                  </AnimatedIconButton>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <ThemedText variant="muted" style={{ marginTop: spacing.md }}>
              No songs in this folder yet.
            </ThemedText>
          }
        />
        </View>
      </View>

      <AlbumPickerModal
        visible={albumPickerVisible}
        onClose={() => setAlbumPickerVisible(false)}
        onSelect={(albumId) => linkAlbum(folder.id, albumId)}
      />

      <AddMusicModal
        visible={addMusicVisible}
        onClose={() => setAddMusicVisible(false)}
        folderId={folder.id}
        folderName={folder.name}
        availableTracks={availableToAdd}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.bg, // fallback while the blurred art loads or if it fails
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  artWrapper: {
    marginTop: spacing.md,
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: "visible",
    backgroundColor: colors.surface,
  },
  artImage: {
    borderRadius: radius.lg,
    overflow: "hidden", // needed so the BlurView (rendered as a child, not just this style) actually clips to the rounded corners
  },
  artHintCentered: {
    position: "absolute",
    top: "50%",
    left: spacing.lg,
    right: spacing.lg,
    transform: [{ translateY: -18 }],
    alignItems: "center",
  },
  artHintText: {
    backgroundColor: "rgba(244, 237, 228, 0.9)",
    color: colors.bg,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  playButtonAnchor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
    transform: [{ translateY: 28 }],
  },
  playButtonShadow: {
    borderRadius: radius.full,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    overflow: "hidden", // clips the gradient to the circle
    alignItems: "center",
    justifyContent: "center",
  },
  plaoptionyButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    overflow: "hidden", // clips the gradient to the circle
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    minHeight: 40, // locked so switching between the plain title and the
    // edit TextInput can't shift the FlatList below it even slightly
  },
  titleInput: {
    flex: 1,
    height: 40,
    color: colors.cream,
    fontSize: 24,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: colors.orange,
    paddingVertical: 0,
    textAlignVertical: "center", 
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  trackRowActive: {
    backgroundColor: colors.surface,
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%"
    },
});