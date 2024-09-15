"use client";

import React from "react";
import { PhotoProvider } from "react-photo-view";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <PhotoProvider>{children}</PhotoProvider>;
}
