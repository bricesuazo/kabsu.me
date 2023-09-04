import { Icons } from "@/components/icons";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="container grid h-full place-items-center">
      <div className="flex flex-col items-center justify-center gap-y-4">
        <Image
          src="/logo.png"
          alt="Logo"
          width={80}
          height={80}
          className="object-cover"
        />
        <div className="flex items-center gap-x-2">
          <Icons.spinner className="mr-2 animate-spin" />
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
}
