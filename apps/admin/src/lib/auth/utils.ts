import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

interface AuthSession {
  session: {
    user: {
      id: string;
      name?: string;
      email?: string;
    };
  } | null;
}

export const getUserAuth = async () => {
  const user = await currentUser();
  if (user?.id) {
    return {
      session: {
        user: {
          id: user.id,
        },
      },
    } as AuthSession;
  } else {
    return { session: null };
  }
};

export const checkAuth = () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
};
