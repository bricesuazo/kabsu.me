import React from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function DonatePage() {
  return (
    <main>
      <div className="w-full">
        <Image
          src="/donate-header.png"
          alt=""
          width="1000"
          height="1000"
          className="pointer-events-none w-full select-none object-contain"
        />
      </div>
      <div className="space-y-4 p-6 text-muted-foreground">
        <h1 className="text-center text-4xl font-bold text-primary md:text-7xl">
          DONATE NOW!
        </h1>
        <p className="mx-auto max-w-prose text-center">
          Support the evolution of kabsu.me, your unofficial social media for
          Cavite State University, by contributing to our Website Development
          Fund!
        </p>
        <p className="mx-auto max-w-prose text-center">
          Enhance user experience, maintainance, and content expansion. Every
          donation, big or small, shapes the future of our platform.
        </p>
        <p className="mx-auto max-w-prose text-center">
          Thank you for your invaluable support!
        </p>

        <Separator />

        <div className="space-y-4 text-primary">
          <p className="text-center text-white">
            If you are interested, donate on the GCash Account below:
          </p>
          <div className="text-center text-5xl font-bold">
            <p>+639 905 255 8421</p>
            <p>BR*** SU***</p>
          </div>
        </div>
      </div>
    </main>
  );
}
