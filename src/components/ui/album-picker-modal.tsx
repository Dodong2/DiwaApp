import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { usePhotoAlbums } from "../../hooks/use-photo-album";
import { ThemedText } from "./themed-text";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (albumId: string) => void;
};

export function AlbumPickerModal({ visible, onClose, onSelect }: Props) {
  const { albums, loading } = usePhotoAlbums();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ThemedText variant="title" style={{ marginBottom: spacing.sm }}>
            Pick a photo album
          </ThemedText>
          <ThemedText variant="muted" style={{ marginBottom: spacing.md }}>
            Photos from this album will show as art for this mood.
          </ThemedText>

          {loading && <ThemedText variant="muted">Loading albums...</ThemedText>}

          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onSelect(item.id);
                  onClose();
                }}
              >
                <ThemedText variant="body">{item.title}</ThemedText>
                <ThemedText variant="muted">{item.assetCount}</ThemedText>
              </Pressable>
            )}
            ListEmptyComponent={
              !loading ? <ThemedText variant="muted">No photo albums found.</ThemedText> : null
            }
          />

          <Pressable onPress={onClose} style={styles.closeButton}>
            <ThemedText variant="body" style={{ textAlign: "center" }}>Cancel</ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: "70%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg,
  },
  closeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
});