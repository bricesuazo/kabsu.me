"use client";

import { PenSquare } from "lucide-react";
import { Button } from "./ui/button";

export default function ProfileButton({ isSameUser }: { isSameUser: boolean }) {
  if (isSameUser)
    return (
      <Button variant="secondary">
        <PenSquare size="1rem" className="mr-2" />
        Edit profile
      </Button>
    );

  return <Button variant="secondary">Follow</Button>;
}
