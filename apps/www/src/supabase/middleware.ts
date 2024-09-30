import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "../../../../supabase/types";
import { env } from "~/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions: Partial<ResponseCookie> = {
              ...options,
              httpOnly: true, // Prevents access to cookie via JavaScript
              secure: env.ENV === 'production', // Only send cookies over HTTPS in production
            };
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, cookieOptions);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  url.pathname = "/";

  if (!user && !request.nextUrl.pathname.startsWith("/"))
    return NextResponse.redirect(url);

  if (!user) return supabaseResponse;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data?.banned_at) {
    await supabase.auth.signOut();
    url.searchParams.set("error", "banned");
    return NextResponse.redirect(url);
  }

  if (
    data?.deactivated_at &&
    !request.nextUrl.pathname.startsWith("/reactivate") &&
    !request.nextUrl.pathname.startsWith("/api/trpc/users.reactivate")
  ) {
    url.pathname = "/reactivate";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}