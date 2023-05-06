import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CvSU.me - Social Media for Cavite State University",
  description: "Social Media for Cavite State University",
  openGraph: {
    title: "CvSU.me - Social Media for Cavite State University",
    description: "Social Media for Cavite State University",
  },
};

export default function Page() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#476930] text-white">
      <p className="text-2xl font-bold">Under Maintenance</p>
    </div>
  );
}
