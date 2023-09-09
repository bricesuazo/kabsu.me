"use client";

import { POST_TYPE_TABS } from "@/lib/constants";
import { TabsList, Tabs, TabsTrigger, TabsContent } from "./ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Component, School, School2, UserCheck2, Users2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function PostTypeTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState(
    searchParams.get("tab") ?? POST_TYPE_TABS[4].id,
  );

  useEffect(() => {
    setTab(searchParams.get("tab") ?? POST_TYPE_TABS[4].id);
  }, [searchParams]);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setTab(value);
        router.push(value !== "following" ? `/?tab=${value}` : "/");
      }}
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
                  case "campus":
                    return <School2 size="1.25rem" />;
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
