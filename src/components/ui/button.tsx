import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing } from "../../constants/theme";

export function Button({
  label,
  onPress,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline";
}) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, isPrimary ? styles.primary : styles.outline]}
    >
      <Text style={isPrimary ? styles.primaryText : styles.outlineText}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    alignItems: "center",
  },
  primary: {
    backgroundColor: colors.orange,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.olive,
  },
  primaryText: {
    color: colors.bg,
    fontWeight: "600",
  },
  outlineText: {
    color: colors.cream,
    fontWeight: "600",
  },
});