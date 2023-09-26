"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { AlertCircle, Pencil, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { RouterOutput } from "@cvsu.me/api/root";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "slug must be at least 2 characters.",
  }),
});

export default function College({
  college,
}: {
  college: RouterOutput["admin"]["getAllColleges"][number];
}) {
  const [openDelete, setopenDelete] = useState(false);
  const [openEdit, setopenEdit] = useState(false);
  const context = api.useContext();
  const editCampusMutation = api.admin.editCampus.useMutation({
    onSuccess: async () => {
      await context.admin.getAllCampuses.invalidate();
      setopenEdit(false);
    },
  });
  const deleteCampusMutation = api.admin.deleteCampus.useMutation({
    onSuccess: async () => {
      await context.admin.getAllCampuses.invalidate();
      setopenDelete(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: college.name,
      slug: college.slug,
    },
  });

  useEffect(() => {
    if (editCampusMutation.error) {
      form.setError("name", {
        message: editCampusMutation.error.message,
      });
    }
  }, [editCampusMutation.error, form]);

  useEffect(() => {
    if (openEdit) {
      // TODO: fix this
      form.reset();
      form.setValue("name", college.name);
      form.setValue("slug", college.slug);
    }
  }, [openEdit, college]);

  return (
    <div className="flex items-center justify-between rounded border p-4">
      <p>
        {college.name} ({college.slug})
      </p>

      <div className="flex items-center gap-x-2">
        <Dialog open={openEdit} onOpenChange={setopenEdit}>
          <DialogTrigger asChild>
            <Button size="icon">
              <Pencil size="1rem" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {college.name}</DialogTitle>
              <DialogDescription>
                Update the name and slug of this college.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => {
                  editCampusMutation.mutate({
                    campus_id: college.id,
                    name: values.name,
                    slug: values.slug,
                  });
                })}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Main Campus"
                          disabled={editCampusMutation.isLoading}
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
                          disabled={editCampusMutation.isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={
                    editCampusMutation.isLoading || !form.formState.isDirty
                  }
                >
                  {editCampusMutation.isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={openDelete} onOpenChange={setopenDelete}>
          <AlertDialogTrigger asChild>
            <Button size="icon">
              <Trash size="1rem" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteCampusMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {deleteCampusMutation.error.message}
                </AlertDescription>
              </Alert>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={deleteCampusMutation.isLoading}
                onClick={() =>
                  deleteCampusMutation.mutate({ campus_id: college.id })
                }
              >
                {deleteCampusMutation.isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
