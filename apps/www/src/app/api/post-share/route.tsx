/* eslint-disable @next/next/no-img-element */
import type { z } from "zod";
import { ImageResponse } from "@vercel/og";

import { PostShareSchema } from "~/schema";

export const runtime = "edge";

const COLORS = {
  primary: "#16a34a",
  primaryDark: "#007205",
  border: "#e4e4e7",
  borderDark: "#27272a",
  muted: "#f4f4f5",
  mutedDark: "#262626",
  mutedForeground: "#71717a",
  mutedForegroundDark: "#a1a1aa",
};

function getColors(theme: z.infer<typeof PostShareSchema>["theme"]) {
  return theme === "light"
    ? {
        primary: COLORS.primary,
        border: COLORS.border,
        muted: COLORS.muted,
        mutedForeground: COLORS.mutedForeground,
      }
    : {
        primary: COLORS.primaryDark,
        border: COLORS.borderDark,
        muted: COLORS.mutedDark,
        mutedForeground: COLORS.mutedForegroundDark,
      };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const data = PostShareSchema.parse(
    Object.fromEntries(searchParams.entries()),
  );

  const [openSansRegular, openSansBold, openSansSemiBold] = await Promise.all([
    fetch(
      new URL(
        "../../../../public/fonts/open-sans/OpenSans-Regular.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../public/fonts/open-sans/OpenSans-Bold.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer()),
    fetch(
      new URL(
        "../../../../public/fonts/open-sans/OpenSans-SemiBold.ttf",
        import.meta.url,
      ),
    ).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 40,
          paddingBottom: 40,
          paddingLeft: 80,
          paddingRight: 80,
          gap: 40,
          width: "100%",
          height: "100%",
          flex: 1,
          backgroundColor: getColors(data.theme).primary,
        }}
      >
        {/* <img
          width={720}
          height={720}
          src={`https://github.com/bricesuazo.png`}
          style={{ position: "absolute", top: 0, right: 0 }}
        /> */}
        <img
          width={data.ratio === "portrait" ? 120 : 100}
          height={data.ratio === "portrait" ? 120 : 100}
          src="https://kabsu.me/logo.svg"
        />

        <div
          style={{
            padding: 40,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            backgroundColor: data.theme === "light" ? "white" : "#121212",
            color: data.theme === "light" ? "black" : "white",
            borderRadius: 20,
            maxWidth: 1080,
            gap: 20,
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <img
              width={80}
              height={80}
              src={data.image}
              style={{ borderRadius: "50%" }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <h1
                  style={{
                    fontFamily: '"Open Sans - Bold"',
                    fontSize: "2rem",
                    fontWeight: "bold",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {data.name}
                </h1>

                {data.verified && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={getColors(data.theme).primary}
                    width={32}
                    height={32}
                  >
                    <path d="M19.965 8.521C19.988 8.347 20 8.173 20 8c0-2.379-2.143-4.288-4.521-3.965C14.786 2.802 13.466 2 12 2s-2.786.802-3.479 2.035C6.138 3.712 4 5.621 4 8c0 .173.012.347.035.521C2.802 9.215 2 10.535 2 12s.802 2.785 2.035 3.479A3.976 3.976 0 0 0 4 16c0 2.379 2.138 4.283 4.521 3.965C9.214 21.198 10.534 22 12 22s2.786-.802 3.479-2.035C17.857 20.283 20 18.379 20 16c0-.173-.012-.347-.035-.521C21.198 14.785 22 13.465 22 12s-.802-2.785-2.035-3.479zm-9.01 7.895-3.667-3.714 1.424-1.404 2.257 2.286 4.327-4.294 1.408 1.42-5.749 5.706z"></path>
                  </svg>
                )}

                <p
                  style={{
                    fontSize: "1rem",
                    margin: 0,
                  }}
                >
                  •
                </p>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    margin: 0,
                    color: getColors(data.theme).mutedForeground,
                  }}
                >
                  {data.created_at}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <p
                  style={{
                    fontSize: "1.5rem",
                    color: getColors(data.theme).mutedForeground,
                    margin: 0,
                  }}
                >
                  @{data.username}
                </p>

                <p
                  style={{
                    fontFamily: '"Open Sans - Semi Bold"',
                    paddingTop: 2,
                    paddingBottom: 2,
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontSize: "1.25rem",
                    backgroundColor: getColors(data.theme).primary,
                    borderRadius: "2rem",
                    color: data.theme === "light" ? "white" : "black",
                    margin: 0,
                  }}
                >
                  {data.campus.toUpperCase()}
                </p>
                <p
                  style={{
                    fontFamily: '"Open Sans - Semi Bold"',
                    paddingTop: 2,
                    paddingBottom: 2,
                    paddingLeft: 16,
                    paddingRight: 16,
                    fontSize: "1.25rem",
                    borderRadius: "2rem",
                    borderWidth: 2,
                    borderColor: getColors(data.theme).border,
                    margin: 0,
                  }}
                >
                  {data.program.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <p
              style={{
                flex: 1,
                fontSize: data.ratio === "portrait" ? "2.5rem" : "2rem",
                margin: 0,
              }}
            >
              {data.content}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke={getColors(data.theme).mutedForeground}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <p style={{ fontSize: "1.5rem", margin: 0 }}>{data.likes}</p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke={getColors(data.theme).mutedForeground}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              <p style={{ fontSize: "1.5rem", margin: 0 }}>{data.comments}</p>
            </div>
            <div
              style={{
                display: "flex",
                paddingTop: 4,
                paddingBottom: 4,
                paddingLeft: 16,
                paddingRight: 16,
                borderRadius: "2rem",
                borderWidth: 2,
                borderColor: getColors(data.theme).border,
              }}
            >
              <p style={{ fontSize: "1.5rem", margin: 0 }}>
                Privacy:{" "}
                {data.privacy === "following"
                  ? "Follower"
                  : data.privacy.charAt(0).toUpperCase() +
                    data.privacy.slice(1)}
              </p>
            </div>
          </div>
        </div>
        <h2
          style={{
            fontFamily: '"Open Sans - Bold',
            fontSize: data.ratio === "portrait" ? "2.5rem" : "2rem",
            color: "white",
            margin: 0,
          }}
        >
          Kabsu.me
        </h2>
      </div>
    ),
    {
      width: data.ratio === "square" || data.ratio === "portrait" ? 1080 : 1920,
      height:
        data.ratio === "square" || data.ratio === "landscape" ? 1080 : 1920,
      debug: true,
      fonts: [
        {
          name: "Open Sans",
          data: openSansRegular,
          style: "normal",
        },
        {
          name: "Open Sans - Bold",
          data: openSansBold,
          style: "normal",
        },
        {
          name: "Open Sans - Semi Bold",
          data: openSansSemiBold,
          style: "normal",
        },
        // {
        //   name: "Poppins-Regular",
        //   data: poppinsRegular,
        //   style: "normal",
        // },
        // {
        //   name: "Poppins-SemiBold",
        //   data: poppinsSemiBold,
        //   style: "normal",
        // },
      ],
    },
  );
}
