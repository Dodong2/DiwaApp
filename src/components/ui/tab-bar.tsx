import { View, Pressable, LayoutChangeEvent } from "react-native";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../../constants/theme";

const TAB_SIZE = 48;
const BAR_PADDING = 6;

// Minimal local types — sapat na para sa kung ano lang ginagamit natin
// mula sa tabBar render prop ng expo-router's <Tabs />, walang need
// mag-install ng @react-navigation/bottom-tabs.

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
  const indicatorX = useSharedValue(0);

  const tabCount = state.routes.length;
  const barWidth = tabCount * TAB_SIZE + BAR_PADDING * 2;

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const goTo = (index: number, routeName: string, isFocused: boolean) => {
    indicatorX.value = withSpring(BAR_PADDING + index * TAB_SIZE, {
      damping: 18,
      stiffness: 220,
      mass: 0.6,
    });

    const event = navigation.emit({
      type: "tabPress",
      target: state.routes[index].key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

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
          height: TAB_SIZE + BAR_PADDING * 2,
          borderRadius: radius.full,
          backgroundColor: colors.olive,
          flexDirection: "row",
          padding: BAR_PADDING,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: BAR_PADDING,
              left: 0,
              width: TAB_SIZE,
              height: TAB_SIZE,
              borderRadius: radius.full,
              backgroundColor: colors.orange,
            },
            indicatorStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const Icon = options.tabBarIcon;

          if (isFocused && indicatorX.value === 0 && index !== 0) {
            indicatorX.value = BAR_PADDING + index * TAB_SIZE;
          }

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
  );
}