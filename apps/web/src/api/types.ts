import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "@cvsudotme/api";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
