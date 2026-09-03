import { View, StyleSheet, Modal } from "react-native";
import { BlurView } from "expo-blur";
import { ThemedText } from "./themed-text";
import { Button } from "./button";
import { colors, radius, spacing } from "../../constants/theme";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.backdropTint} pointerEvents="none" />

        <View style={styles.sheet}>
          <ThemedText variant="title" style={{ fontSize: 18, marginBottom: message ? 4 : spacing.md }}>
            {title}
          </ThemedText>
          {message && (
            <ThemedText variant="muted" style={{ marginBottom: spacing.md }}>
              {message}
            </ThemedText>
          )}

          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button label={cancelLabel} variant="outline" onPress={onCancel} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={confirmLabel} onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
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
  },
});