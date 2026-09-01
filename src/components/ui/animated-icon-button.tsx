import { useState, ReactNode } from "react";
import { Pressable, View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { EaseView } from "react-native-ease";
import { colors } from "../../constants/theme";

type Props = {
  onPress: () => void;
  children: ReactNode;
  size?: number; // touch target size, also the circle's diameter
  scaleTo?: number;
  withBackground?: boolean; // circular olive highlight on press — turn off for buttons that already have their own solid background (e.g. play/pause)
  style?: StyleProp<ViewStyle>;
};

export function AnimatedIconButton({
  onPress,
  children,
  size = 44,
  scaleTo = 0.9,
  withBackground = true,
  style,
}: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        { width: size, height: size, alignItems: "center", justifyContent: "center" },
        style,
      ]}
    >
      {withBackground && (
        <EaseView
          style={[StyleSheet.absoluteFill, styles.bgCircle]}
          animate={{ opacity: pressed ? 1 : 0 }}
          transition={{ type: "timing", duration: 120 }}
          pointerEvents="none"
        />
      )}

      <EaseView
        animate={{ scale: pressed ? scaleTo : 1 }}
        transition={{ type: "timing", duration: 120 }}
      >
        {children}
      </EaseView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bgCircle: {
    borderRadius: 999, // circle regardless of actual button size
    backgroundColor: colors.olive,
  },
});