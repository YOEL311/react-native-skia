import {
  Canvas,
  Matrix4,
  Skia,
  useFont,
  useImage,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { useVideoFromAsset } from "../../../components/Animations";

import { HelloSticker, HelloStickerDimensions } from "./HelloSticker";
import { LocationSticker, LocationStickerDimensions } from "./LocationSticker";
import { GestureHandler } from "./GestureHandler";
import { Picture, PictureDimensions } from "./Picture";
import { FilterSelection } from "./FilterSelection";

const { width, height } = Dimensions.get("window");

const zurich = require("./assets/zurich.jpg");
const aveny = require("./assets/aveny.ttf");

export const Stickers = () => {
  const colorMatrix = useSharedValue([
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
  ]);
  const video = useVideoFromAsset(require("../../../assets/videos/ai.mp4"));
  const pictureMatrix = useSharedValue(Matrix4());
  const helloMatrix = useSharedValue(Matrix4());
  const locationMatrix = useSharedValue(Matrix4());
  const image = useImage(zurich);
  const font = useFont(aveny, 56);
  if (!image || !font) {
    return null;
  }
  return (
    <View>
      <Canvas style={{ width, height }}>
        <Picture
          matrix={pictureMatrix}
          image={video}
          colorMatrix={colorMatrix}
        />
        <HelloSticker matrix={helloMatrix} />
        <LocationSticker font={font} matrix={locationMatrix} />
      </Canvas>
      <GestureHandler matrix={pictureMatrix} dimensions={PictureDimensions} />
      <GestureHandler
        matrix={helloMatrix}
        dimensions={HelloStickerDimensions}
      />
      <GestureHandler
        matrix={locationMatrix}
        dimensions={LocationStickerDimensions}
      />
      <FilterSelection image={video} currentFilter={colorMatrix} />
    </View>
  );
};
