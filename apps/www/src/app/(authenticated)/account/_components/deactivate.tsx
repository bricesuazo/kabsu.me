"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DialogAndDrawer } from "~/components/dialog-and-drawer";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/trpc/client";
import { createClient } from "~/supabase/client";

const FormSchema = z.object({
  username: z.string().min(1, {
    message: "Username must be at least 1 character.",
  }),
});
export default function Deactivate() {
  const router = useRouter();
  const supabase = createClient();
  const deactivateMutation = api.users.deactivate.useMutation({
    onSuccess: async () => {
      await supabase.auth.signOut();
      router.push("/?status=deactivated");
    },
    onError: (error) => form.setError("username", { message: error.message }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-lg font-semibold">Deactivate Account</h3>
      <DialogAndDrawer
        trigger={<Button variant="destructive">Deactivate Account</Button>}
        title="Deactivate Account"
        description="Are you sure you want to deactivate your account? This action is irreversible."
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              deactivateMutation.mutate({ username: values.username }),
            )}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="bricesuazo" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your username to confirm deactivation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="destructive"
              className="w-full md:w-auto"
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate"
              )}
            </Button>
          </form>
        </Form>
      </DialogAndDrawer>
    </div>
  );
}
