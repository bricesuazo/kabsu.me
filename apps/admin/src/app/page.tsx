import Link from "next/link";
import { ToggleTheme } from "@/components/toggle-theme";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { auth, SignIn, UserButton } from "@clerk/nextjs";

export default function Home() {
  const { userId } = auth();

  if (!userId)
    return (
      <main className="grid h-full place-items-center">
        <SignIn />
      </main>
    );

  return (
    <main className="h-full">
      <div className="flex h-full">
        <nav className="h-full w-60 space-y-8 bg-accent p-4">
          <Button variant="link" className="h-auto p-0">
            {/* <span className="hidden xs:contents">CvSU.me Admin</span> */}
            Dashboard
          </Button>
          <div className="">
            <Accordion type="single" collapsible>
              {NAVBAR.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent className="flex flex-col">
                    {item.items.map((subItem) => (
                      <Button
                        key={subItem.href}
                        asChild
                        variant="link"
                        className="w-full justify-start"
                      >
                        <Link href={subItem.href}>{subItem.title}</Link>
                      </Button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
              <Button asChild variant="link" className="w-full justify-start">
                <Link href="/campuses">Campuses</Link>
              </Button>
              <Button asChild variant="link" className="w-full justify-start">
                <Link href="/colleges">Colleges</Link>
              </Button>
              <Button asChild variant="link" className="w-full justify-start">
                <Link href="/programs">Programs</Link>
              </Button>
            </Accordion>
          </div>
        </nav>
        <div className="flex-1">
          <header className="flex flex-1 items-center justify-between p-4">
            <ToggleTheme />
            <UserButton />
          </header>
        </div>
      </div>
    </main>
  );
}

const NAVBAR = [
  {
    id: "user",
    title: "User",
    items: [
      {
        title: "Users",
        href: "/users",
      },
      {
        title: "Reported Users",
        href: "/users/reported-users",
      },
      {
        title: "Banned Users",
        href: "/users/banned-users",
      },
      {
        title: "Verified Users",
        href: "/users/verified-users",
      },
    ],
  },
  {
    id: "posts",
    title: "Post",
    items: [
      {
        title: "Posts",
        href: "/posts",
      },
      {
        title: "Reported Posts",
        href: "/posts/reported-posts",
      },
      {
        title: "Banned Posts",
        href: "/posts/banned-posts",
      },
      {
        title: "Verified Posts",
        href: "/posts/verified-posts",
      },
    ],
  },
];
