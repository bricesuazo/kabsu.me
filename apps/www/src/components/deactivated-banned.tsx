export default function DeactivatedBanned({
  type,
}: {
  type: "deactivated" | "banned";
}) {
  return (
    <div className="space-y-10 p-10">
      <h2 className="text-center text-2xl font-semibold">
        Account {type === "deactivated" ? "Deactivated" : "Banned"}
      </h2>

      <p className="text-balance text-center text-muted-foreground">
        This account has been{" "}
        {type === "deactivated" ? "deactivated" : "banned"}. If you think this
        is a mistake, please contact support.
      </p>
    </div>
  );
}
