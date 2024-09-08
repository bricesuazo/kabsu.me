import React from "react";
import Link from "next/link";
import { VenetianMaskIcon } from "lucide-react";

import { Button } from "@kabsu.me/ui/button";
import { BackgroundGradient } from "@kabsu.me/ui/magicui/background-gradient";

const ngl = () => {
  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center md:w-2/3">
      <p className="px-2 pb-4 text-center text-2xl font-bold text-primary md:text-3xl">
        Share and recieve anonymous messages, express freely, and connect like
        never before!
      </p>
      <div className="flex w-full max-w-[500px] flex-col items-center rounded-lg border py-8 text-primary dark:bg-black">
        <h1 className="mx-auto flex items-center justify-center text-4xl font-bold">
          <VenetianMaskIcon className="mr-2 size-12" /> NGL
        </h1>
        <BackgroundGradient className="mt-4 w-full rounded-[22px] bg-gradient-to-br from-[#2FAB5C] to-[#FFFFFF] px-20 py-8 font-bold">
          <h2 className="pb-4 text-center font-semibold text-white">
            Send us an anonymous <br /> messages!
          </h2>
          {/* update the link to the actual link */}
          <Link href="https://github.com/" target="_blank">
            <Button className="w-full rounded-full bg-gradient-to-r from-[#35BD66] via-[#3CC870] to-[#FEFAFA] text-lg text-black">
              Hello
            </Button>
          </Link>
        </BackgroundGradient>
      </div>
    </div>
  );
};

export default ngl;
