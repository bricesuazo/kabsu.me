import { useState } from "react";
import Image from "next/image";
import { Download, Loader, Moon, Sun } from "lucide-react";

import type { RouterOutputs } from "@kabsu.me/api";
import { cn } from "@kabsu.me/ui";
import { Button } from "@kabsu.me/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@kabsu.me/ui/dialog";
import { Label } from "@kabsu.me/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@kabsu.me/ui/tabs";

const NglShare = ({
  dialogOpen,
  setDialogOpen,
  message,
  theme,
}: {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  message: RouterOutputs["ngl"]["getAllMessages"][0];
  theme: string | undefined;
}) => {
  const [image_theme, setImageTheme] = useState(theme);
  const [loading, setLoading] = useState(true);

  const getImageUrl = () => {
    const share_image_url = new URL("/api/ngl-share", window.location.origin);

    const params = {
      message: message.content,
      answer: message.answers[0]?.content,
      code_name: message.code_name,
      theme: image_theme,
    };

    Object.entries(params).forEach(([key, value]) => {
      share_image_url.searchParams.append(key, String(value));
    });

    return share_image_url.toString();
  };

  return (
    <Dialog open={dialogOpen}>
      <DialogContent
        onInteractOutside={() => setDialogOpen(false)}
        className="max-w-sm"
      >
        <div className="absolute right-3 top-3 z-10 h-10 w-10 bg-white dark:bg-black"></div>
        <DialogHeader className="relative z-10 text-center">
          <DialogTitle>Share this NGL to your friends!</DialogTitle>

          <Tabs
            value={image_theme}
            onValueChange={(value) => {
              setLoading(true);
              setImageTheme(value);
              getImageUrl();
            }}
            className="!mt-3 flex w-fit flex-col gap-1"
          >
            <Label>Theme</Label>
            <TabsList>
              <TabsTrigger value="light" disabled={loading}>
                <Sun className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="dark" disabled={loading}>
                <Moon className="size-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <div className="relative h-full w-full">
          {loading && (
            <Loader className="absolute bottom-0 left-0 right-0 top-0 m-auto animate-spin opacity-50" />
          )}
          <Image
            width={1080 / 3}
            height={1920 / 3}
            src={getImageUrl()}
            alt="Share Image Ngl"
            onLoad={() => {
              setLoading(false);
            }}
            className={cn("opacity-0 transition-all duration-300 ease-in-out", {
              "opacity-100": !loading,
            })}
          />
        </div>

        <Button
          onClick={() => {
            const link = document.createElement("a");
            link.href = getImageUrl();
            link.download = `NGL-Kabsu.me - ${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Download <Download className="ml-2 size-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NglShare;
