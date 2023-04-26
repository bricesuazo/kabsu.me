import type { Metadata } from "next";

import { api } from "~/api/server";

export const metadata: Metadata = {
  title: "CvSU.me - Social Media for Cavite State University",
  description: "Social Media for Cavite State University",
};

export default async function Page() {
  const data = await api.auth.getMessageFromServer.fetch();
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#476930]">
      <p className="text-2xl font-bold text-white">Under Maintenance</p>
      Message: {data}
    </div>
  );
}
