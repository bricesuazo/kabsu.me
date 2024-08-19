import { api } from "~/lib/trpc/server";

export default async function UserPaqe({
  params: { username },
}: {
  params: { username: string };
}) {
  const getUser = await api.ngl.getUser({ username });
  return <div>{JSON.stringify(getUser)}</div>;
}
