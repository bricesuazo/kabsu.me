import { Skeleton } from "./ui/skeleton";

export default function UserFollowsSkeleton() {
  return (
    <div className="flex items-center gap-x-2 rounded border border-transparent p-2 hover:border-inherit">
      <Skeleton className="h-10 w-10 rounded-full" />

      <div className="flex flex-1 justify-between">
        <div className="my-1 flex-1 space-y-2">
          <Skeleton className="xs:w-40 h-4 w-1/2" />
          <Skeleton className="xs:w-64 h-3 w-4/6" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
