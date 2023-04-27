import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/app-beta";
import {
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs/app-beta/client";

import { api } from "~/api/server";
import ClientFetch from "./client-fetch";

export const metadata: Metadata = {
  title: "CvSU.me - Social Media for Cavite State University",
  description: "Social Media for Cavite State University",
};

export default async function Page() {
  const serverFetchMessage = await api.auth.getMessageFromServer.fetch();

  const user = await currentUser();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#476930] text-white">
      <p className="text-2xl font-bold">Under Maintenance</p>
      <p>Server Fetch Message: {serverFetchMessage}</p>
      <ClientFetch />
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <p>User: {user?.firstName}</p>
    </div>
  );
}
