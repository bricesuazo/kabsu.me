import type { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db";
import { deleted_users, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

const webhookSecret: string = process.env.WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  const payload = await req.json();
  const payloadString = JSON.stringify(payload);
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixIdTimeStamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");
  if (!svixId || !svixIdTimeStamp || !svixSignature) {
    return new Response("Error occured", {
      status: 400,
    });
  }
  // Create an object of the headers
  const svixHeaders = {
    "svix-id": svixId,
    "svix-timestamp": svixIdTimeStamp,
    "svix-signature": svixSignature,
  };
  // Create a new Webhook instance with your webhook secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (_) {
    console.log("error");
    return new Response("Error occured", {
      status: 400,
    });
  }
  const { id } = evt.data;
  // Handle the webhook
  const eventType = evt.type;
  if (!id)
    return new Response("Error occured", {
      status: 400,
    });
  if (eventType === "user.created") {
    console.log(`User ${id} was ${eventType}`);

    const username =
      evt.data.username ??
      evt.data.email_addresses[0].email_address.split("@")[0];

    await clerkClient.users.updateUser(id, {
      username,
    });

    const usersInDB = await db.query.users.findMany();
    const deletedUsersInDB = await db.query.deleted_users.findMany();

    await db.insert(users).values({
      id,
      user_number: usersInDB.length + deletedUsersInDB.length + 1,
    });
  } else if (eventType === "user.deleted") {
    console.log(`User ${id} was ${eventType}`);

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (user) {
      await db.insert(deleted_users).values({
        id: user.id,
        user_number: user.user_number,
      });

      await db.delete(users).where(eq(users.id, id));
    }
    // } else if (eventType === "user.updated") {
    //   console.log(`User ${id} was ${eventType}`);

    //   const username =
    //     evt.data.username ??
    //     evt.data.email_addresses[0].email_address.split("@")[0];

    //   const user = await clerkClient.users.getUser(id);

    //   if (user.imageUrl !== evt.data.image_url) {
    //     await db
    //       .update(users)
    //       .set({
    //         image_url: evt.data.image_url,
    //       })
    //       .where(eq(users.id, id));
    //   }

    //   if (user.username !== username) {
    //     await clerkClient.users.updateUser(id, {
    //       username,
    //     });

    //     await db
    //       .update(users)
    //       .set({
    //         username,
    //       })
    //       .where(eq(users.id, id));
    //   }
  } else {
    console.log(`User ${id} was ${eventType}`);
  }

  return new Response("", {
    status: 201,
  });
}
