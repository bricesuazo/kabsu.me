import { auth } from "@clerk/nextjs";

export default function Home() {
  const { userId } = auth();
  if (!userId)
    return (
      <div className="container">
        <h1>Home</h1>
        <p>Not logged in.</p>
      </div>
    );

  return (
    <div className="container">
      <h1>Welcome to CvSU.me</h1>
    </div>
  );
}
