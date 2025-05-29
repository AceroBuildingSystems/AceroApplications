"use client";
import { useState } from "react";
import { ResetPasswordForm } from "@/components/ui/ResetPasswordForm";
import { GridBackground } from "@/components/ui/GridBackground";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setCustomLoadingState = (state: boolean) => {
    setIsLoading(state);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GridBackground />
      </div>

      <main className="flex flex-1 items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <ResetPasswordForm setCustomLoadingState={setCustomLoadingState} />
        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
}
