import type { ComponentProps, ComponentType } from "react";
import React, { useMemo, lazy, Suspense, forwardRef } from "react";

import { Platform } from "../Platform";

import { LoadSkiaWeb } from "./LoadSkiaWeb";

interface WithSkiaProps {
  fallback?: ComponentProps<typeof Suspense>["fallback"];
  getComponent: () => Promise<{ default: ComponentType }>;
  opts?: Parameters<typeof LoadSkiaWeb>[0];
}

const WithSkiaWeb = forwardRef(({ getComponent, fallback, opts, ...rest }: WithSkiaProps, ref) => {
  const Inner = useMemo(
    // TODO: investigate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (): any =>
      lazy(async () => {
        if (Platform.OS === "web") {
          await LoadSkiaWeb(opts);
        } else {
          // eslint-disable-next-line no-console
          console.warn("<WithSkiaWeb /> is only necessary on web. Consider not using on native.");
        }
        return getComponent();
      }),
    [getComponent, opts],
  );

  return (
    <Suspense fallback={fallback ?? null}>
      <Inner {...rest} ref={ref} />
    </Suspense>
  );
});

WithSkiaWeb.displayName = "WithSkiaWeb";
export { WithSkiaWeb };
