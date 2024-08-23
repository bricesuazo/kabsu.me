import Image from "next/image";

import { ToggleTheme } from "../components/toggle-theme";

export default function Home() {
  return (
    <div className="grid h-full place-items-center">
      <div className="grid place-items-center gap-1">
        <Image src="/logo.svg" alt="Logo" width={80} height={80} />
        <h2 className="text-2xl font-semibold">NGL - Kabsu.me</h2>
        <ToggleTheme />
      </div>
    </div>
  );
}
