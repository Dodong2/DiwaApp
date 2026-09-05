import { View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { ThemedText } from "./themed-text";
import { colors, spacing } from "../../constants/theme";

type Props = {
  title: string;
  right?: ReactNode;
};

export function ScreenHeader({ title, right }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText variant="title">{title}</ThemedText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg, // opaque, para di makikita ang laman na dumadaan sa ilalim
  },
});