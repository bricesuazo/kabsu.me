"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { env } from "~/env";
import { api } from "~/lib/trpc/client";

const FormSchema = z.object({
  isMyNGLDisplayed: z.boolean(),
});

export default function NGLSettings({
  username,
  isMyNGLDisplayed,
}: {
  username: string;
  isMyNGLDisplayed: boolean;
}) {
  const utils = api.useUtils();
  const isMyNGLDisplayedQuery = api.auth.isMyNGLDisplayed.useQuery(undefined, {
    initialData: isMyNGLDisplayed,
  });
  const toggleIsMyNGLDisplayedMutation =
    api.auth.toggleIsMyNGLDisplayed.useMutation({
      onSuccess: async (data) => {
        await utils.auth.getCurrentUser.invalidate();
        form.reset({
          isMyNGLDisplayed: data,
        });
      },
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      isMyNGLDisplayed: isMyNGLDisplayedQuery.data,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((value) =>
          toggleIsMyNGLDisplayedMutation.mutate({
            is_ngl_displayed: value.isMyNGLDisplayed,
          }),
        )}
        className="space-y-2"
      >
        <FormField
          control={form.control}
          name="isMyNGLDisplayed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Display my NGL Page</FormLabel>
                <FormDescription>
                  If you enable this, your NGL page will be publicly accessible
                  at{" "}
                  <Link
                    href={`${env.NEXT_PUBLIC_NGL_URL}/${username}`}
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    {env.NEXT_PUBLIC_NGL_URL}/{username}
                  </Link>
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={
              toggleIsMyNGLDisplayedMutation.isPending ||
              !form.formState.isDirty
            }
          >
            Submit{toggleIsMyNGLDisplayedMutation.isPending ? "ting..." : ""}
          </Button>
        </div>
      </form>
    </Form>
  );
}
