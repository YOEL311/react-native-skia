import { isSharedValue, useDerivedValue, type FrameInfo, type SharedValue } from "react-native-reanimated";
import { useEffect, useMemo } from "react";

import { Skia } from "../../skia/Skia";
import type { SkImage } from "../../skia/types";
import { Platform } from "../../Platform";

import Rea from "./ReanimatedProxy";

type Animated<T> = SharedValue<T> | T;

interface PlaybackOptions {
  playbackSpeed: Animated<number>;
  looping: Animated<boolean>;
  paused: Animated<boolean>;
}

const defaultOptions = {
  playbackSpeed: 1,
  looping: true,
  paused: false,
};

const dematerialize = <T>(value: Animated<T>) => {
  "worklet";
  return isSharedValue(value) ? value : {value};
};

export const useVideo = (
  source: string | null,
  userOptions?: Partial<PlaybackOptions>
) => {
  const options = { ...defaultOptions, ...userOptions };
  const paused = dematerialize(options.paused);
  const playbackSpeed = dematerialize(options.playbackSpeed);
  const looping = dematerialize(options.looping);
  const video = useMemo(() => (source ? Skia.Video(source) : null), [source]);
  const defaultPaused = Rea.useSharedValue(false);
  const isPaused = paused ?? defaultPaused;
  const currentFrame = Rea.useSharedValue<null | SkImage>(null);
  const lastTimestamp = Rea.useSharedValue(-1);
  const startTimestamp = Rea.useSharedValue(-1);
  const frameDuration = useDerivedValue(
    () => (video ? (1 / video.framerate()) * 1000 * 1/playbackSpeed.value : -1),
    [video]
  );
  const duration = useMemo(() => (video ? video.duration() : -1), [video]);

  Rea.useFrameCallback((frameInfo: FrameInfo) => {
    if (!video) {
      return;
    }
    if (isPaused.value && lastTimestamp.value !== -1) {
      return;
    }
    const { timestamp } = frameInfo;
    const elapsed = timestamp - lastTimestamp.value;

    // Check if it's time to switch frames based on frame duration
    if (elapsed < frameDuration.value) {
      return;
    }

    // Update the current frame
    if (startTimestamp.value === -1) {
      startTimestamp.value = timestamp;
    }
    const currentTimestamp = timestamp - startTimestamp.value;
    if (currentTimestamp > duration && looping.value) {
      video.seek(0);
      startTimestamp.value = timestamp;
    }
    const img = video.nextImage();
    if (img) {
      if (currentFrame.value) {
        currentFrame.value.dispose();
      }
      if (Platform.OS === "android") {
        currentFrame.value = img.makeNonTextureImage();
      } else {
        currentFrame.value = img;
      }
    }

    // Update the last timestamp
    lastTimestamp.value = timestamp;
  });
  useEffect(() => {
    return () => {
      //video?.dispose();
    };
  }, [video]);
  return currentFrame;
};
