import React from "react";
import type { SkImage } from "@shopify/react-native-skia";
import { Circle, Skia, vec } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const leftScreen = (background: SkImage | null, progress: number) => {
  "worklet";
  const surface = Skia.Surface.Make(width, height)!;
  const canvas = surface.getCanvas()!;
  if (background) {
    canvas.drawImage(background, 0, 0);
  }
  const paint = Skia.Paint();
  paint.setColor(Skia.Color("cyan"));
  //paint.setAlphaf(progress);
  canvas.drawCircle(width / 2, height / 2, 100, paint);
  return surface.makeImageSnapshot();
};

interface LeftScreenProps {
  progress: SharedValue<number>;
}

export const LeftScreen = ({ progress }: LeftScreenProps) => {
  return <Circle c={vec(100, 100)} r={100} color="cyan" opacity={progress} />;
};
