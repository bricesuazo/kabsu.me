import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type AuthSession = {
  session: {
    user: {
      id: string;
      name?: string;
      email?: string;
    };
  } | null;
};

export const getUserAuth = async () => {
  const { userId } = auth();
  if (userId) {
    return {
      session: {
        user: {
          id: userId,
        },
      },
    } as AuthSession;
  } else {
    return { session: null };
  }
};

export const checkAuth = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
};