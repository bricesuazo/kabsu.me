import UserFollowsSkeleton from "~/components/user-follows-skeleton";

export default function FollowersLoading() {
  return (
    <div>
      <p className="text-center text-sm text-muted-foreground">Followers</p>

      {[...(Array(10) as number[])].map((_, i) => (
        <UserFollowsSkeleton key={i} />
      ))}
    </div>
  );
}
