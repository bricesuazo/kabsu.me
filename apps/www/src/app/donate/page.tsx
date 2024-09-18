import React from "react";
import Image from "next/image";

import { Separator } from "@kabsu.me/ui/separator";

export default function DonatePage() {
  return (
    <main>
      <div className="w-full">
        <Image
          src="/donate-header.webp"
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
          <div className="mx-auto max-w-xs">
            <Image
              src="/donate_qr.jpg"
              alt=""
              width="1000"
              height="1000"
              className="pointer-events-none aspect-square w-full select-none object-contain"
            />
          </div>
          <div className="text-center text-2xl font-bold md:text-3xl">
            <p>BR●●● BR●●● S.</p>
            <p>090● ●●●●421</p>
          </div>
          <div className="h-64" />
        </div>
      </div>
    </main>
  );
}
