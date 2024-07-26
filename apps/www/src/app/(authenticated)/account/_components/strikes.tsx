"use client";

import { format } from "date-fns";
import { Check, X } from "lucide-react";

import type { RouterOutputs } from "@kabsu.me/api";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { api } from "~/lib/trpc/client";

export default function Strikes({
  getMyStrikes,
}: {
  getMyStrikes: RouterOutputs["users"]["getMyStrikes"];
}) {
  const getMyStrikesQuery = api.users.getMyStrikes.useQuery(undefined, {
    initialData: getMyStrikes,
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-3xl font-semibold">
          {getMyStrikesQuery.data.length}/3
        </h2>
        <h4 className="text-lg">Strikes</h4>

        <p className="text-balance text-sm text-muted-foreground">
          Once you reach 3 strikes, you will be banned from the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xs:grid-cols-3">
        <Strike strike={getMyStrikesQuery.data[0]} />
        <Strike strike={getMyStrikesQuery.data[1]} />
        <Strike strike={getMyStrikesQuery.data[2]} />
      </div>
    </div>
  );
}

function Strike({
  strike,
}: {
  strike?: RouterOutputs["users"]["getMyStrikes"][number];
}) {
  return (
    <Card>
      {strike && (
        <CardHeader className="items-center">
          <div className="rounded-full bg-destructive p-2 text-white">
            <X />
          </div>
        </CardHeader>
      )}
      {strike ? (
        <>
          <CardContent>
            <p className="text-sm text-muted-foreground">Reason:</p>
            <h4>
              {strike.reason
                ? strike.reason
                : "No reason provided by the admin."}
            </h4>
          </CardContent>
          <CardFooter className="flex justify-between text-xs text-muted-foreground">
            {format(strike.created_at, "PPpp")}
          </CardFooter>
        </>
      ) : (
        <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-full bg-primary p-2 text-white">
            <Check />
          </div>
          <h4>No strikes</h4>
        </CardContent>
      )}
    </Card>
  );
}
