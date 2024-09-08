import Link from "next/link";
import { ChevronRight, VenetianMaskIcon } from "lucide-react";

import { Button } from "@kabsu.me/ui/button";
import { BackgroundGradient } from "@kabsu.me/ui/magicui/background-gradient";

import { env } from "~/env";

export default function NGLPanel() {
  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center md:w-2/3">
      <p className="px-2 pb-4 text-center text-2xl font-bold text-primary md:text-3xl">
        Share and receive anonymous messages, express freely, and connect like
        never before!
      </p>
      <div className="flex w-full max-w-[500px] flex-col items-center rounded-lg border py-8 text-primary dark:bg-black">
        <h1 className="mx-auto flex items-center justify-center text-4xl font-bold">
          <VenetianMaskIcon className="mr-2 size-12" /> NGL
        </h1>
        <BackgroundGradient className="mt-4 w-full rounded-2xl bg-gradient-to-br from-[#43d879] to-primary px-20 py-8 font-bold">
          <h4 className="text-balance pb-4 text-center font-semibold text-white">
            Send us an anonymous messages!
          </h4>
          <Button
            className="w-full rounded-full !bg-white text-primary"
            asChild
          >
            <Link
              href={env.NEXT_PUBLIC_NGL_URL + "/kabsu.me"}
              target="_blank"
              className="group/ngl"
            >
              Visit our NGL page
              <ChevronRight className="ml-0 size-5 opacity-50 transition-all group-hover/ngl:ml-1 group-hover/ngl:opacity-100" />
            </Link>
          </Button>
        </BackgroundGradient>
      </div>
    </div>
  );
}
