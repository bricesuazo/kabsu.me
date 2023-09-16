import { Skeleton } from "@/components/ui/skeleton";

export default function PostLoading() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="flex gap-x-2">
          <div className="w-max">
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="group flex items-center gap-x-2">
              <Skeleton className="h-4 w-36" />
              <div className="flex items-center gap-x-1">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-12 rounded-full bg-primary" />
                <Skeleton className="h-5 w-12 rounded-full border" />
              </div>
              <Skeleton className="h-1 w-1" />
              <div className="hidden sm:block">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
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

      <div className="flex gap-x-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 flex-1 border bg-transparent" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* <PostComment userId={userId} post={post} data-superjson />

      <div className="">
        {post.comments.map((comment) => (
          <Suspense key={comment.id}>
            <CommentComponent comment={comment} />
          </Suspense>
        ))}
      </div> */}
    </div>
  );
}
