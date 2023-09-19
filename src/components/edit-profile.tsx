"use client";

import { User as UserFromDB } from "@/lib/db/schema";
import { PenSquare } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Icons } from "./icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { AlertDialogHeader } from "./ui/alert-dialog";
import { useEffect, useState } from "react";
import { User as UserFromClerk } from "@clerk/nextjs/server";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import CustomProgress from "./ui/custom-progress";
import { api } from "@/lib/trpc/client";

export default function EditProfile({
  userFromDB,
  userFromClerk,
}: {
  userFromDB: UserFromDB;
  userFromClerk: UserFromClerk;
}) {
  const updateBioMutation = api.users.updateBio.useMutation();
  const formSchema = z.object({
    bio: z.string().max(128, "Bio must be at most 128 characters long."),
    firstName: z
      .string()
      // .nonempty({ message: "First name is required." })
      .max(64, { message: "First name must be at most 64 characters long." })
      .optional(),
    lastName: z
      .string()
      // .nonempty({ message: "First name is required." })
      .max(64, { message: "Last name must be at most 64 characters long." })
      .optional(),
    username: z
      .string()
      // .nonempty({ message: "Username is required." })
      .max(64, { message: "Username must be at most 64 characters long." })
      .optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: userFromDB.bio ?? "",
      firstName: userFromClerk.firstName ?? "",
      lastName: userFromClerk.lastName ?? "",
      username: userFromClerk.username ?? "",
    },
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      form.reset();
      form.setValue("bio", userFromDB.bio ?? "");
      form.setValue("firstName", userFromClerk.firstName ?? "");
      form.setValue("lastName", userFromClerk.lastName ?? "");
      form.setValue("username", userFromClerk.username ?? "");
    }
  }, [open, userFromDB, userFromClerk, form]);

  function mapToPercentage(value: number) {
    value = Math.min(128, Math.max(0, value));
    const percentage = (value / 128) * 100;

    return percentage;
  }

  const bioLength = form.watch("bio").length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PenSquare size="1rem" className="mr-2" />
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <AlertDialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Tell us about yourself. This will be shown on your profile.
          </DialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            className="space-y-2"
            onSubmit={form.handleSubmit(async (data) => {
              await updateBioMutation.mutateAsync({
                bio: data.bio,
              });
              toast({
                title: "Profile updated",
                description: "Your profile has been updated.",
              });
              setOpen(false);
            })}
          >
            <FormField
              control={form.control}
              name="username"
              disabled
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Username<span className="text-red-500"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Brice" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-x-2">
              <FormField
                control={form.control}
                name="firstName"
                disabled
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      First Name<span className="text-red-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Brice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                disabled
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      Last Name<span className="text-red-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Suazo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bio
                    {/* <span className="text-red-500"> *</span> */}
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CustomProgress
              value={mapToPercentage(bioLength)}
              className={cn("h-2", bioLength > 128 && "-red-500")}
              hitLimit={bioLength > 128}
            />

            <div className="flex justify-end gap-x-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
              >
                {form.formState.isSubmitting && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
