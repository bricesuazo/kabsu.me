"use client";

import type { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { PenSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { RouterOutputs } from "@kabsu.me/api";

import { useMediaQuery } from "~/hooks/use-media-query";
import { api } from "~/lib/trpc/client";
import { cn } from "~/lib/utils";
import { createClient } from "~/supabase/client";
import { FileUploader } from "./file-uploader";
import { Icons } from "./icons";
import { AlertDialogHeader } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import CustomProgress from "./ui/custom-progress";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  bio: z
    .string()
    .max(128, "Bio must be at most 128 characters long.")
    .optional(),
  name: z
    .string()
    .min(1, { message: "First name is required." })
    .max(64, { message: "Name must be at most 64 characters long." }),
  username: z
    .string()
    .min(1, { message: "Username is required." })
    .max(64, { message: "Username must be at most 64 characters long." }),
  link: z
    .string()
    .max(64, { message: "Link must be less than 64 characters" })
    .transform((value) => {
      if (value === "") return undefined;
      return /http/.exec(value) ? value : `https://${value}`;
    })
    .refine((value) => {
      if (value === undefined) return true;
      if (value.length) return value.includes(".");
    }, "Invalid URL")
    .optional(),
  images: z.instanceof(File).array().or(z.string()).nullish(),
});

export default function EditProfile({
  user,
}: {
  user: RouterOutputs["users"]["getUserProfile"]["user"];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const context = api.useUtils();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: user.bio ?? "",
      name: user.name,
      username: user.username,
      link: user.link?.split("https://")[1] ?? "",
      images: user.image_name ? user.image_url : undefined,
    },
  });

  const isUsernameExistsMutation = api.users.isUsernameExists.useMutation();
  const getUserImageUploadSignedUrlMutation =
    api.users.getUserImageUploadSignedUrl.useMutation();
  const updateProfileMutation = api.users.updateProfile.useMutation({
    onSuccess: async ({ username }) => {
      if (user.username !== username) {
        router.push(`/${username}`);
      } else if (form.getFieldState("images").isDirty) {
        await Promise.all([
          context.users.getUserProfile.invalidate({ username }),
          context.posts.getUserPosts.reset(),
          context.auth.getCurrentUser.refetch(),
        ]);
      } else {
        await context.users.getUserProfile.invalidate({ username });
      }

      toast.success("Profile updated", {
        description: "Your profile has been updated.",
      });
      setOpen(false);
    },
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open)
      form.reset({
        bio: user.bio ?? "",
        name: user.name,
        username: user.username,
        link: user.link?.split("https://")[1] ?? "",
        images: user.image_name ? user.image_url : undefined,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = form.handleSubmit(async (data) => {
    const supabase = createClient();
    if (data.username !== user.username) {
      const isUsernameExists = await isUsernameExistsMutation.mutateAsync({
        username: data.username,
      });
      if (isUsernameExists) {
        form.setError("username", {
          message: "Username is already taken.",
        });
        return;
      }
    }

    let image_name: string | undefined | null;
    if (Array.isArray(data.images) && data.images[0]) {
      const now = Date.now();

      const upload_signed_url =
        await getUserImageUploadSignedUrlMutation.mutateAsync({
          image_name: now.toString(),
        });

      const compressedImage = await imageCompression(data.images[0], {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      await supabase.storage
        .from("users")
        .uploadToSignedUrl(
          upload_signed_url.path,
          upload_signed_url.token,
          compressedImage,
        );

      image_name = now.toString();
    } else if (data.images === null) {
      image_name = null;
    }

    await updateProfileMutation.mutateAsync({
      bio: data.bio?.length ? data.bio : null,
      link: data.link ?? null,
      name: data.name,
      username: data.username,
      image_name,
    });
  });

  return (
    <>
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PenSquare size="1rem" className="mr-2" />
              Edit profile
            </Button>
          </DialogTrigger>
          <DialogContent className="px-2">
            <FormWrapper form={form} onSubmit={handleSubmit}>
              <AlertDialogHeader className="px-4">
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Tell us about yourself. This will be shown on your profile.
                </DialogDescription>
              </AlertDialogHeader>
              <EditProfileForm form={form} className="p-4" />
              <DialogFooter className="px-4">
                <DialogClose asChild>
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
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
              </DialogFooter>
            </FormWrapper>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button size="sm">
              <PenSquare size="1rem" className="mr-2" />
              Edit profile
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <FormWrapper form={form} onSubmit={handleSubmit}>
              <DrawerHeader className="text-left">
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>
                  Tell us about yourself. This will be shown on your profile.
                </DrawerDescription>
              </DrawerHeader>
              <EditProfileForm form={form} className="p-4" />
              <DrawerFooter className="pt-2">
                <Button
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
                <DrawerClose asChild>
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </FormWrapper>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
function EditProfileForm({
  form,
  className,
}: {
  form: UseFormReturn<
    {
      name: string;
      username: string;
      bio?: string | undefined;
      link?: string | undefined;
      images?: string | File[] | null | undefined;
    },
    unknown,
    undefined
  >;
  className?: string;
}) {
  function mapToPercentage(value: number) {
    return (Math.min(128, Math.max(0, value)) / 128) * 100;
  }

  const bioLength = form.watch("bio")?.length ?? 0;

  return (
    <ScrollArea viewportClassName={cn("max-h-[40rem]", className)}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Image</FormLabel>
              <FormControl>
                {typeof field.value !== "string" ? (
                  !field.value?.[0] ? (
                    <FileUploader
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                      maxFiles={1}
                      maxSize={4 * 1024 * 1024}
                      disabled={form.formState.isSubmitting}
                    />
                  ) : (
                    <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25">
                      <Image
                        src={URL.createObjectURL(field.value[0])}
                        width={100}
                        height={100}
                        alt="Profile"
                        className="aspect-square rounded-full object-cover object-center"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 !text-destructive"
                        type="button"
                        onClick={async () => {
                          field.onChange(undefined);
                          await form.trigger("images");
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="flex h-52 flex-col items-center justify-center gap-2">
                    <Image
                      src={field.value}
                      alt=""
                      width={100}
                      height={100}
                      className="aspect-square rounded-full object-cover object-center"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      type="button"
                      onClick={() => field.onChange(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-x-2">
          <FormField
            control={form.control}
            name="name"
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
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex-1">
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
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
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
        </div>
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
      </div>
    </ScrollArea>
  );
}

function FormWrapper({
  children,
  form,
  onSubmit,
  className,
}: React.PropsWithChildren<{
  form: UseFormReturn<
    {
      name: string;
      username: string;
      bio?: string | undefined;
      link?: string | undefined;
      images?: string | File[] | null | undefined;
    },
    unknown,
    undefined
  >;
  onSubmit: () => void;
  className?: string;
}>) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className={className}>
        {children}
      </form>
    </Form>
  );
}
