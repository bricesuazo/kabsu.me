"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { api } from "./client";
import { getUrl } from "./utils";

export default function TRPCProvider(props: {
  children: React.ReactNode;
  headers?: Headers;
}) {
  const [queryClient] = useState(() => new QueryClient({}));
  // const [trpcClient] = useState(() =>
  //   api.createClient({
  //     transformer: SuperJSON,
  //     links: [
  //       loggerLink({
  //         enabled: (opts) =>
  //           process.env.NODE_ENV === "development" ||
  //           (opts.direction === "down" && opts.result instanceof Error),
  //       }),
  //       unstable_httpBatchStreamLink({
  //         url: `${getUrl()}/api/trpc`,
  //         headers() {
  //           const headers = new Map(props.headers);
  //           headers.set("x-trpc-source", "nextjs-react");
  //           return Object.fromEntries(headers);
  //         },
  //       }),
  //     ],
  //   }),
  // );
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: getUrl(),
        }),
      ],
    }),
  );
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}
