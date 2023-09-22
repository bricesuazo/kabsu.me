import UserFollowsSkeleton from "@/components/user-follows-skeleton";

export default function FollowingLoading() {
  return (
    <div>
      <p className="text-center text-sm text-muted-foreground">Following</p>

      {[...(Array(10) as number[])].map((_, i) => (
        <UserFollowsSkeleton key={i} />
      ))}
    </div>
  );
}
