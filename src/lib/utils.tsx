import { type ClassValue, clsx } from "clsx";
import Link from "next/link";
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
  const URL_REGEX =
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

  const USERNAME_REGEX = /@([a-zA-Z0-9_]+)/gm;

  const words = text.split(" ");

  const link_class = "text-primary hover:underline break-all";
  return (
    <>
      {words.map((word) => {
        if (word.match(USERNAME_REGEX)) {
          const username = word.slice(1);
          return (
            <>
              <Link
                onClick={(e) => e.stopPropagation()}
                href={`/${username}`}
                className={link_class}
              >
                {word}
              </Link>{" "}
            </>
          );
        }

        return word.match(URL_REGEX) ? (
          <>
            <Link
              href={word}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className={link_class}
            >
              {word}
            </Link>{" "}
          </>
        ) : (
          word + " "
        );
      })}
    </>
  );
}
