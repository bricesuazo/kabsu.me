import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>CvSU.me | CvSU Information Center</title>
        <meta
          name="description"
          content="Cavite State University Information Center"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
