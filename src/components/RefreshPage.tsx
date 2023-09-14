"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RefreshPage() {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);

  return null;
}
