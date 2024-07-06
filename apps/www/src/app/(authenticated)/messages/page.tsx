"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function MessagesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <div className="p-4">
      <Tabs
        defaultValue={searchParams.get("type") ?? ""}
        onValueChange={(value) => {
          if (value === "") {
            router.push("/messages");
          } else {
            router.push(pathname + "?" + createQueryString("type", value));
          }
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="campus" className="flex-1">
            Campus
          </TabsTrigger>
          <TabsTrigger value="college" className="flex-1">
            College
          </TabsTrigger>
          <TabsTrigger value="program" className="flex-1">
            Program
          </TabsTrigger>
          <TabsTrigger value="" className="flex-1">
            My Messages
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">All</TabsContent>
        <TabsContent value="campus">Campus</TabsContent>
        <TabsContent value="college">College</TabsContent>
        <TabsContent value="program">Program</TabsContent>
        <TabsContent value="" className="space-y-2">
          <Input placeholder="Search" className="rounded-full" />

          <ScrollArea viewportClassName="h-96">
            <div className="flex flex-col">
              {Array.from({ length: 20 }).map((_, index) => (
                <Link
                  key={index}
                  href={`/messages/${index}`}
                  className="flex cursor-pointer gap-2 rounded-md px-4 py-2 hover:bg-muted"
                >
                  <div>
                    <Image
                      src="/default-avatar.jpg"
                      width={28}
                      height={28}
                      alt="Profile picture"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm">Brice Suazo</p>
                    <p className="text-sm text-muted-foreground">
                      Test message - 4 hours ago
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
