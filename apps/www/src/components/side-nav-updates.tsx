import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "./ui/button";

export default function SideNavUpdates() {
  return (
    <div className="sticky top-0 w-full max-w-sm pr-4">
      <div className="w-full space-y-4 p-4">
        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-lg">New feature!</CardTitle>
            <CardDescription>Messaging is now live!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Introducing our exclusive messaging feature for Cavite State
              University, connecting students, alumni, and staff seamlessly.
            </p>
            <Button>Try now</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-lg">Suggested users</CardTitle>
            <CardDescription>Discover people</CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button variant="link" className="p-0 text-xs">
            <Link href="">Terms of Service</Link>
          </Button>
          <Button variant="link" className="p-0 text-xs">
            <Link href="">Privacy Policy</Link>
          </Button>
          <p className="text-xs text-muted-foreground">© 2023 CvSU.me</p>
        </div>
      </div>
    </div>
  );
}
