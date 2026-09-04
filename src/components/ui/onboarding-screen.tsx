import { View, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";
import { useOnboardingStore } from "../../store/onboarding-store";
import { colors, radius, spacing } from "../../constants/theme";

const FEATURES = [
  "Play your local music library, organized your way",
  "Link photo albums to playlists for a personalized Now Playing screen",
  "Download tracks to listen offline, anytime",
  "Shuffle, repeat, and control playback from anywhere in the app",
];

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const complete = useOnboardingStore((s) => s.complete);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.content}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText style={styles.appName}>diwa</ThemedText>

        <ThemedText variant="muted" style={styles.tagline}>
          Your music, your memories, all in one place.
        </ThemedText>

        <View style={styles.bulletList}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <ThemedText variant="body" style={styles.bulletText}>
                {feature}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Pressable style={styles.button} onPress={complete}>
        <ThemedText style={styles.buttonText}>Get Started</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill, // laging naka-overlay sa buong screen
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
    zIndex: 10,
  },
  content: {
    alignItems: "center",
    marginTop: spacing.xl,
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.cream,
  },
  tagline: {
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  bulletList: {
    width: "100%",
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: colors.bg,
    fontWeight: "700",
    fontSize: 16,
  },
});