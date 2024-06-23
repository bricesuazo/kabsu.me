import type { Metadata } from "next";

import HomeProtected from "~/components/home-protected";
import HomePublic from "~/components/home-public";
import OnboardingForm from "~/components/onboarding-form";
import { api } from "~/lib/trpc/server";
import { createClient } from "~/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    title: session
      ? "Home - Kabsu.me"
      : "Welcome! - Kabsu.me | Social Media for Cavite State University",
  };
}

export default async function Home({
  searchParams: { tab, error },
}: {
  searchParams: {
    tab?: "all" | "campus" | "program" | "college";
    callback_url?: string;
    error?: string;
    [key: string]: string | string[] | undefined;
  };
}) {
  const [getCurrentUserPublic, getCurrentSession] = await Promise.all([
    api.auth.getCurrentUserPublic.query(),
    api.auth.getCurrentSession.query(),
  ]);

  return (
    <main className="container px-0">
      {!getCurrentUserPublic && getCurrentSession ? (
        <OnboardingForm session={getCurrentSession.session} />
      ) : getCurrentUserPublic ? (
        <HomeProtected tab={tab} />
      ) : (
        <HomePublic error={error} />
      )}
    </main>
  );
}
