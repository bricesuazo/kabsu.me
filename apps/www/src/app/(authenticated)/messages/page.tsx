"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "~/components/ui/input";
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
        <TabsContent value="">
          <Input placeholder="Search" className="rounded-full" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
