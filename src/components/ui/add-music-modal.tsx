import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X } from "lucide-react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { ThemedText } from "./themed-text";
import { Button } from "./button";
import { Track } from "../../hooks/use-music-library";
import { useFoldersStore } from "../../store/folders-store";
import { useToastStore } from "../../store/toast-store";
import { colors, spacing, radius } from "../../constants/theme";

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  visible: boolean;
  onClose: () => void;
  folderId: string;
  folderName: string;
  availableTracks: Track[]; // tracks NOT already in this folder
};

export function AddMusicModal({ visible, onClose, folderId, folderName, availableTracks }: Props) {
  const insets = useSafeAreaInsets();
  const addTrackToFolder = useFoldersStore((s) => s.addTrackToFolder);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Debounce: only update the value actually used for filtering after the
  // user pauses typing for a bit. This avoids re-filtering (and re-rendering
  // the whole list) on every single keystroke while the user is still typing.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const filteredTracks = useMemo(() => {
    if (!debouncedQuery.trim()) return availableTracks;
    const q = debouncedQuery.toLowerCase();
    return availableTracks.filter((t) => t.title.toLowerCase().includes(q));
  }, [availableTracks, debouncedQuery]);

  const reset = () => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedIds([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleTrack = (id: string) => {
    Haptics.selectionAsync();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => addTrackToFolder(folderId, id));
    useToastStore.getState().show(
      `Added ${selectedIds.length} song${selectedIds.length > 1 ? "s" : ""} to "${folderName}"`
    );
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.backdrop}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.backdropTint} pointerEvents="none" />
          <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}>
            <ThemedText variant="title" style={{ marginBottom: 4 }}>
              Add music to "{folderName}"
            </ThemedText>
            <ThemedText variant="muted" style={{ marginBottom: spacing.md }}>
              {selectedIds.length} selected
            </ThemedText>

            <View style={styles.searchBar}>
              <Search color={colors.muted} size={18} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search your music"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")}>
                  <X color={colors.muted} size={18} />
                </Pressable>
              )}
            </View>

            <FlatList
              data={filteredTracks}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 320 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const checked = selectedIds.includes(item.id);
                return (
                  <Pressable style={styles.trackRow} onPress={() => toggleTrack(item.id)}>
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                    </View>
                    <ThemedText variant="body" numberOfLines={1} style={{ flex: 1 }}>
                      {item.title}
                    </ThemedText>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <ThemedText variant="muted" style={{ textAlign: "center", marginTop: spacing.md }}>
                  {availableTracks.length === 0
                    ? "All your songs are already in this album."
                    : `No songs match "${debouncedQuery}"`}
                </ThemedText>
              }
            />

            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Button label="Cancel" variant="outline" onPress={handleClose} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={`Add to "${folderName}"`} onPress={handleAdd} />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  backdropTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bg,
    opacity: 0.35,
  },
  sheet: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: "82%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.cream,
    fontSize: 15,
    paddingVertical: spacing.sm + 2,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  checkmark: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: "bold",
  },
});