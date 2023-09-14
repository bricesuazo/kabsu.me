import { type ClassValue, clsx } from "clsx";
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
