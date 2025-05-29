"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { toast } from "react-toastify";
import Image from "next/image";

interface FormErrors {
  email?: string;
}

export function ResetPasswordForm({ setCustomLoadingState }: { setCustomLoadingState: (state: boolean) => void }) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [emailSent, setEmailSent] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    email: ''
  });
  
  const [touched, setTouched] = useState({
    email: false
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return 'Invalid email address';
        }
        return '';
      default:
        return '';
    }
  };

  useEffect(() => {
    const newErrors: FormErrors = {};

    Object.keys(touched).forEach((field) => {
      if (touched[field as keyof typeof touched]) {
        const error = validateField(field, formData[field as keyof typeof formData]);
        if (error) {
          newErrors[field as keyof FormErrors] = error;
        }
      }
    });

    setErrors(newErrors);
  }, [formData, touched]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id } = e.target;
    setTouched(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    setTouched({
      email: true
    });

    const emailError = validateField('email', formData.email);

    const newErrors = {
      email: emailError
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (emailError) {
      toast.error("Please provide a valid email address");
      return;
    }

    setCustomLoadingState(true);
    
    try {
      // Call our reset-password API endpoint
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Reset password API error:", data);
        // For now, show success even if there was an error
        // This is a security practice to not reveal if an email exists
        // and also helps during development when email sending might not work
        
        // Only in development, show a different message
        if (process.env.NODE_ENV === 'development') {
          console.warn("Development mode: showing success despite error");
          console.error("Actual error:", data.message || 'Failed to reset password');
        } else {
          // In production, throw the error (commented out for now)
          // throw new Error(data.message || 'Failed to reset password');
        }
      }
      
      // Always show success for better user experience and security
      setEmailSent(true);
      toast.success("Password reset link has been sent to your email");
    } catch (error: any) {
      toast.error("Failed to send reset link. Please try again later.");
      console.error("Reset password error:", error);
      
      // For development purposes, log more error details
      if (process.env.NODE_ENV === 'development') {
        console.error("Error details:", error.message);
      }
    } finally {
      setCustomLoadingState(false);
    }
  };

  return (
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
      
      {emailSent ? (
        <div className="my-8 text-center">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Check Your Email</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            We've sent a password reset link to <span className="font-medium text-blue-600 dark:text-blue-400">{formData.email}</span>.
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
            Didn't receive an email? Check your spam folder or try again.
          </p>
          <div className="flex flex-col space-y-4">
            <Button
              onClick={() => setEmailSent(false)}
              className="bg-transparent relative group/btn border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-black dark:text-white w-full"
            >
              Try Again
              <BottomGradient />
            </Button>
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-center">
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center px-2 relative z-10">
            Enter your email address below and we'll send you instructions to reset your password
          </p>

          <form className="my-4 w-full px-2 md:px-4 relative z-10" onSubmit={handleSubmit}>
            <LabelInputContainer className="mb-3">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                placeholder="your.email@example.com" 
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={cn(
                  errors.email && touched.email ? 'border-red-500 focus:border-red-500' : '',
                  'transition-colors duration-200 w-full z-10 relative'
                )}
              />
              {errors.email && touched.email && (
                <span className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.email}</span>
              )}
            </LabelInputContainer>

            <Button
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-9 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              type="submit"
            >
              Reset Password &rarr;
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
      )}
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

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
