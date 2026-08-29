import { useState } from "react";
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
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<"name" | "songs">("name");
  const [folderName, setFolderName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const addFolder = useFoldersStore((s) => s.addFolder);

  const reset = () => {
    setStep("name");
    setFolderName("");
    setSelectedIds([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleTrack = (id: string) => {
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: spacing.lg + insets.bottom }]}>
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

              <FlatList
                data={availableTracks}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 350 }}
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
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: "88%",
    minHeight: "45%",
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.cream,
    fontSize: 16,
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