"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@kabsu.me/db/schema";
import { PenSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Icons } from "./icons";
import { AlertDialogHeader } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import CustomProgress from "./ui/custom-progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "./ui/use-toast";

export default function EditProfile({ user }: { user: User }) {
  const context = api.useUtils();
  const updateProfileMutation = api.users.updateProfile.useMutation({
    onSuccess: async () => {
      await context.users.getUserProfile.invalidate({
        username: user.username ?? "",
      });
    },
  });
  const formSchema = z.object({
    bio: z
      .string()
      .max(128, "Bio must be at most 128 characters long.")
      .optional(),
    name: z
      .string()
      // .nonempty({ message: "First name is required." })
      .max(64, { message: "Name must be at most 64 characters long." })
      .optional(),
    username: z
      .string()
      // .nonempty({ message: "Username is required." })
      .max(64, { message: "Username must be at most 64 characters long." })
      .optional(),
    link: z
      .string()
      // .url({ message: "Link must be a valid URL." })
      .max(64, { message: "Link must be less than 64 characters" })
      .transform((value) => {
        if (value === "") return undefined;
        return value.match("http") ? value : `https://${value}`;
      })
      .optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: user.bio ?? "",
      name: user.name ?? "",
      username: user.username ?? "",
      link: user.link?.split("https://")[1] ?? "",
    },
  });

  const [open, setOpen] = useState(false);

  // useEffect(() => {
  //   if (open) {
  //     form.reset();
  //     form.setValue("bio", user.bio ?? "");
  //     form.setValue("firstName", user.firstName ?? "");
  //     form.setValue("lastName", user.lastName ?? "");
  //     form.setValue("username", user.username ?? "");
  //     form.setValue("link", user.link?.split("https://")[1] ?? "");
  //   }
  // }, [open, user, user, form]);

  function mapToPercentage(value: number) {
    return (Math.min(128, Math.max(0, value)) / 128) * 100;
  }

  const bioLength = form.watch("bio")?.length ?? 0;

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
              await updateProfileMutation.mutateAsync({
                bio: data.bio?.length ? data.bio : null,
                link: data.link ?? null,
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
                name="name"
                disabled
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      Name<span className="text-red-500"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Brice Suazo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* <p className="text-sm">
              To update your username, first name, and last name, please visit
              the{" "}
              <Link href="/account" className="text-primary hover:underline">
                Account Page
              </Link>
              .
            </p> */}

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
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input placeholder="bricesuazo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                  form.formState.isSubmitting || !form.formState.isDirty
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
