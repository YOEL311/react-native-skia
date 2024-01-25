import React from "react";

import { checkImage, docPath } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";
import { Atlas, Group, Rect } from "../../components";

describe("Atlas", () => {
  it("should read the RSXform properties", async () => {
    const result = await surface.eval((Skia) => {
      const transform = Skia.RSXform(1, 2, 3, 4);
      return [transform.scos, transform.ssin, transform.tx, transform.ty];
    });
    expect(result).toEqual([1, 2, 3, 4]);
  });
  it("should draw the atlas using the imperative API", async () => {
    const img = await surface.drawOffscreen((Skia, canvas) => {
      const size = 200;
      const texSurface = Skia.Surface.MakeOffscreen(size, size)!;
      const texCanvas = texSurface.getCanvas();
      texCanvas.drawColor(Skia.Color("red"));
      const tex = texSurface.makeImageSnapshot();
      const srcs = [
        Skia.XYWHRect(0, 0, size, size),
        Skia.XYWHRect(0, 0, size, size),
      ];
      const dsts = [Skia.RSXform(0.5, 0, 0, 0), Skia.RSXform(0, 0.5, 200, 100)];
      const paint = Skia.Paint();
      canvas.drawAtlas(tex, srcs, dsts, paint);
    });
    checkImage(img, "snapshots/atlas/simple.png");
  });
  it("should accept RSXform as JS", async () => {
    const img = await surface.drawOffscreen((Skia, canvas) => {
      const size = 200;
      const texSurface = Skia.Surface.MakeOffscreen(size, size)!;
      const texCanvas = texSurface.getCanvas();
      texCanvas.drawColor(Skia.Color("red"));
      const tex = texSurface.makeImageSnapshot();
      const srcs = [
        Skia.XYWHRect(0, 0, size, size),
        Skia.XYWHRect(0, 0, size, size),
      ];
      const dsts = [Skia.RSXform(0.5, 0, 0, 0), Skia.RSXform(0, 0.5, 200, 100)];
      const paint = Skia.Paint();
      canvas.drawAtlas(tex, srcs, dsts, paint);
    });
    checkImage(img, "snapshots/atlas/simple.png");
  });
  it("Simple Atlas", async () => {
    const { Skia } = importSkia();
    const size = 75;
    const texSurface = Skia.Surface.MakeOffscreen(size, size)!;
    const texCanvas = texSurface.getCanvas();
    texCanvas.drawColor(Skia.Color("red"));
    const image = texSurface.makeImageSnapshot();
    const img = await surface.draw(
      <Atlas
        image={image}
        sprites={[
          Skia.XYWHRect(0, 0, size, size),
          Skia.XYWHRect(0, 0, size, size),
        ]}
        transforms={[Skia.RSXform(0.5, 0, 0, 0), Skia.RSXform(0, 0.5, 50, 50)]}
      />
    );
    checkImage(img, "snapshots/atlas/simple2.png");
  });
  it("Simple Atlas identity", async () => {
    const { Skia } = importSkia();
    const size = 75;
    const texSurface = Skia.Surface.MakeOffscreen(size, size)!;
    const texCanvas = texSurface.getCanvas();
    texCanvas.drawColor(Skia.Color("red"));
    const image = texSurface.makeImageSnapshot();
    const img = await surface.draw(
      <Atlas
        image={image}
        sprites={[
          Skia.XYWHRect(0, 0, size, size),
          Skia.XYWHRect(0, 0, size, size),
        ]}
        transforms={[Skia.RSXform(1, 0, 0, 0), Skia.RSXform(1, 0, 0, 0)]}
      />
    );
    checkImage(img, "snapshots/atlas/identity.png");
  });
  it("Atlas documentation example", async () => {
    const { Skia, rect, createTexture } = importSkia();
    const size = { width: 25, height: 25 * 0.45 };
    const strokeWidth = 2;
    const textureSize = {
      width: size.width + strokeWidth,
      height: size.height + strokeWidth,
    };
    const texture = createTexture(
      <Group>
        <Rect
          rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
          color="#00ff00"
        />
        <Rect
          rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
          color="#4060A3"
          style="stroke"
          strokeWidth={strokeWidth}
        />
      </Group>,
      textureSize
    );
    const numberOfBoxes = 150;
    const pos = { x: 128, y: 128 };
    const width = 256;
    const sprites = new Array(numberOfBoxes)
      .fill(0)
      .map(() => rect(0, 0, textureSize.width, textureSize.height));
    const transforms = new Array(numberOfBoxes).fill(0).map((_, i) => {
      const tx = 5 + ((i * size.width) % width);
      const ty = 25 + Math.floor(i / (width / size.width)) * size.width;
      const r = Math.atan2(pos.y - ty, pos.x - tx);
      return Skia.RSXform(Math.cos(r), Math.sin(r), tx, ty);
    });

    const img = await surface.draw(
      <Atlas image={texture} sprites={sprites} transforms={transforms} />
    );
    checkImage(img, docPath("atlas/hello-world.png"));
  });
});
