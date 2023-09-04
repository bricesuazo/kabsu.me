import { Skeleton } from "./ui/skeleton";

export default function PostSkeleton() {
  return (
    <div className="animate-pulse space-y-2 border p-4">
      <div className="flex gap-x-2">
        <Skeleton className="h-10 w-10 rounded-full" />

        <div className="flex-1">
          <div className="flex items-center gap-x-2">
            <Skeleton
              className="h-4"
              style={{
                //   random width in percentage between 25% and 75%
                width: `${Math.floor(Math.random() * 20 + 25)}%`,
              }}
            />
            <p className="pointer-events-none animate-pulse select-none text-muted">
              ·
            </p>
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton
            className="h-3"
            style={{
              width: `${Math.floor(Math.random() * 15 + 15)}%`,
            }}
          />
        </div>
      </div>
      <div className="space-y-1">
        {[...Array(Math.floor(Math.random() * 3))].map((_, i) => (
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
    </div>
  );
}
