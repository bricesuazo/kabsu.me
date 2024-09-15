import { Separator } from "@kabsu.me/ui/separator";
import { Skeleton } from "@kabsu.me/ui/skeleton";

export default function PostLoading() {
  return (
    <>
      <div className="space-y-2 p-4">
        <div className="flex justify-between">
          <div className="flex gap-x-2">
            <div className="w-max">
              <Skeleton className="size-14 rounded-full" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="group flex items-center gap-x-1">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="size-1" />

                <Skeleton className="h-3 w-10" />
              </div>
              <div className="flex items-center gap-x-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-12 rounded-full bg-primary" />
                <Skeleton className="h-5 w-12 rounded-full border" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {[...(Array(2) as number[])].map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-x-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>

          <div className="flex items-center gap-x-4">
            <div className="flex items-center gap-x-1">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-1 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <Separator orientation="horizontal" />

      <div className="container fixed bottom-0 flex gap-x-2 p-4">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-[38px] flex-1 border bg-transparent" />
        <Skeleton className="h-9 w-24" />
      </div>
    </>
  );
}
