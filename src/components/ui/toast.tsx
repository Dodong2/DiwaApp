import { View, StyleSheet } from "react-native";
import { EaseView } from "react-native-ease";
import { ThemedText } from "./themed-text";
import { useToastStore } from "../../store/toast-store";
import { colors, radius, spacing } from "../../constants/theme";

export function Toast() {
  const message = useToastStore((s) => s.message);
  const visible = message !== null;

  return (
    <EaseView
      style={styles.wrapper}
      animate={{ opacity: visible ? 1 : 0, translateY: visible ? 0 : -8 }}
      transition={{ type: "timing", duration: 180 }}
      pointerEvents="none"
    >
      <View style={styles.pill}>
        <ThemedText variant="body" style={styles.text}>
          {message ?? ""}
        </ThemedText>
      </View>
    </EaseView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: spacing.md,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  pill: {
    backgroundColor: "rgba(50,50,50,0.9)", // simple neutral gray, independent of theme accent colors
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  text: {
    fontSize: 13,
  },
});