import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./root";

export { createTRPCContext } from "./trpc";

// TODO: Maybe just export `createAction` instead of the whole `trpc` object?
export { t } from "./trpc";

export type { AppRouter } from "./root";

export type RouterInputs = inferRouterInputs<AppRouter>;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
