"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { FacebookIcon, Loader2, MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@kabsu.me/ui/button";
import { Card, CardContent, CardFooter } from "@kabsu.me/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kabsu.me/ui/form";
import { Input } from "@kabsu.me/ui/input";
import { Textarea } from "@kabsu.me/ui/textarea";

import { api } from "~/lib/trpc/client";

const ContactSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("Enter a valid email"),
  message: z
    .string()
    .min(1, { message: "Message is required" })
    .max(500, "Message cannot be more than 500 characters"),
});

export default function ContactForm() {
  const form = useForm<z.infer<typeof ContactSchema>>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const contactMutation = api.users.contact.useMutation({
    onSuccess: () => {
      form.reset();
      toast.success("Message sent successfully!");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto flex max-w-[750px] flex-col gap-4">
      <h1 className="text-center text-4xl font-bold tracking-[-0.03em] text-primary duration-300 motion-reduce:transition-none">
        Contact Us
      </h1>
      <p className="mx-auto text-balance text-center">
        Have any questions or concerns? Feel free to reach out to us!
      </p>
      <div className="flex w-full flex-col">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              contactMutation.mutate(values),
            )}
            className="w-full"
          >
            <Card className="z-10 grid w-full bg-background">
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Your message" {...field} />
                      </FormControl>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <FormMessage />
                        </div>
                        <FormDescription className="flex-1 text-right">
                          {field.value.length}/500
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    !form.formState.isValid || contactMutation.isPending
                  }
                >
                  {contactMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />{" "}
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        <div className="flex w-full flex-col p-6">
          <h4 className="flex w-full justify-center pb-2 text-center font-medium">
            or contact us at...
          </h4>

          <div className="mx-auto flex items-start justify-start gap-4">
            <Button asChild variant="contacts" className="w-fit">
              <Link
                href="mailto:kabsu.me@gmail.com?subject=Mail from your website&body=Hello there,"
                className="group text-left"
              >
                <MailIcon className="size-5 duration-300 group-hover:text-red-600" />
              </Link>
            </Button>
            <Button asChild variant="contacts" className="w-fit">
              <Link
                target="_blank"
                href="https://www.facebook.com/profile.php?id=61553962288015"
                className="group text-left"
              >
                <FacebookIcon className="size-5 duration-300 group-hover:text-blue-600" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
