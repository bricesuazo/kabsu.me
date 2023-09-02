import type { IncomingHttpHeaders } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { WebhookRequiredHeaders } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const usersInDB = await db.query.users.findMany();

    await db.insert(users).values({
      id,
      user_number: usersInDB.length + 1,
      username:
        evt.data.username ??
        evt.data.email_addresses[0].email_address.split("@")[0],
    });
  } else if (eventType === "user.deleted") {
    console.log(`User ${id} was ${eventType}`);

    await db
      .update(users)
      .set({
        deleted_at: new Date(),
      })
      .where(eq(users.id, id));
  } else if (eventType === "user.updated") {
    console.log(`User ${id} was ${eventType}`);

    await db

      .update(users)
      .set({
        username:
          evt.data.username ??
          evt.data.email_addresses[0].email_address.split("@")[0],
      })
      .where(eq(users.id, id));
  } else {
    console.log(`User ${id} was ${eventType}`);
  }

  return new Response("", {
    status: 201,
  });
}
