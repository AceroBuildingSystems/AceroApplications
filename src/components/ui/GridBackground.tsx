import { cn } from "@/lib/utils";
import React from "react";

export function GridBackground({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className="h-full w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className={cn("text-4xl w-full sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8", className)}>
        {children}
      </div>
    </div>
  );
}
