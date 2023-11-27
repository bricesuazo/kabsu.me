import { db } from "@kabsu.me/db";
import { users } from "@kabsu.me/db/schema";
import type { ACCOUNT_TYPE } from "@kabsu.me/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string | null;
      program_id: string | null;
      type: (typeof ACCOUNT_TYPE)[number] | null;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    // ...other properties
    // role: UserRole;
    username: string | null;
    program_id: string | null;
    type: (typeof ACCOUNT_TYPE)[number] | null;
  }
}

export const providers = ["google"] as const;
export type OAuthProviders = (typeof providers)[number];

export const {
  handlers: { GET, POST },
  auth,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  signIn,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  signOut,
  update,
} = NextAuth({
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    signIn: (props) => {
      // console.log("🚀 ~ file: index.ts:49 ~ signIn props:", props);
      if (
        props.profile?.email === "cvsudotme@gmail.com" ||
        props.profile?.email?.endsWith("@cvsu.edu.ph")
      ) {
        return true;
      }

      return false;
    },
    jwt: async ({ profile, token, trigger, session }) => {
      // console.log("jwt🚀 ~ file: index.ts:58 ~ jwt profile:", profile);

      if (trigger === "update" && session) {
        console.log("🚀 ~ file: auth.ts:80 ~ session:", session);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return { ...token, ...session.user };
      }

      if (profile) {
        const isUserExists = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, profile.email ?? ""),
        });

        if (!isUserExists) {
          const id = nanoid();
          await db.insert(users).values({
            id,
            name: profile.name ?? "",
            email: profile.email ?? "",
            image: (profile.picture as string | null) ?? "",
            username: null,
            program_id: null,
            type: null,
          });

          token = {
            ...token,
            id,
            name: profile.name,
            email: profile.name,
            image: profile.picture,
            username: null,
            program_id: null,
            type: null,
          };
        } else {
          if (
            !isUserExists.image ||
            (typeof isUserExists.image === "string" &&
              isUserExists.image.length === 0) ||
            isUserExists.image !== profile.picture
          )
            await db
              .update(users)
              .set({
                image: (profile.picture as string | null) ?? null,
              })
              .where(eq(users.id, isUserExists.id));

          token = {
            ...token,
            id: isUserExists.id,
            name: isUserExists.name,
            email: isUserExists.email,
            image: isUserExists.image ?? profile.picture,
            username: isUserExists.username,
            program_id: isUserExists.program_id,
            type: isUserExists.type,
          };
        }
      }

      return token;
    },

    session: (props) => {
      // console.log("🚀 ~ file: index.ts:59 ~ session profile:", props);

      return {
        ...props.session,
        user: {
          ...props.session.user,
          id: props.token.id as string,
          name: props.token.name,
          email: props.token.email,
          image: props.token.image as string | null,
          username: props.token.username,
          program_id: props.token.program_id,
          type: props.token.type,
        },
      };
    },
  },
  pages: {
    signIn: "/",
    newUser: "/",
    signOut: "/",
    error: "/",
  },
});

export type { Session } from "next-auth/types";

// {
//  "🚀 ~ file: index.ts:49 ~ signIn props" :{
//    user: undefined,
//    account: {
//      provider: 'google',
//      type: 'oidc',
//      providerAccountId: '116354056198921025422',
//      access_token: 'ya29.a0AfB_byCQ3cXf-9Xv3UI2NE_GeW9t_K4Tn0VBFxwiu3WxY9mgbXn5Fv40f5x46_CKu8YgRjDTJkO6WNNG99iCl0fXvuHDIiBiRb4ig0q6cz-FCaoSVM7S98bmeWh4oRabYt_75SvYjcWADvDopjRFhKXPZfqx6FIjwpoaCgYKAUESARASFQHGX2MiLXBULpRTlndoYU0Z9yQtLA0170',
//      expires_in: 3599,
//      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
//      token_type: 'bearer',
//      id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBlNzJkYTFkZjUwMWNhNmY3NTZiZjEwM2ZkN2M3MjAyOTQ3NzI1MDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0OTMyNTQ1MTc2MTItMTk0cGt1OWhoZTQwcmd0M2YxMHVxYXN0aG5jMGxxZTEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0OTMyNTQ1MTc2MTItMTk0cGt1OWhoZTQwcmd0M2YxMHVxYXN0aG5jMGxxZTEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTYzNTQwNTYxOTg5MjEwMjU0MjIiLCJlbWFpbCI6ImN2c3Vkb3RtZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IndyemVXcXZPM0VRSHA0MkRhSHJzUWciLCJuYW1lIjoiQ3ZTVSBNZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKVHhPd1ZTbDE2Rk9xQ0V1WWlNQzM0cWl6b2tGTEFzU2Y1V2p3elktNWM9czk2LWMiLCJnaXZlbl9uYW1lIjoiQ3ZTVSIsImZhbWlseV9uYW1lIjoiTWUiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTcwMTA1MTk5NywiZXhwIjoxNzAxMDU1NTk3fQ.grxwFoHpXTtHEkSaaArlESqXnR0svaBOBMN_xLlS6Zg34F43zgrPaeeDtvG5PUebVkdimXAmTwRZAZuChZ-1zq_hQBAv_-rdxOfXPsyt5nnQtYGk-iytzzXmFj_9kk_aiLcFm7s4n-AyUaTQ03gyHM-hivyyfzsLR1tC_Aa-vjihFLTWgSC9760MvuEkmaYeJDV4aFyIZBymtyu1SHNDu0wZR2jPNQ5FqvQ_1N-w0PckL4JW0kwZ_ioe0vUduUc10oj128JqXlQ0Ooq6cGR1lo7n1sf-ns-F6uIX07nL2OTTQiUfOjtX_B4B_8dCTd8k_spIOlFfCgHCVZuHUHLnww',
//      expires_at: 1701055588
//    },
//    profile: {
//      iss: 'https://accounts.google.com',
//      azp: '493254517612-194pku9hhe40rgt3f10uqasthnc0lqe1.apps.googleusercontent.com',
//      aud: '493254517612-194pku9hhe40rgt3f10uqasthnc0lqe1.apps.googleusercontent.com',
//      sub: '116354056198921025422',
//      email: 'cvsudotme@gmail.com',
//      email_verified: true,
//      at_hash: 'wrzeWqvO3EQHp42DaHrsQg',
//      name: 'CvSU Me',
//      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJTxOwVSl16FOqCEuYiMC34qizokFLAsSf5WjwzY-5c=s96-c',
//      given_name: 'CvSU',
//      family_name: 'Me',
//      locale: 'en',
//      iat: 1701051997,
//      exp: 1701055597
//    }
//  }
//  "jwt🚀 ~ file: index.ts:58 ~ jwt props": {
//    token: {
//      name: 'CvSU Me',
//      email: 'cvsudotme@gmail.com',
//      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJTxOwVSl16FOqCEuYiMC34qizokFLAsSf5WjwzY-5c=s96-c',
//      sub: '116354056198921025422'
//    },
//    user: {
//      id: '116354056198921025422',
//      name: 'CvSU Me',
//      email: 'cvsudotme@gmail.com',
//      image: 'https://lh3.googleusercontent.com/a/ACg8ocJTxOwVSl16FOqCEuYiMC34qizokFLAsSf5WjwzY-5c=s96-c'
//    },
//    account: {
//      provider: 'google',
//      type: 'oidc',
//      providerAccountId: '116354056198921025422',
//      access_token: 'ya29.a0AfB_byCQ3cXf-9Xv3UI2NE_GeW9t_K4Tn0VBFxwiu3WxY9mgbXn5Fv40f5x46_CKu8YgRjDTJkO6WNNG99iCl0fXvuHDIiBiRb4ig0q6cz-FCaoSVM7S98bmeWh4oRabYt_75SvYjcWADvDopjRFhKXPZfqx6FIjwpoaCgYKAUESARASFQHGX2MiLXBULpRTlndoYU0Z9yQtLA0170',
//      expires_in: 3599,
//      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
//      token_type: 'bearer',
//      id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBlNzJkYTFkZjUwMWNhNmY3NTZiZjEwM2ZkN2M3MjAyOTQ3NzI1MDYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0OTMyNTQ1MTc2MTItMTk0cGt1OWhoZTQwcmd0M2YxMHVxYXN0aG5jMGxxZTEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0OTMyNTQ1MTc2MTItMTk0cGt1OWhoZTQwcmd0M2YxMHVxYXN0aG5jMGxxZTEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTYzNTQwNTYxOTg5MjEwMjU0MjIiLCJlbWFpbCI6ImN2c3Vkb3RtZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IndyemVXcXZPM0VRSHA0MkRhSHJzUWciLCJuYW1lIjoiQ3ZTVSBNZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKVHhPd1ZTbDE2Rk9xQ0V1WWlNQzM0cWl6b2tGTEFzU2Y1V2p3elktNWM9czk2LWMiLCJnaXZlbl9uYW1lIjoiQ3ZTVSIsImZhbWlseV9uYW1lIjoiTWUiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTcwMTA1MTk5NywiZXhwIjoxNzAxMDU1NTk3fQ.grxwFoHpXTtHEkSaaArlESqXnR0svaBOBMN_xLlS6Zg34F43zgrPaeeDtvG5PUebVkdimXAmTwRZAZuChZ-1zq_hQBAv_-rdxOfXPsyt5nnQtYGk-iytzzXmFj_9kk_aiLcFm7s4n-AyUaTQ03gyHM-hivyyfzsLR1tC_Aa-vjihFLTWgSC9760MvuEkmaYeJDV4aFyIZBymtyu1SHNDu0wZR2jPNQ5FqvQ_1N-w0PckL4JW0kwZ_ioe0vUduUc10oj128JqXlQ0Ooq6cGR1lo7n1sf-ns-F6uIX07nL2OTTQiUfOjtX_B4B_8dCTd8k_spIOlFfCgHCVZuHUHLnww',
//      expires_at: 1701055588
//    },
//    profile: {
//      iss: 'https://accounts.google.com',
//      azp: '493254517612-194pku9hhe40rgt3f10uqasthnc0lqe1.apps.googleusercontent.com',
//      aud: '493254517612-194pku9hhe40rgt3f10uqasthnc0lqe1.apps.googleusercontent.com',
//      sub: '116354056198921025422',
//      email: 'cvsudotme@gmail.com',
//      email_verified: true,
//      at_hash: 'wrzeWqvO3EQHp42DaHrsQg',
//      name: 'CvSU Me',
//      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJTxOwVSl16FOqCEuYiMC34qizokFLAsSf5WjwzY-5c=s96-c',
//      given_name: 'CvSU',
//      family_name: 'Me',
//      locale: 'en',
//      iat: 1701051997,
//      exp: 1701055597
//    },
//    isNewUser: undefined,
//    trigger: 'signIn'
//  }
//  "jwt🚀 ~ file: index.ts:58 ~ jwt props": {
//    token: {
//      name: 'CvSU Me',
//      email: 'cvsudotme@gmail.com',
//      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJTxOwVSl16FOqCEuYiMC34qizokFLAsSf5WjwzY-5c=s96-c',
//      sub: '116354056198921025422',
//      iat: 1701051989,
//      exp: 1703643989,
//      jti: 'cfd26bc6-c1ba-4112-876a-1a691d310e96'
//    },
//    session: undefined
//  }
//  "🚀 ~ file: index.ts:59 ~ session props": {
//    session: {
//      user: {
//      name: 'CvSU Me',
//      email: 'cvsudotme@gmail.com',
//      image: 'https://lh3.googleusercontent.com/a/ACg8ocJTxOwVSl16FOqCEuYiMC34qizokFLAsSf5WjwzY-5c=s96-c'
//    },
//    expires: '2023-12-27T02:26:29.109Z'
//  },
//    token: {
//      name: 'CvSU Me',
//      email: 'cvsudotme@gmail.com',
//      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJTxOwVSl16FOqCEuYiMC34qizokFLAsSf5WjwzY-5c=s96-c',
//      sub: '116354056198921025422',
//      iat: 1701051989,
//      exp: 1703643989,
//      jti: 'cfd26bc6-c1ba-4112-876a-1a691d310e96'
//    }
// }
