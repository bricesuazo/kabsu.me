"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/trpc/client";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check, Pencil, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
});

export default function AccountPage() {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const updateAccountSettingsMutation =
    api.users.updateAccountSettings.useMutation({
      onSuccess: async (values) => {
        setIsEditing(false);
        await user?.update(values);
      },
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isEditing) {
      updateAccountSettingsMutation.reset();
      form.setValue("username", user?.username ?? "");
      form.setValue("firstName", user?.firstName ?? "");
      form.setValue("lastName", user?.lastName ?? "");
    }
  }, [isEditing]);
  useEffect(() => {
    if (isLoaded) {
      form.setValue("username", user?.username ?? "");
      form.setValue("firstName", user?.firstName ?? "");
      form.setValue("lastName", user?.lastName ?? "");
    }
  }, [isLoaded, user]);

  return (
    <div>
      {/* <UserProfile
        path="/account"
        routing="virtual"
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            rootBox: {
              width: "100%",
              height: "100%",
            },
            card: {
              width: "100%",
              maxWidth: "100%",
            },
          },
        }}
      /> */}
      <Card className="rounded-none border-none">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-x-2">
            <div className="flex-[3] space-y-4">
              <div className="space-y-4">
                <div className="">
                  <h3 className="text-2xl font-semibold">Account</h3>
                  <p className="text-sm text-gray-500">
                    Manage your account information.
                  </p>
                </div>
                <div className="">
                  <h6 className="text-lg font-semibold text-muted-foreground">
                    Profile
                  </h6>
                  <Separator />

                  <div className="mt-2 flex items-center gap-x-4">
                    <div className="flex flex-col items-center gap-y-2">
                      <Image
                        src={
                          user?.hasImage
                            ? user.imageUrl
                            : `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`
                        }
                        alt=""
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                      {/* <Button size="sm" variant="ghost">
                        Change
                      </Button> */}
                    </div>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit((values) => {
                          updateAccountSettingsMutation.mutate(values);
                        })}
                        className="space-y-8"
                      >
                        <div className="w-full">
                          {!isEditing ? (
                            <div className="space-y-2">
                              <div>
                                <p className="w-full text-lg font-semibold">
                                  {user?.firstName} {user?.lastName}
                                </p>

                                <p className="w-full text-muted-foreground">
                                  @{user?.username}
                                </p>
                              </div>
                              <Button
                                className="text-foreground"
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                              >
                                <Pencil size=".75rem" className="mr-2" /> Edit
                                Profile
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-y-2">
                              <div className="flex w-full items-end gap-x-2">
                                <FormField
                                  control={form.control}
                                  name="firstName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>First name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder={
                                            user?.firstName ?? "First name"
                                          }
                                          disabled={
                                            updateAccountSettingsMutation.isLoading
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
                                  name="lastName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Last name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder={
                                            user?.lastName ?? "Last name"
                                          }
                                          disabled={
                                            updateAccountSettingsMutation.isLoading
                                          }
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={
                                          user?.username ?? "Username"
                                        }
                                        disabled={
                                          updateAccountSettingsMutation.isLoading
                                        }
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {updateAccountSettingsMutation.error && (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertTitle>Error</AlertTitle>
                                  <AlertDescription>
                                    {
                                      updateAccountSettingsMutation.error
                                        .message
                                    }
                                  </AlertDescription>
                                </Alert>
                              )}
                              <div>
                                <Button
                                  size="sm"
                                  type="submit"
                                  disabled={
                                    !form.formState.isValid ||
                                    !form.formState.isDirty ||
                                    updateAccountSettingsMutation.isLoading
                                  }
                                >
                                  {updateAccountSettingsMutation.isLoading && (
                                    <Icons.spinner className="mr-1 h-3 w-3 animate-spin" />
                                  )}
                                  Update
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={
                                    updateAccountSettingsMutation.isLoading
                                  }
                                  onClick={() => setIsEditing(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>

                <div className="">
                  <h6 className="text-lg font-semibold text-muted-foreground">
                    Contact Information
                  </h6>
                  <Separator />

                  <div className="mt-2 ">
                    <h5>
                      <span className="text-sm">
                        Primary Email Address:{" "}
                        {
                          user?.emailAddresses.find(
                            (e) => e.id === user.primaryEmailAddressId,
                          )?.emailAddress
                        }
                      </span>
                    </h5>
                  </div>
                </div>
              </div>
              {/* <div className="space-y-4">
                <div className="">
                  <h3 className="text-2xl font-semibold">Security</h3>
                  <p className="text-sm text-gray-500">
                    Manage your security preferences.
                  </p>
                </div>

                <div className="">
                  <h6 className="text-lg font-semibold text-muted-foreground">
                    Active Devices
                  </h6>
                  <Separator />

                  <div className=""></div>
                </div>
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
