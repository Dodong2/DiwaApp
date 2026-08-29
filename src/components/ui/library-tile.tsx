import { Pressable, View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { ThemedText } from "./themed-text";
import { colors, radius, spacing } from "../../constants/theme";

type Props = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  variant?: "solid" | "dashed";
};

export function LibraryTile({ label, icon, onPress, variant = "solid" }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tile, variant === "dashed" && styles.dashed]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <ThemedText variant="body" style={{ fontWeight: "600" }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dashed: {
    borderWidth: 1.5,
    borderColor: colors.olive,
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});