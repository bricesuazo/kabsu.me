"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { POST_TYPE_TABS } from "@kabsu.me/constants";
import { Skeleton } from "@kabsu.me/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@kabsu.me/ui/tabs";

import { api } from "~/lib/trpc/client";

export default function PostTypeTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState(
    searchParams.get("tab") ?? POST_TYPE_TABS[4]?.id,
  );
  const getMyUniversityStatusQuery = api.auth.getMyUniversityStatus.useQuery();

  useEffect(() => {
    setTab(searchParams.get("tab") ?? POST_TYPE_TABS[4]?.id);
  }, [searchParams]);

  return (
    <div className="z-50 w-full border-b">
      <Tabs
        className="p-0"
        defaultValue={tab}
        value={tab}
        onValueChange={(value) => {
          router.push(value !== "following" ? `/?tab=${value}` : "/");
          setTab(value);
        }}
      >
        <TabsList className="flex h-auto w-full items-stretch justify-between rounded-none bg-background p-0 dark:bg-black sm:dark:bg-[#121212]">
          {POST_TYPE_TABS.map((select) => (
            <TabsTrigger
              key={select.id}
              className="flex w-full flex-col rounded-none border-b-4 border-transparent py-4 hover:text-foreground data-[state=active]:rounded-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary md:data-[state=active]:border-b-4"
              value={select.id}
              onClick={() => {
                if (
                  select.id === searchParams.get("tab") ||
                  (select.id === "following" && !searchParams.has("tab"))
                )
                  window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="flex gap-x-2">
                <div className="block sm:hidden md:block">
                  <select.icon size="20" />
                </div>

                {select.id == "all" || select.id === "following" ? (
                  <p className="hidden sm:block">{select.name}</p>
                ) : getMyUniversityStatusQuery.isLoading ? (
                  <Skeleton className="h-4 w-10" />
                ) : (
                  getMyUniversityStatusQuery.data && (
                    <p className="hidden sm:block">
                      {(() => {
                        switch (select.id) {
                          case "campus":
                            return getMyUniversityStatusQuery.data.programs?.colleges?.campuses?.slug.toUpperCase();
                          case "college":
                            return getMyUniversityStatusQuery.data.programs?.colleges?.slug.toUpperCase();
                          case "program":
                            return getMyUniversityStatusQuery.data.programs?.slug.toUpperCase();
                        }
                      })()}
                    </p>
                  )
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
