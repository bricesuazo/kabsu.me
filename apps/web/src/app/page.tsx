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
    <main className="grid h-56 place-items-center">
      <p className="text-2xl font-bold">Under Maintenance</p>
    </main>
  );
}
