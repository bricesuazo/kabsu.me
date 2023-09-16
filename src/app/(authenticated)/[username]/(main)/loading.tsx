import PostSkeleton from "@/components/post-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex w-full flex-col-reverse gap-x-8 gap-y-4 xs:flex-row">
          <div className="flex-1 space-y-2 xs:w-px">
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-5 w-14 rounded-full bg-primary" />
              <Skeleton className="h-5 w-14 rounded-full border bg-transparent" />
              <Skeleton className="h-5 w-14 rounded-full border bg-transparent" />
            </div>

            <div className="flex flex-col">
              <Skeleton className="h-10 w-60" />

              <Skeleton className="mt-1 h-5 w-full xs:w-80" />
            </div>
          </div>

          <div className="min-w-max">
            <Skeleton className="h-[100px] w-[100px] rounded-full" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-9 w-32" />
          </div>

          <div className="flex items-center gap-x-4">
            <Skeleton className="h-4 w-20" />
            <p className="pointer-events-none select-none">·</p>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <div className="">
        {[...Array(6)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
