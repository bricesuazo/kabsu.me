"use client";

// import { api } from "@/lib/trpc/client";
import type { RouterOutput } from "@cvsu.me/api/root";

export default function Campus({
  campus,
}: {
  campus: RouterOutput["admin"]["getAllCampuses"][number];
}) {
  console.log("🚀 ~ file: campus.tsx:12 ~ campus:", campus);
  //   const context = api.useContext();
  //   //   const deleteCampusMutation = api.admin.deleteCampus.useMutation({
  //   //     onSuccess: async () => {
  //   //       await context.admin.getAllCampuses.invalidate();
  //   //     },
  //   //   });
  return <div>campus</div>;
}
