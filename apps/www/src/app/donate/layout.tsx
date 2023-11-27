import React from "react";
import Header from "@/components/header";

export default function layout({ children }: React.PropsWithChildren) {
  return (
    <div className="container min-h-screen border-x p-0">
      <div className="sticky top-0 z-50 border-b">
        <Header />
      </div>
      {children}
    </div>
  );
}
