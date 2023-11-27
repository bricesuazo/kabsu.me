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

export default function Campus({
  campus,
}: {
  campus: RouterOutput["admin"]["getAllCampuses"][number];
}) {
  const context = api.useContext();
  const [openDelete, setopenDelete] = useState(false);
  const [openEdit, setopenEdit] = useState(false);
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
      name: campus.name,
      slug: campus.slug,
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
      form.setValue("name", campus.name);
      form.setValue("slug", campus.slug);
    }
  }, [openEdit, campus]);

  return (
    <div className="flex items-center justify-between rounded border p-4">
      <p>
        {campus.name} ({campus.slug.toUpperCase()})
      </p>

      <div className="flex items-center gap-x-2">
        <Dialog open={openEdit} onOpenChange={setopenEdit}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-8 w-8">
              <Pencil size="1rem" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {campus.name}</DialogTitle>
              <DialogDescription>
                Update the name and slug of this campus.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => {
                  editCampusMutation.mutate({
                    campus_id: campus.id,
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
                          disabled={editCampusMutation.isPending}
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
                          disabled={editCampusMutation.isPending}
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
                    editCampusMutation.isPending || !form.formState.isDirty
                  }
                >
                  {editCampusMutation.isPending && (
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
            <Button size="icon" className="h-8 w-8">
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
                disabled={deleteCampusMutation.isPending}
                onClick={() =>
                  deleteCampusMutation.mutate({ campus_id: campus.id })
                }
              >
                {deleteCampusMutation.isPending && (
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
