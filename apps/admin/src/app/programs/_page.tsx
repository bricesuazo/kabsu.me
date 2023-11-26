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

import Program from "./program";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "slug must be at least 2 characters.",
  }),
});

export default function ProgramsPageWrapper({
  campuses,
}: {
  campuses: RouterOutput["admin"]["getAllPrograms"];
}) {
  const getAllProgramsQuery = api.admin.getAllPrograms.useQuery(undefined, {
    initialData: campuses,
  });
  const addProgramMutation = api.admin.addProgram.useMutation({
    onSuccess: async () => {
      await getAllProgramsQuery.refetch();
      setOpenAddDialog(false);
    },
  });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (addProgramMutation.error) {
      form.setError("name", {
        message: addProgramMutation.error.message,
      });
    }
  }, [addProgramMutation.error, form]);

  useEffect(() => {
    if (openAddDialog) {
      form.reset();
    }
  }, [openAddDialog]);

  return (
    <>
      {getAllProgramsQuery.data.map((campus) => (
        <Accordion
          type="single"
          collapsible
          key={campus.id}
          className="space-y-2"
        >
          <AccordionItem value={campus.id}>
            <AccordionTrigger className="flex-1">
              {campus.name} ({campus.slug.toUpperCase()}) - (
              {campus.colleges.length})
            </AccordionTrigger>

            <AccordionContent>
              {campus.colleges.length === 0 ? (
                <p>No college yet</p>
              ) : (
                <Accordion type="single" collapsible className="mx-4 space-y-2">
                  {campus.colleges.map((college) => (
                    <AccordionItem key={college.id} value={college.id}>
                      <AccordionTrigger className="flex-1">
                        {college.name} ({college.slug.toUpperCase()}) - (
                        {college.programs.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <Dialog
                          open={openAddDialog}
                          onOpenChange={setOpenAddDialog}
                        >
                          <DialogTrigger asChild>
                            <Button>Add</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <Form {...form}>
                              <form
                                onSubmit={form.handleSubmit((values) => {
                                  addProgramMutation.mutate({
                                    ...values,
                                    college_id: college.id,
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
                                          placeholder="Bachelor of Science in Computer Science"
                                          disabled={
                                            addProgramMutation.isPending
                                          }
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
                                          placeholder="BSCS"
                                          disabled={
                                            addProgramMutation.isPending
                                          }
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <DialogFooter>
                                  <Button type="submit">
                                    {addProgramMutation.isPending && (
                                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Confirm
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>

                        {college.programs.map((program) => (
                          <Program key={program.id} program={program} />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
}
