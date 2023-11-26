import moment from "moment-twitter";

export function momentTwitter(date: Date): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return moment(date).twitterLong();
}
