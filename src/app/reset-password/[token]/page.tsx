"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GridBackground } from "@/components/ui/GridBackground";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import Link from "next/link";
import { use } from 'react';

export default function ResetPasswordTokenPage({ params }: { params: { token: string } }) {
  // Access the token from params
  const {token} = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Verify token validity when component mounts
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reset-password-confirm/validate?token=${token}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.message || "Invalid or expired reset token");
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        setError("Error verifying reset token");
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reset-password-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Show success message
      setIsSuccess(true);
      toast.success("Your password has been reset successfully");
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);

    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password");
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GridBackground />
      </div>

      <main className="flex flex-1 items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <div className="w-full max-w-md mx-auto rounded-2xl p-3 md:p-6 shadow-input bg-white dark:bg-black min-h-0 relative">
            <div className="flex flex-col items-center justify-center">
              <div className="w-full sm:w-3/4 md:w-2/3 flex-col justify-center items-center flex">
                <Image
                  src="/logo/logo-big.png"
                  alt="Acero Logo"
                  width={500}
                  height={500}
                  className="w-[60%] md:w-[50%] h-auto object-contain relative z-10"
                  priority
                />
              </div>
            </div>
            
            {isLoading && (
              <div className="my-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            )}
            
            {!isLoading && error && !isSuccess && (
              <div className="my-8 text-center">
                <h2 className="text-xl font-semibold mb-2 text-red-600">Invalid Reset Link</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error || "This password reset link is invalid or has expired."}
                </p>
                <Link href="/resetPassword" className="text-blue-600 hover:text-blue-800 underline">
                  Request a new password reset link
                </Link>
              </div>
            )}

            {!isLoading && isSuccess ? (
              <div className="my-8 text-center">
                <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Password Reset Successful</h2>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                  Your password has been reset successfully. You will be redirected to the login page shortly.
                </p>
                <Link 
                  href="/" 
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            ) : (!isLoading && !error ? (
              <>
                <h2 className="text-xl font-semibold text-center mb-3 mt-4 text-gray-800 dark:text-gray-200 relative z-10">
                  Create New Password
                </h2>
                <p className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center px-2 relative z-10">
                  Enter your new password below
                </p>

                <form className="my-4 w-full px-2 md:px-4 relative z-10" onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col space-y-2 w-full mb-4">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="transition-colors duration-200 w-full z-10 relative"
                    />
                  </div>

                  <div className="flex flex-col space-y-2 w-full mb-4">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      placeholder="••••••••"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        password !== confirmPassword && confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : "",
                        "transition-colors duration-200 w-full z-10 relative"
                      )}
                    />
                    {password !== confirmPassword && confirmPassword && (
                      <span className="text-red-500 text-xs mt-1 animate-fadeIn">
                        Passwords do not match
                      </span>
                    )}
                  </div>

                  <Button
                    className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-9 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                    <BottomGradient />
                  </Button>

                  <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-4 h-[1px] w-full" />

                  <div className="flex justify-center">
                    <Link 
                      href="/" 
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </form>
              </>
            ) : null)}
          </div>
        </div>
      </main>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};
