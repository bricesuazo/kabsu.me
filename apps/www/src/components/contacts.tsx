"use client";

import React, { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { FacebookIcon, MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const schema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email("Enter a valid email"),
  message: z
    .string()
    .nonempty({ message: "Message is required" })
    .max(500, "Message cannot be more than 500 characters"),
});

type FormValues = z.infer<typeof schema>;

const Contacts = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    const payload = {
      username: "Kabsu.me",
      avatar_url: "https://example.com/avatar.png",
      embeds: [
        {
          title: "Contact form submission",
          description: `You have received a new message from the contact form.`,
          color: 0x007205,
          fields: [
            { name: "👤  Name:", value: data.name, inline: true },
            { name: "📧  Email:", value: data.email, inline: true },
            { name: "📝  Message", value: `"${data.message}"` },
          ],
          footer: { text: "Received" },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const webhookUrl =
      "https://discord.com/api/webhooks/1267762925712445500/PBDGx29xuDQTRY8hFyVihhHxF9lOPcuvZTkPMjuWDOc0OWPv2PaWfAxhpppF1waT1T4Z";

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        reset();
        setDialogOpen(true);
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-center text-4xl font-semibold tracking-[-0.03em] text-secondary-foreground duration-300 motion-reduce:transition-none md:text-5xl">
        Contact Us
      </h1>
      <p className="text-center text-muted-foreground">
        Have any questions or concerns? Feel free to reach out to us!
      </p>
      <div className="flex w-full flex-col md:flex-row">
        <Card className="z-10 grid w-full bg-background p-4">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label>
                    Name
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help text-red-500">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">required</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input id="name" placeholder="Name" {...register("name")} />
                  {errors.name && (
                    <span className="text-sm text-red-500">
                      {errors.name.message}
                    </span>
                  )}
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label>
                    Email
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help text-red-500">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">required</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className="text-sm text-red-500">
                      {errors.email.message}
                    </span>
                  )}
                </div>
                <div className="grid w-full gap-1.5">
                  <Label>
                    Message
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help text-red-500">*</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">required</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Textarea
                    placeholder="Type your message here."
                    id="message"
                    {...register("message")}
                  />
                  <p className="flex justify-end text-xs text-muted-foreground">
                    {errors.message ? (
                      <span className="text-sm text-red-500">
                        {errors.message.message}
                      </span>
                    ) : (
                      `${watch("message", "").length}/500`
                    )}
                  </p>
                </div>
              </div>
              <CardFooter className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    !watch("name") ||
                    !watch("email") ||
                    !watch("message") ||
                    Object.keys(errors).length > 0
                  }
                >
                  Send
                </Button>
              </CardFooter>
            </form>
          </CardContent>

          {dialogOpen && (
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Thank you</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your message has been successfully sent!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setDialogOpen(false)}>
                    Close
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </Card>

        <div className="flex w-full flex-col justify-center p-6">
          <h4 className="flex w-full justify-center py-4 text-center text-xl font-medium">
            or contact us at...
          </h4>

          <div className="flex flex-col items-start justify-start gap-4">
            <Button asChild variant="contacts">
              <Link
                href="mailto:kabsu.me@gmail.com?subject=Mail from your website&body=Hello there,"
                className="group text-left"
              >
                <MailIcon className="mr-2 size-5 duration-300 group-hover:text-red-600" />
                Email
              </Link>
            </Button>
            <Button asChild variant="contacts">
              <Link
                target="_blank"
                href="https://www.facebook.com/profile.php?id=61553962288015"
                className="group text-left"
              >
                <FacebookIcon className="mr-2 size-5 duration-300 group-hover:text-blue-600" />
                Facebook
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
