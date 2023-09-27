"use client";

import { api } from "@/lib/trpc/client";

import type { RouterOutput } from "@cvsu.me/api/root";

import College from "./college";

export default function Campus({
  campus,
}: {
  campus: RouterOutput["admin"]["getAllCampuses"][number];
}) {
  const getCampusQuery = api.admin.getCampus.useQuery({ campus_id: campus.id });

  return (
    <>
      {getCampusQuery.data?.colleges.length === 0 ? (
        <p>No colleges found.</p>
      ) : (
        getCampusQuery.data?.colleges.map((college) => (
          <College key={college.id} college={college} />
        ))
      )}
    </>
  );
}
