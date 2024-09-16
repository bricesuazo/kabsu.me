"use client";

import type { z } from "zod";
import { useState } from "react";
import Image from "next/image";
import {
  Download,
  ImageDown,
  Moon,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@kabsu.me/ui";
import { Button } from "@kabsu.me/ui/button";
import { Label } from "@kabsu.me/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@kabsu.me/ui/tabs";

import { PostShareSchema } from "~/schema";
import { DialogAndDrawer } from "./dialog-and-drawer";

export default function PostShare({
  data,
}: {
  data: Partial<z.infer<typeof PostShareSchema>>;
}) {
  const { theme } = useTheme();
  const [imageSettings, setImageSettings] = useState<{
    theme: z.infer<typeof PostShareSchema>["theme"];
    ratio: z.infer<typeof PostShareSchema>["ratio"];
  }>({
    theme: (theme as "dark" | "light" | undefined) ?? "light",
    ratio: "square",
  });

  const post_image_url =
    "/api/post-share?" +
    new URLSearchParams(
      Object.fromEntries(
        Object.entries({
          ...data,
          ratio: imageSettings.ratio,
          theme: imageSettings.theme,
        }).map(([key, value]) => [
          key,
          typeof value === "string" ? value : JSON.stringify(value),
        ]),
      ),
    ).toString();

  return (
    <DialogAndDrawer
      title="Share post"
      trigger={
        <Button size="icon" variant="ghost" className="size-9">
          <ImageDown className="size-4" />
        </Button>
      }
      dialogClassName={cn(
        imageSettings.ratio === "portrait"
          ? "max-w-[400px]"
          : "max-w-screen-sm",
      )}
    >
      <div className="flex items-center justify-between">
        <Tabs
          value={imageSettings.theme}
          onValueChange={(value) => {
            const theme = PostShareSchema.shape.theme.parse(value);

            setImageSettings((prev) => ({
              ...prev,
              theme,
            }));
          }}
          className="flex flex-col gap-1"
        >
          <Label>Theme</Label>
          <TabsList>
            <TabsTrigger value="light">
              <Sun className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="dark">
              <Moon className="size-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={imageSettings.ratio}
          onValueChange={(value) => {
            const ratio = PostShareSchema.shape.ratio.parse(value);

            setImageSettings((prev) => ({
              ...prev,
              ratio,
            }));
          }}
          className="flex flex-col gap-1"
        >
          <Label>Size</Label>
          <TabsList>
            <TabsTrigger value="square">
              <Square className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="portrait">
              <RectangleVertical className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="landscape">
              <RectangleHorizontal className="size-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full">
        <Image
          src={post_image_url}
          alt=""
          width={720}
          height={720}
          className="mt-2 md:mt-0"
        />
      </div>
      <Button
        className="mt-2 md:mt-0"
        onClick={() => {
          const link = document.createElement("a");
          link.href = post_image_url;
          link.download = `Kabsu.me - ${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      >
        Download <Download className="ml-2 size-4" />
      </Button>
    </DialogAndDrawer>
  );
}
