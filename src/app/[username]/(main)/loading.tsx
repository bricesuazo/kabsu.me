import PostSkeleton from "@/components/post-skeleton";

export default function UserLoading() {
  return (
    <div>
      {[0, 1, 2, 3, 4, 5, 6].map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
