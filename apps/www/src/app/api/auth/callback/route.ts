import { NextResponse } from "next/server";

import { createClient } from "~/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) return NextResponse.json({ error }, { status: 500 });

    if (!data.user.email?.endsWith("@cvsu.edu.ph")) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}?error=AccessDenied`);
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/api/auth/auth-code-error`);
}
