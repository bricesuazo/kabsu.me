"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { RouterOutput } from "@cvsu.me/api/root";

// import College from "./college";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "slug must be at least 2 characters.",
  }),
});

export default function CollegesPageWrapper({
  campuses,
}: {
  campuses: RouterOutput["admin"]["getAllColleges"];
}) {
  const getAllCollegesMutation = api.admin.getAllColleges.useQuery(undefined, {
    initialData: campuses,
  });
  const addCampusMutation = api.admin.addCampus.useMutation({
    onSuccess: async () => {
      await getAllCollegesMutation.refetch();
      setOpenAddDialog(false);
    },
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (addCampusMutation.error) {
      form.setError("name", {
        message: addCampusMutation.error.message,
      });
    }
  }, [addCampusMutation.error, form]);

  useEffect(() => {
    if (openAddDialog) {
      form.reset();
    }
  }, [openAddDialog]);

  return (
    <div className="space-y-2">
      {getAllCollegesMutation.data.map((campus) => (
        <div key={campus.id}>
          <p>{campus.name}</p>
        </div>
      ))}
    </div>
  );
}
