"use client";

import { POST_TYPE_TABS } from "@/lib/constants";
import { TabsList, Tabs, TabsTrigger, TabsContent } from "./ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

export default function PostTypeTab() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <Tabs
      defaultValue={searchParams.get("tab") ?? POST_TYPE_TABS[2].id}
      onValueChange={(value) =>
        router.push(value !== "following" ? `/?tab=${value}` : "/")
      }
    >
      <TabsList>
        {POST_TYPE_TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
