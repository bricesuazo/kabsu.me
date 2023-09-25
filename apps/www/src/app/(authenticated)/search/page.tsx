"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import VerifiedBadge from "@/components/verified-badge";
import { api } from "@/lib/trpc/client";
import { useDebouncedCallback } from "use-debounce";

export default function SearchPage() {
  const searchMutation = api.users.search.useMutation();
  const [value, setValue] = useState("");

  const debounced = useDebouncedCallback((value: string) => {
    setValue(value);
  }, 500);

  useEffect(() => {
    if (value !== "") {
      searchMutation.mutate({ query: value });
    } else {
      searchMutation.reset();
    }
  }, [value]);
  return (
    <div className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-x-2">
          {/* <SearchIcon className="w-5" /> */}
          <Input
            className="h-10 flex-1 rounded-full"
            placeholder="Search"
            onChange={(e) =>
              e.target.value === "" ? setValue("") : debounced(e.target.value)
            }
          />
        </div>

        <div className="flex max-h-80 flex-col gap-4">
          {searchMutation.isLoading ? (
            <div className="flex flex-col gap-y-1">
              {[...(Array(8) as undefined[])].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !searchMutation.data ? (
            <p className="my-4 text-center text-sm text-muted-foreground">
              Search result will appear here
            </p>
          ) : !searchMutation.data.length ? (
            <p className="my-4 text-center text-sm">
              {searchMutation.data.length} results found
            </p>
          ) : (
            <div className="flex flex-col gap-y-1">
              {searchMutation.data.map((user) => (
                <Link
                  href={`/${user.username}`}
                  key={user.id}
                  className="flex gap-x-2 rounded p-3 hover:bg-primary-foreground"
                >
                  <div className="min-w-max">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt=""
                        width={40}
                        height={40}
                        className="aspect-square rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                        alt=""
                        width={40}
                        height={40}
                        className="aspect-square rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-x-1">
                      <p className="line-clamp-1 flex-1">
                        {user.firstName} {user.lastName}{" "}
                      </p>
                      {user.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
