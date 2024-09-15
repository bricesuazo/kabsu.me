import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Share } from "lucide-react";

import type { RouterOutputs } from "@kabsu.me/api";
import { Button } from "@kabsu.me/ui/button";

import NglShare from "./ngl-share";

const NglMessage = ({
  message,
  theme,
}: {
  message: RouterOutputs["ngl"]["getAllMessages"][0];
  theme: string | undefined;
}) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  return (
    <div
      key={message.id}
      className="from-primary-ngl to-secondary-ngl/50 relative space-y-2 overflow-hidden rounded-3xl bg-gradient-to-br p-4 drop-shadow-md"
    >
      <Image
        src="/kabsu.webp"
        alt="Kabsu.me logo"
        width={300}
        height={300}
        className="absolute right-0 top-0 z-[0] h-full translate-x-1/2 object-cover opacity-10"
      />
      <div className="relative z-10 space-y-3">
        <p className="break-words text-center text-lg font-bold text-white">
          {message.content}
        </p>

        {message.answers.map((answer) => (
          <div
            key={answer.id}
            className="relative rounded-xl bg-white/50 p-4 text-center font-semibold text-black dark:bg-white/30"
          >
            <p className="break-words">{answer.content}</p>
          </div>
        ))}

        <div className="mx-auto flex w-fit items-center justify-center gap-2">
          <p className="break-words text-center text-xs transition-all duration-300 ease-in-out dark:text-white">
            {message.code_name ? (
              <span className="text-[10px] font-medium">
                {message.code_name} •{" "}
              </span>
            ) : null}
            {formatDistanceToNow(message.created_at, {
              includeSeconds: true,
              addSuffix: true,
            })}
          </p>

          <>
            <Button
              onClick={() => setDialogOpen(true)}
              variant={"outline"}
              className="bottom-0 right-1 top-0 mx-auto my-auto flex h-fit w-4 border-transparent bg-transparent px-0 transition-transform duration-300 hover:bg-transparent"
            >
              <Share size={14} className="" />
            </Button>
            <NglShare
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              message={message}
              theme={theme}
            />
          </>
        </div>
      </div>
    </div>
  );
};

export default NglMessage;
