import Pusher from "pusher";
import PusherClient from "pusher-js";

import { env } from "./env.mjs";

export const pusherServer = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});

export const pusherClient = new PusherClient(env.PUSHER_KEY, {
  cluster: env.PUSHER_CLUSTER,
  forceTLS: true,
});
