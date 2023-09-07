"use client";

import { User } from "@/db/schema";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { updateBio } from "@/actions/user";
import { Icons } from "./icons";

export default function Bio({
  user,
  isSameUser,
}: {
  user: User;
  isSameUser: boolean;
}) {
  const form = useForm<{
    bio: string;
  }>({
    defaultValues: {
      bio: user.bio ?? "",
    },
  });
  const [isEditing, setIsEditing] = useState(false);

  if (isSameUser) {
    return (
      <div>
        {isEditing ? (
          <Form {...form}>
            <form
              className="space-y-2"
              onSubmit={form.handleSubmit(async (data) => {
                await updateBio({
                  user_id: user.id,
                  bio: data.bio,
                });
                setIsEditing(false);
              })}
            >
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <p>
            {user.bio ?? "No bio yet"}{" "}
            <span>
              <button onClick={() => setIsEditing(true)}>
                <Pencil size="1rem" />
              </button>
            </span>
          </p>
        )}
      </div>
    );
  } else {
    return <p>{user.bio ?? "No bio yet"}</p>;
  }
}
