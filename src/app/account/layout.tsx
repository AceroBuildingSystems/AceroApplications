"use client";

import { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {children}
    </main>
  );
}
