"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { RouterOutput } from "@cvsu.me/api/root";

import Campus from "./campus";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "slug must be at least 2 characters.",
  }),
});

export default function CampusPageWrapper({
  campuses,
}: {
  campuses: RouterOutput["admin"]["getAllCampuses"];
}) {
  const getAllCampusesMutation = api.admin.getAllCampuses.useQuery(undefined, {
    initialData: campuses,
  });
  const addCampusMutation = api.admin.addCampus.useMutation({
    onSuccess: async () => {
      await getAllCampusesMutation.refetch();
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
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogTrigger asChild>
          <Button>Add</Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                addCampusMutation.mutate(values);
              })}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Add campus</DialogTitle>
              </DialogHeader>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Main Campus"
                        disabled={addCampusMutation.isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acronym</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MAIN"
                        disabled={addCampusMutation.isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  {addCampusMutation.isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {getAllCampusesMutation.data.map((campus) => (
        <Campus campus={campus} />
      ))}
    </div>
  );
}
