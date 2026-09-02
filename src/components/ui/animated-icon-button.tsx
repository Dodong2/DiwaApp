import { useState, ReactNode } from "react";
import { Pressable, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { EaseView } from "react-native-ease";
import * as Haptics from "expo-haptics";
import { colors } from "../../constants/theme";

type Props = {
  onPress: () => void;
  children: ReactNode;
  size?: number;
  scaleTo?: number;
  withBackground?: boolean;
  haptic?: boolean; // set false for buttons that shouldn't buzz (rare)
  style?: StyleProp<ViewStyle>;
};

export function AnimatedIconButton({
  onPress,
  children,
  size = 44,
  scaleTo = 0.9,
  withBackground = true,
  haptic = true,
  style,
}: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        setPressed(true);
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
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
    borderRadius: 999,
    backgroundColor: colors.olive,
  },
});