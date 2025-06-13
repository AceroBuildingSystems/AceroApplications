import { cn } from "@/lib/utils";
import React from "react";

export function GridBackground({ className, children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className="h-full w-full dark:bg-black bg-white dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 animate-gradient-shift"></div>
      
      {/* Mask for grid */}
      <div className="absolute inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      {/* Subtle animated orb in background */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl opacity-30 -top-20 -right-20 animate-orb-float"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 blur-3xl opacity-20 -bottom-20 -left-20 animate-orb-float-delayed"></div>
      
      {children && (
        <div className={cn("text-4xl w-full sm:text-7xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8", className)}>
          {children}
        </div>
      )}
    </div>
  );
}
