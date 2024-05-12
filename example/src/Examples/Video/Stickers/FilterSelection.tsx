import type { SkImage } from "@shopify/react-native-skia";
import {
  Canvas,
  ColorMatrix,
  Group,
  Image,
  rect,
  rrect,
} from "@shopify/react-native-skia";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";

interface FilterProps {
  filter: {
    name: string;
    matrix: number[];
  };
  image: SkImage | null | SharedValue<SkImage | null>;
  currentFilter: SharedValue<number[]>;
}

const size = 75;

const Filter = ({ filter, image, currentFilter }: FilterProps) => {
  return (
    <Pressable onPress={() => (currentFilter.value = filter.matrix)}>
      <View>
        <Canvas style={{ width: size, height: size, margin: 8 }}>
          <Group clip={rrect(rect(0, 0, size, size), 8, 8)}>
            <Image
              image={image}
              x={0}
              y={0}
              width={size}
              height={size}
              fit="cover"
            >
              <ColorMatrix matrix={filter.matrix} />
            </Image>
          </Group>
        </Canvas>
        <Text style={{ color: "white", textAlign: "center" }}>
          {filter.name}
        </Text>
      </View>
    </Pressable>
  );
};

const filters = [
  {
    name: "Default",
    matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  },
  {
    name: "Sepia",
    matrix: [
      0.393, 0.768, 0.188, 0, 0, 0.349, 0.685, 0.167, 0, 0, 0.272, 0.533, 0.13,
      0, 0, 0, 0, 0, 1, 0,
    ],
  },
  {
    name: "Duotone red",
    matrix: [1, 1, 1, 0, 0, 0, 0, 0 - 0.5, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 1, 0],
  },
];

interface FilterProps {
  image: SkImage | null | SharedValue<SkImage | null>;
  currentFilter: SharedValue<number[]>;
}

export const FilterSelection = ({ image, currentFilter }: FilterProps) => {
  return (
    <View
      style={{ ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" }}
    >
      <View style={{ height: 300 }}>
        <ScrollView style={{ flex: 1 }} horizontal>
          {filters.map((filter, index) => (
            <Filter
              key={index}
              filter={filter}
              image={image}
              currentFilter={currentFilter}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
