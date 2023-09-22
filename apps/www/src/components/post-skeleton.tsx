import { Skeleton } from "./ui/skeleton";

export function PostSkeletonNoRandom() {
  return (
    <div className="animate-pulse space-y-4 border p-4">
      <div className="flex gap-x-2">
        <div className="w-max">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="hidden h-1 w-1 sm:block" />
            <Skeleton className="hidden h-3 w-32 sm:block" />
          </div>
          <Skeleton className="mt-2 h-3" />
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

        <div className="flex items-center gap-x-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-1 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
export default function PostSkeleton() {
  return (
    <div className="animate-pulse space-y-4 border p-4">
      <div className="flex gap-x-2">
        <div className="w-max">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-x-2">
            <Skeleton
              className="h-4"
              style={{
                //   random width in percentage between 25% and 75%
                width: `${Math.floor(Math.random() * 20 + 25)}%`,
              }}
            />
            <Skeleton className="hidden h-1 w-1 sm:block" />
            <Skeleton className="hidden h-3 w-32 sm:block" />
          </div>
          <Skeleton
            className="mt-2 h-3"
            style={{
              width: `${Math.floor(Math.random() * 15 + 15)}%`,
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        {[...(Array(Math.floor(Math.random() * 3)) as number[])].map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
        <Skeleton
          className="h-4"
          style={{
            //   random width in percentage between 25% and 100%
            width: `${Math.floor(Math.random() * 75 + 25)}%`,
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-x-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>

        <div className="flex items-center gap-x-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-1 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
