import { db } from "@/db";

export default async function Posts() {
  const posts = await db.query.posts.findMany();
  return <div>{JSON.stringify(posts)}</div>;
}
