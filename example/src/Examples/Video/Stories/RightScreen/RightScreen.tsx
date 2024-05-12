import React from "react";
import { Circle, vec } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

interface RightScreenProps {
  progress: SharedValue<number>;
}

export const RightScreen = ({ progress }: RightScreenProps) => {
  return <Circle c={vec(100, 100)} r={100} color="red" opacity={progress} />;
};
