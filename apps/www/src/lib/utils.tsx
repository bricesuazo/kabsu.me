import type { ClassValue } from "clsx";
import { Fragment } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOrdinal(number: number) {
  const absNumber = Math.abs(number);
  const lastDigit = absNumber % 10;
  const lastTwoDigits = absNumber % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return number + "th";
  }

  switch (lastDigit) {
    case 1:
      return number.toLocaleString("en-US") + "st";
    case 2:
      return number.toLocaleString("en-US") + "nd";
    case 3:
      return number.toLocaleString("en-US") + "rd";
    default:
      return number.toLocaleString("en-US") + "th";
  }
}

export function formatText(text: string) {
  // const URL_REGEX =
  //   /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
  const URL_REGEX =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

  const USERNAME_REGEX = /@([a-zA-Z0-9_]+)/gm;

  const words = text.split(" ");

  const link_class = "text-primary hover:underline break-all";
  return (
    <>
      {words.map((word, index) => {
        if (word.match(USERNAME_REGEX)) {
          const username = word.slice(1);
          return (
            <Fragment key={index}>
              <Link
                onClick={(e) => e.stopPropagation()}
                href={`/${username}`}
                className={link_class}
              >
                {word}
              </Link>{" "}
            </Fragment>
          );
        }

        return word.match(URL_REGEX) ? (
          <Fragment key={index}>
            <Link
              href={word}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className={link_class}
            >
              {word}
            </Link>{" "}
          </Fragment>
        ) : (
          word + " "
        );
      })}
    </>
  );
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {},
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate" ? accurateSizes[i] ?? "Bytest" : sizes[i] ?? "Bytes"
  }`;
}
