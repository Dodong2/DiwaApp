import { View, Pressable, LayoutChangeEvent, Platform, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { BlurView } from "expo-blur";
import { colors, radius, spacing } from "../../constants/theme";

const TAB_SIZE = 48;
const BAR_PADDING = 6;
const glassAvailable = Platform.OS === "ios" && isLiquidGlassAvailable();

type TabRoute = {
  key: string;
  name: string;
};

type TabDescriptor = {
  options: {
    tabBarIcon?: (props: {
      color: string;
      size: number;
      focused: boolean;
    }) => React.ReactNode;
  };
};

type CustomTabBarProps = {
  state: {
    routes: TabRoute[];
    index: number;
  };
  descriptors: Record<string, TabDescriptor>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
};

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorX = useSharedValue(BAR_PADDING + state.index * TAB_SIZE);

  useEffect(() => {
    indicatorX.value = withSpring(BAR_PADDING + state.index * TAB_SIZE, {
      damping: 18,
      stiffness: 220,
      mass: 0.6,
    });
  }, [state.index]);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const goTo = (index: number, routeName: string, isFocused: boolean) => {
    navigation.emit({
      type: "tabPress",
      target: state.routes[index].key,
      canPreventDefault: true,
    });

    if (!isFocused) {
      navigation.navigate(routeName);
    }
  };

  const barWidth = state.routes.length * TAB_SIZE + BAR_PADDING * 2;
  const barHeight = TAB_SIZE + BAR_PADDING * 2;

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + spacing.sm,
        left: 0,
        right: 0,
        alignItems: "center",
      }}
      pointerEvents="box-none"
    >
      <View
        onLayout={onLayout}
        style={{
          width: barWidth,
          height: barHeight,
          borderRadius: radius.full,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        {/* Glass/blur background layer */}
        {glassAvailable ? (
          <GlassView
            style={[styles.fill, { borderRadius: radius.full }]}
            glassEffectStyle="regular"
            tintColor={colors.olive}
            isInteractive
          />
        ) : (
          <>
            <View style={[styles.fill, { backgroundColor: colors.olive }]} />
            <BlurView intensity={50} tint="dark" style={styles.fill} />
          </>
        )}

        {/* Content layer */}
        <View style={{ flexDirection: "row", padding: BAR_PADDING, flex: 1 }}>
          <Animated.View
            style={[
              {
                position: "absolute",
                top: BAR_PADDING,
                left: 0,
                width: TAB_SIZE,
                height: TAB_SIZE,
                borderRadius: radius.full,
                overflow: "hidden",
              },
              indicatorStyle,
            ]}
          >
            {/* Solid base muna — ito ang gumagawa ng makikitang bilog */}
            <View style={[styles.fill, { backgroundColor: colors.orange }]} />

            {glassAvailable && (
              <GlassView
                style={styles.fill}
                glassEffectStyle="regular"
                tintColor={colors.orange}
                isInteractive
              />
            )}
          </Animated.View>

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const Icon = options.tabBarIcon;

            return (
              <Pressable
                key={route.key}
                onPress={() => goTo(index, route.name, isFocused)}
                style={{
                  width: TAB_SIZE,
                  height: TAB_SIZE,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {Icon &&
                  Icon({
                    color: isFocused ? colors.olive : colors.cream,
                    size: 22,
                    focused: isFocused,
                  })}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
  },
});