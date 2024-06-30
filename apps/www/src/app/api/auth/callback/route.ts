import { NextResponse } from "next/server";

import { env } from "~/env";
import { createClient } from "~/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) return NextResponse.json({ error }, { status: 500 });

    if (
      !data.user.email?.endsWith("@cvsu.edu.ph") &&
      data.user.email !== env.SUPERADMIN_EMAIL
    ) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}?error=AccessDenied`);
    } else if (
      env.ENV === "staging" &&
      !env.STAGING_TEST_EMAILS?.split(", ").includes(data.user.email)
    ) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}?error=StagingAccessDenied`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/api/auth/auth-code-error`);
}
