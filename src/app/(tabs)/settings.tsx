import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Image as ImageIcon, ChevronRight } from "lucide-react-native";
import { Screen } from "../../components/ui/screen";
import { ThemedText } from "../../components/ui/themed-text";
import { AlbumPickerModal } from "../../components/ui/album-picker-modal";
import { usePhotoAlbums } from "../../hooks/use-photo-album";
import { useSettingsStore } from "../../store/settings-store";
import { colors, radius, spacing } from "../../constants/theme";

export default function SettingsScreen() {
  const { albums } = usePhotoAlbums();
  const nowPlayingAlbumId = useSettingsStore((s) => s.nowPlayingAlbumId);
  const setNowPlayingAlbum = useSettingsStore((s) => s.setNowPlayingAlbum);

  const [pickerVisible, setPickerVisible] = useState(false);

  // Resolve the saved album id into its display name, since we only store the id.
  const selectedAlbumTitle = albums.find((a) => a.id === nowPlayingAlbumId)?.title;

  return (
    <Screen>
      <ThemedText variant="title" style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
        Settings
      </ThemedText>

      <ThemedText variant="muted" style={{ marginBottom: spacing.sm, fontSize: 12, textTransform: "uppercase" }}>
        All Music
      </ThemedText>

      <Pressable style={styles.row} onPress={() => setPickerVisible(true)}>
        <View style={styles.rowIcon}>
          <ImageIcon color={colors.orange} size={20} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="body" style={{ fontWeight: "600" }}>
            Default photo album
          </ThemedText>
          <ThemedText variant="muted" style={{ fontSize: 12, marginTop: 2 }}>
            {selectedAlbumTitle ?? "Not set — using random placeholders"}
          </ThemedText>
        </View>
        <ChevronRight color={colors.muted} size={20} />
      </Pressable>

      <ThemedText variant="muted" style={{ marginTop: spacing.sm, fontSize: 12 }}>
        Photos from this album will show as art on the Now Playing screen when
        listening from All Music. Each album/folder in the Albums tab has its
        own separate photo album — set those inside that album's player instead.
      </ThemedText>

      <AlbumPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={setNowPlayingAlbum}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});