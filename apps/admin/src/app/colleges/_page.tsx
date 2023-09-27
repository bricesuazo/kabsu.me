"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

// import College from "./campus";

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
  const getAllCollegesQuery = api.admin.getAllColleges.useQuery(undefined, {
    initialData: campuses,
  });
  const addCollegeMutation = api.admin.addCollege.useMutation({
    onSuccess: async () => {
      await getAllCollegesQuery.refetch();
      setOpenAddDialog(false);
    },
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (addCollegeMutation.error) {
      form.setError("name", {
        message: addCollegeMutation.error.message,
      });
    }
  }, [addCollegeMutation.error, form]);

  useEffect(() => {
    if (openAddDialog) {
      form.reset();
    }
  }, [openAddDialog]);

  return (
    <>
      {getAllCollegesQuery.data.map((campus) => (
        <Accordion
          type="single"
          collapsible
          key={campus.id}
          className="space-y-2"
        >
          <AccordionItem value={campus.id}>
            <div className="flex items-center gap-x-2">
              <AccordionTrigger className="flex-1">
                {campus.name}
              </AccordionTrigger>
              <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                <DialogTrigger asChild>
                  <Button>Add</Button>
                </DialogTrigger>
                <DialogContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((values) => {
                        addCollegeMutation.mutate({
                          ...values,
                          campus_id: campus.id,
                        });
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
                                placeholder="College of Engineering and Information Technology"
                                disabled={addCollegeMutation.isLoading}
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
                                placeholder="CEIT"
                                disabled={addCollegeMutation.isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="submit">
                          {addCollegeMutation.isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Confirm
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <AccordionContent>
              <Campus campus={campus} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
}
