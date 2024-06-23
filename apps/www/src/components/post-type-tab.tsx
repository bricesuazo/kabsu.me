"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { POST_TYPE_TABS } from "@kabsu.me/constants";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function PostTypeTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState(
    searchParams.get("tab") ?? POST_TYPE_TABS[4]?.id,
  );

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
          setTab(value);
          router.push(value !== "following" ? `/?tab=${value}` : "/");
        }}
      >
        <TabsList className="flex h-auto w-full justify-between rounded-none bg-transparent p-0">
          {POST_TYPE_TABS.map((select) => (
            <TabsTrigger
              key={select.id}
              className="flex w-full gap-x-2 rounded-none border-b-4 border-transparent py-4 hover:text-foreground data-[state=active]:rounded-none data-[state=active]:border-b-4 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
              value={select.id}
            >
              <div className="block sm:hidden md:block">
                <select.icon size="20" />
              </div>
              <p className="hidden sm:block">{select.name}</p>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* <Select
      defaultValue={tab}
      value={tab}
      required
      onValueChange={(value) => {
        setTab(value);
        router.push(value !== "following" ? `/?tab=${value}` : "/");
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Post" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Post</SelectLabel>
          {POST_TYPE_TABS.map((tab) => (
            <SelectItem key={tab.id} value={tab.id}>
              {tab.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select> */}
    </div>
  );

  // return (
  //   <Tabs
  //     value={tab}
  //     onValueChange={(value) => {
  //       setTab(value);
  //       router.push(value !== "following" ? `/?tab=${value}` : "/");
  //     }}
  //   >
  //     <TabsList className="w-full sm:w-auto">
  //       {POST_TYPE_TABS.map((tab) => (
  //         <TabsTrigger key={tab.id} value={tab.id} className="w-full">
  //           <div className="hidden sm:block">{tab.name}</div>
  //           <div className="sm:hidden">
  //             {(() => {
  //               switch (tab.id) {
  //                 case "all":
  //                   return <School size="1.25rem" />;
  //                 case "campus":
  //                   return <School2 size="1.25rem" />;
  //                 case "program":
  //                   return <Users2 size="1.25rem" />;
  //                 case "college":
  //                   return <Component size="1.25rem" />;
  //                 case "following":
  //                   return <UserCheck2 size="1.25rem" />;
  //                 default:
  //                   return null;
  //               }
  //             })()}
  //           </div>
  //         </TabsTrigger>
  //       ))}
  //     </TabsList>
  //   </Tabs>
  // );
}
