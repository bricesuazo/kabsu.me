import Image from "next/image";
import Link from "next/link";

export default function AdventuraLayout({ children }: React.PropsWithChildren) {
  return (
    <main className="container">
      <header className="grid place-items-center p-4">
        <Link href="/">
          <Image src="/logo.svg" priority alt="" width={40} height={40} />
        </Link>
      </header>
      {children}
    </main>
  );
}
