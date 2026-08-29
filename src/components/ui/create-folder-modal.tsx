import { useState, useMemo } from "react";
import {
  Modal,
  View,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { ThemedText } from "./themed-text";
import { Button } from "./button";
import { Track } from "../../hooks/use-music-library";
import { useFoldersStore } from "../../store/folders-store";
import { colors, spacing, radius } from "../../constants/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  availableTracks: Track[];
};

export function CreateFolderModal({ visible, onClose, availableTracks }: Props) {
  const [step, setStep] = useState<"name" | "songs">("name");
  const [folderName, setFolderName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const addFolder = useFoldersStore((s) => s.addFolder);

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return availableTracks;
    const q = searchQuery.toLowerCase();
    return availableTracks.filter((t) => t.title.toLowerCase().includes(q));
  }, [availableTracks, searchQuery]);

  const reset = () => {
    setStep("name");
    setFolderName("");
    setSelectedIds([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleTrack = (id: string) => {
    Keyboard.dismiss();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (folderName.trim() && selectedIds.length > 0) {
      addFolder(folderName.trim(), selectedIds);
      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {step === "name" ? (
              <>
                <ThemedText variant="title" style={{ marginBottom: spacing.sm }}>
                  What's the theme of this music?
                </ThemedText>
                <ThemedText variant="muted" style={{ marginBottom: spacing.md }}>
                  e.g. "Calm", "Hype", "Study" — this becomes your folder name.
                </ThemedText>

                <TextInput
                  value={folderName}
                  onChangeText={setFolderName}
                  placeholder="Folder name"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoFocus
                />

                <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg }}>
                  <View style={{ flex: 1 }}>
                    <Button label="Cancel" variant="outline" onPress={handleClose} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Next"
                      onPress={() => folderName.trim() && setStep("songs")}
                    />
                  </View>
                </View>
              </>
            ) : (
              <>
                <ThemedText variant="title" style={{ marginBottom: 4 }}>
                  Add songs to "{folderName}"
                </ThemedText>
                <ThemedText variant="muted" style={{ marginBottom: spacing.md }}>
                  {selectedIds.length} selected
                </ThemedText>

                <View style={styles.searchBar}>
                  <Search color={colors.muted} size={18} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search your music"
                    placeholderTextColor={colors.muted}
                    style={styles.searchInput}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery("")}>
                      <X color={colors.muted} size={18} />
                    </Pressable>
                  )}
                </View>

                <FlatList
                  data={filteredTracks}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: 280 }}
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
                      No songs match "{searchQuery}"
                    </ThemedText>
                  }
                />

                <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Button label="Back" variant="outline" onPress={() => setStep("name")} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Add" onPress={handleAdd} />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  sheet: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: "80%",
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.cream,
    fontSize: 16,
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