import { authMiddleware, currentUser, redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // publicRoutes: ["/"],
  // async afterAuth(auth, req, evt) {
  //   // if (!auth.userId && !auth.isPublicRoute) {
  //   //   console.log(
  //   //     "🚀 ~ file: middleware.ts:12 ~ afterAuth ~ req.url:",
  //   //     req.url,
  //   //   );
  //   //   return redirectToSignIn({ returnBackUrl: req.url });
  //   // }
  //   // console.log("🚀 ~ file: middleware.ts:9 ~ auth:", auth);
  //   // const userFromDB = await db.query.users.findFirst({
  //   //   where: (user, { eq }) => eq(user.id, auth.userId),
  //   // });
  //   // console.log("🚀 ~ file: middleware.ts:14 ~ afterAuth ~ user:", userFromDB);
  //   // console.log("🚀 ~ file: middleware.ts:9 ~ afterAuth ~ req:", req);
  //   // console.log("🚀 ~ file: middleware.ts:9 ~ afterAuth ~ evt:", evt);
  // },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
