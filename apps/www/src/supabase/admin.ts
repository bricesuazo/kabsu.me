import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./../../../../supabase/types";
import { env } from "~/env";

export const createClient = () => {
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
};
