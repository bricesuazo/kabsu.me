import Image from "next/image";

import { Icons } from "~/components/icons";

export default function Loading() {
  return (
    <div className="container grid h-full place-items-center">
      <div className="flex flex-col items-center justify-center gap-y-4">
        <Image src="/logo.webp" alt="Logo" priority width={128} height={128} />

        <div className="flex items-center gap-x-2">
          <Icons.spinner className="mr-2 animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
}
