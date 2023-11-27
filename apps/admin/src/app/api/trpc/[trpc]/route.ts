import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@kabsu.me/api/root";
import { createTRPCContext } from "@kabsu.me/api/trpc";
import { auth } from "@kabsu.me/auth";

// export const runtime = "edge";

function setCorsHeaders(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Request-Method", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.headers.set("Access-Control-Allow-Headers", "*");
}

export function OPTIONS() {
  const response = new Response(null, {
    status: 204,
  });
  setCorsHeaders(response);
  return response;
}

const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: async () => createTRPCContext({ auth: await auth(), req }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

  setCorsHeaders(response);
  return response;
};

export { handler as GET, handler as POST };
