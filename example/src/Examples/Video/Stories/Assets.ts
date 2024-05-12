import { useVideo } from "@shopify/react-native-skia";
import { useAssets as useAssetsExpo } from "expo-asset";

export const useAssets = () => {
  const [assets, error] = useAssetsExpo([
    require("../../../assets/videos/bauhaus.mp4"),
    require("../../../assets/videos/ai.mp4"),
    require("../../../assets/videos/flocking.mp4"),
  ]);
  const video1 = useVideo(assets ? assets[0].localUri : null, true);
  const video2 = useVideo(assets ? assets[1].localUri : null, true);
  const video3 = useVideo(assets ? assets[2].localUri : null, true);
  if (error) {
    throw error;
  }
  return [video1, video2, video3];
};
