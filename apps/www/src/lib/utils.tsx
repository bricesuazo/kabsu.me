/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Fragment } from "react";
import Link from "next/link";
import reactStringReplace from "react-string-replace";

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
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytest")
      : (sizes[i] ?? "Bytes")
  }`;
}

export function getDisplayData(queryString: string): {
  username?: string;
  id?: string;
} {
  const params = new URLSearchParams(queryString);
  const username = params.get("username")!;
  const id = params.get("id")!;
  return { username, id };
}

export const REGEX = /@([\w-]+)/g;

export function extractAllMentions(text: string): string[] {
  // Use a regular expression to match words after @

  let matches;
  const results = [];

  // Use regex exec to find all matches
  while ((matches = REGEX.exec(text)) !== null) {
    results.push(matches[1] ?? "");
  }

  return results;
}

export function replaceMentions(text: string) {
  return text.replace(REGEX, "@$1");
}

export function FormattedContentTextOnly({
  text,
  mentioned_users,
}: {
  text: string;
  mentioned_users: {
    id: string;
    username: string;
    name: string;
  }[];
}) {
  let updatedContent = text;

  mentioned_users.forEach((user) => {
    const mentionId = `@${user.id}`;
    const mentionUsername = `@${user.username}`;
    updatedContent = updatedContent.replace(mentionId, mentionUsername);
  });

  return updatedContent;
}
export const FormattedContent = ({
  text,
  mentioned_users,
}: {
  text: string;
  mentioned_users: {
    id: string;
    username: string;
    name: string;
  }[];
}) => {
  const matchLinks = reactStringReplace(
    text,
    /(https?:\/\/\S+)/g,
    (match, i) => (
      <Link
        key={match + i}
        href={match}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        className={"break-all text-primary hover:underline"}
      >
        {match}
      </Link>
    ),
  );

  const matchMentions = reactStringReplace(matchLinks, REGEX, (match, i) => {
    const user = mentioned_users.find((user) => user.id === match);

    return (
      <Link
        key={match + i}
        href={`/${user ? user.username : match}`}
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-primary"
      >
        {`@${user ? user.username : match}`}
      </Link>
    );
  });

  return matchMentions;
};
