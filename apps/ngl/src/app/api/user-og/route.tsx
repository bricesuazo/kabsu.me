import { ImageResponse } from "next/og";
import { z } from "zod";

const UserSchema = z.object({
  username: z.string().default("Alexis Ken Alvarez"),
});

export const runtime = "edge";

function getColors() {
  return {
    bgPrimary: "#26C45D",
    bgSecondary: "#9DD45A",
    primary: "#23C45E",
    secondary: "#72C20F",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = UserSchema.parse(Object.fromEntries(searchParams.entries()));

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
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.8rem",
          background: "white",
        }}
      >
        <svg
          width="218"
          height="141"
          viewBox="0 0 218 141"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.6816 60.8841C12.6816 73.6444 17.7506 85.882 26.7735 94.9048C35.7963 103.928 48.034 108.997 60.7942 108.997C78.5738 109.659 95.5752 116.459 108.907 128.242C122.238 116.459 139.24 109.659 157.019 108.997C169.78 108.997 182.017 103.928 191.04 94.9048C200.063 85.882 205.132 73.6444 205.132 60.8841V12.7715H157.019C139.24 13.4338 122.238 20.2343 108.907 32.0166C95.5752 20.2343 78.5738 13.4338 60.7942 12.7715H12.6816V60.8841Z"
            stroke="#23C45E"
            stroke-width="24"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M51.1719 51.2616C65.6056 51.2616 80.0394 56.0729 80.0394 70.5066C60.7944 70.5066 51.1719 70.5066 51.1719 51.2616ZM166.642 51.2616C152.208 51.2616 137.775 56.0729 137.775 70.5066C157.02 70.5066 166.642 70.5066 166.642 51.2616Z"
            stroke="#23C45E"
            stroke-width="24"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontWeight: "bold",
              fontFamily: '"Open Sans - Bold"',
              fontSize: "3.5rem",
              textAlign: "center",

              color: getColors().primary,
            }}
          >
            ngl.kabsu.me
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: getColors().primary,
              borderRadius: "1.5rem",
              padding: "1px 2.5rem 1px 2.5rem",
              boxShadow: "5px 5px 10px rgba(0,0,0,0.2)",
            }}
          >
            <h1
              style={{
                fontWeight: "bold",
                fontFamily: '"Open Sans - Bold"',
                fontSize: "3rem",
                textAlign: "center",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                color: "white",
                maxWidth: "900px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              /{data.username}
            </h1>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 675,
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
      ],
    },
  );
}
