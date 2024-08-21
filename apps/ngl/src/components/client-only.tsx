"use client";

import { useEffect, useState } from "react";

export default function ClientOnly({ children }: React.PropsWithChildren) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? children : null;
}
