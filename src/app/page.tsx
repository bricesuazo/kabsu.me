import { ToggleTheme } from "@/components/toggle-theme";
import { SignIn, auth } from "@clerk/nextjs";

export default function Home() {
  const { userId } = auth();

  return (
    <div className="container">
      <ToggleTheme />
      {userId ? <h1>Welcome to CvSU.me</h1> : <SignIn routing="hash" />}
    </div>
  );
}
