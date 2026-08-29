import { StyleSheet, Text, TextProps, TextStyle } from "react-native";
import { colors } from "../../constants/theme";

type Variant = "title" | "body" | "muted";

export function ThemedText({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  return <Text style={[styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  title: {
    color: colors.cream,
    fontSize: 24,
    fontWeight: "bold",
  } as TextStyle,
  body: {
    color: colors.cream,
    fontSize: 16,
  } as TextStyle,
  muted: {
    color: colors.muted,
    fontSize: 14,
  } as TextStyle,
});