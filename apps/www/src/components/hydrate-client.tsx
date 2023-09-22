"use client";

import { Hydrate as RQHydrate } from "@tanstack/react-query";
import type { HydrateProps } from "@tanstack/react-query";

function Hydrate(props: HydrateProps) {
  return <RQHydrate {...props} />;
}

export default Hydrate;
