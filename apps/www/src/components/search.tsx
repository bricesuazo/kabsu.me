"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { api } from "~/lib/trpc/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import VerifiedBadge from "./verified-badge";

export default function Search() {
  const searchMutation = api.users.search.useMutation();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const debounced = useDebouncedCallback((value: string) => {
    setValue(value);
  }, 500);

  useEffect(() => {
    if (value !== "") {
      searchMutation.mutate({ query: value });
    } else {
      searchMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (open) {
      setValue("");
      searchMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full">
          <SearchIcon size="1rem" className="" />
        </Button>
      </PopoverTrigger>
      <PopoverContent asChild>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-x-2">
            <Input
              className="h-10 flex-1 rounded-full"
              placeholder="Search"
              onChange={(e) =>
                e.target.value === "" ? setValue("") : debounced(e.target.value)
              }
            />
          </div>

          <ScrollArea className="flex max-h-80 flex-col gap-4">
            {searchMutation.isPending ? (
              <div className="flex flex-col gap-y-1">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
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
                    key={user.id}
                    href={`/${user.username}`}
                    className="flex gap-x-2 rounded p-3 hover:bg-primary-foreground"
                    onClick={() => setOpen(false)}
                  >
                    <div className="min-w-max">
                      <Image
                        src={
                          user.image_name
                            ? user.image_url
                            : "/default-avatar.jpg"
                        }
                        alt=""
                        width={40}
                        height={40}
                        className="aspect-square rounded-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-x-1">
                        <p className="line-clamp-1 flex-1">{user.name} </p>
                        {user.is_verified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
