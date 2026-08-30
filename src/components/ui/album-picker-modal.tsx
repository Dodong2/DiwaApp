import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { colors, radius, spacing } from "../../constants/theme";
import { usePhotoAlbums, PhotoAlbum } from "../../hooks/use-photo-album";
import { useAlbumSearchHistoryStore } from "../../store/search-history-store";
import { ThemedText } from "./themed-text";
import { SearchModal } from "./search-modal";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (albumId: string) => void;
};

export function AlbumPickerModal({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const { albums, loading } = usePhotoAlbums();
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="title" style={{ marginBottom: spacing.sm }}>
                Pick a photo album
              </ThemedText>
              <ThemedText variant="muted" style={{ marginBottom: spacing.md }}>
                Photos from this album will show as art for this mood.
              </ThemedText>
            </View>
            <Pressable onPress={() => setSearchVisible(true)} style={{ padding: 4 }}>
              <Search color={colors.cream} size={20} />
            </Pressable>
          </View>

          {loading && <ThemedText variant="muted">Loading albums...</ThemedText>}

          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 350 }}
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

      <SearchModal<PhotoAlbum>
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        items={albums}
        getId={(a) => a.id}
        getLabel={(a) => a.title}
        getSubLabel={(a) => `${a.assetCount} photos`}
        onSelect={(album) => {
          onSelect(album.id);
          setSearchVisible(false);
          onClose();
        }}
        useHistoryStore={useAlbumSearchHistoryStore}
        placeholder="Search photo albums"
        emptyLabel="albums"
      />
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
    maxHeight: "75%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
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