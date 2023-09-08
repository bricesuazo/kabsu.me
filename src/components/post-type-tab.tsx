"use client";

import { POST_TYPE_TABS } from "@/lib/constants";
import { TabsList, Tabs, TabsTrigger, TabsContent } from "./ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Component, School, UserCheck2, Users2 } from "lucide-react";

export default function PostTypeTab() {
  const searchParams = useSearchParams();
  const router = useRouter();

  return (
    <Tabs
      defaultValue={searchParams.get("tab") ?? POST_TYPE_TABS[3].id}
      onValueChange={(value) =>
        router.push(value !== "following" ? `/?tab=${value}` : "/")
      }
    >
      <TabsList className="w-full sm:w-auto">
        {POST_TYPE_TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="w-full">
            <div className="hidden sm:block">{tab.name}</div>
            <div className="sm:hidden">
              {(() => {
                switch (tab.id) {
                  case "all":
                    return <School size="1.25rem" />;
                  case "program":
                    return <Users2 size="1.25rem" />;
                  case "college":
                    return <Component size="1.25rem" />;
                  case "following":
                    return <UserCheck2 size="1.25rem" />;
                  default:
                    return null;
                }
              })()}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
