import type { Metadata } from "next";

import { createClient } from "@kabsu.me/supabase/client/server";

import HomeProtected from "~/components/home-protected";
import HomePublic from "~/components/home-public";
import OnboardingForm from "~/components/onboarding-form";
import { api } from "~/lib/trpc/server";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    title: user
      ? "Home - Kabsu.me"
      : "Welcome! - Kabsu.me | Social Media for Cavite State University",
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: "all" | "campus" | "program" | "college";
    callback_url?: string;
    error?: string;
    status?: string;
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const { tab, error, status } = await searchParams;
  const [getCurrentUserPublic, getCurrentSession] = await Promise.all([
    api.auth.getCurrentUserPublic(),
    api.auth.getCurrentSession(),
  ]);

  return (
    <>
      {!getCurrentUserPublic && getCurrentSession ? (
        <main className="container px-0">
          <OnboardingForm user={getCurrentSession.user} />
        </main>
      ) : getCurrentUserPublic ? (
        <main className="container px-0">
          <HomeProtected tab={tab} />
        </main>
      ) : (
        <HomePublic error={error} status={status} />
      )}
    </>
  );
}
