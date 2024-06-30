import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env } from "~/env";

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );
};
