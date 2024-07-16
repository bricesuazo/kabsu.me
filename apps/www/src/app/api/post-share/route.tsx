/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "@vercel/og";
import { z } from "zod";

import { cn } from "~/lib/utils";

const SPSchema = z.object({
  theme: z.enum(["light", "dark"]).nullable().default("light"),
  ratio: z
    .enum(["square", "landscape", "portrait"])
    .nullable()
    .default("square"),
});

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const data = SPSchema.parse(Object.fromEntries(searchParams.entries()));

  return new ImageResponse(
    (
      <div
        tw={cn(
          "flex h-full w-full",
          data.theme === "light" ? "bg-white" : "bg-black",
        )}
        // className="leading-2"
      >
        <div tw="flex">
          <img
            width={80}
            height={80}
            src={`https://github.com/bricesuazo.png`}
            tw="rounded-full"
          />

          <div tw="flex flex-col">
            <h1
              tw={cn(
                "leading-1 text-lg font-bold",
                data.theme === "light" ? "text-black" : "text-white",
              )}
            >
              Brice Suazo
            </h1>
            <p
              tw={cn(
                "leading-1 text-sm",
                data.theme === "light" ? "text-black" : "text-white",
              )}
            >
              Software Engineer
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: data.ratio === "square" || data.ratio === "portrait" ? 1080 : 1920,
      height:
        data.ratio === "square" || data.ratio === "landscape" ? 1080 : 1920,
      debug: true,
    },
  );
}
