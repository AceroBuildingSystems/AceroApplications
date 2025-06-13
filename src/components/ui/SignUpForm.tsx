"use client";
import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { Label } from "./label";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import {
  IconBrandWindowsFilled,
} from "@tabler/icons-react";
import { Button } from "./button";
import { signIn } from "next-auth/react";
import { toast } from "react-toastify";
import Image from "next/image";

interface FormErrors {
  email?: string;
  password?: string;
}

export function SignupForm({ setCustomLoadingState }: { setCustomLoadingState: (state: boolean) => void }) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    return {
      email: Cookies.get('login_email') || '',
      password: ''  // Never store password
    };
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return 'Invalid email address';
        }
        return '';
      case 'password':
        if (!value.trim()) return 'Password is required';
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
    const fieldName = id === 'email' ? 'email' : 'password';

    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Save email to cookie whenever it changes (never save password)
    if (fieldName === 'email') {
      // Set cookie to expire in 4 weeks
      Cookies.set('login_email', value, { expires: 28 });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id } = e.target;
    const fieldName = id === 'email' ? 'email' : 'password';

    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, provider: string): Promise<void> => {
    e.preventDefault();
    
    // Set local loading state
    setIsLoading(true);

    if (provider === "azure-ad") {
      setCustomLoadingState(true);
      const result = await signIn(provider, { callbackUrl: "/dashboard", redirect: false });
      if (result?.error) {
        setCustomLoadingState(false);
        setIsLoading(false);
        toast.error("Please contact the admin to sign up");
      }
      return
    }

    setTouched({
      email: true,
      password: true
    });

    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    const newErrors = {
      email: emailError,
      password: passwordError
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (emailError || passwordError) {
      setIsLoading(false);
      toast.error("Please fill in all the required fields");
      return;
    }

    setCustomLoadingState(true);
    
    // Use form data to ensure proper password manager integration
    const formElement = e.target as HTMLFormElement;
    const emailInput = formElement.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = formElement.querySelector('input[name="password"]') as HTMLInputElement;
    
    // This ensures browser password managers can properly detect the successful login
    const result = await signIn(provider, {
      email: emailInput.value,
      password: passwordInput.value,
      redirect: false,
      callbackUrl: "/dashboard" // Add redirect URL for successful login
    });

    if (result?.error) {
      setCustomLoadingState(false);
      setIsLoading(false);
      toast.error("Invalid credentials or contact the admin to sign up");
      return;
    } else if (result?.url) {
      // On success, redirect to ensure password manager captures the successful login
      window.location.href = result.url;
    }
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl p-3 md:p-6 shadow-input bg-white dark:bg-black min-h-0 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-80 border border-neutral-200 dark:border-neutral-800 animate-fade-in">
      <div className="flex flex-col items-center justify-center">
        <div className="w-full sm:w-3/4 md:w-2/3 flex-col justify-center items-center flex">
          <Image
            src="/logo/logo-big.png"
            alt="Acero Logo"
            width={500}
            height={500}
            className="w-[60%] md:w-[50%] h-auto object-contain animate-logo-entrance"
            priority
          />
        </div>
      </div>
      <p data-test="signup-message" className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center px-2">
        Please contact the admin if you are signing up for the first time
      </p>

      <form className="my-4 w-full px-2 md:px-4" method="post" onSubmit={(e)=>handleSubmit(e,"credentials")} name="loginForm">
        <LabelInputContainer className="mb-3">
          <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-200 font-medium">Email Address</Label>
          <Input 
            id="email" 
            name="email"
            placeholder="projectmayhem@fc.com" 
            type="email"
            autoComplete="username email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={cn(
              errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'focus:border-primary/50 hover:border-neutral-300 dark:hover:border-neutral-500',
              'transition-all duration-200 w-full bg-neutral-50 dark:bg-neutral-900/50 rounded-md'
            )}
          />
          {errors.email && touched.email && (
            <span className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.email}</span>
          )}
        </LabelInputContainer>

        <LabelInputContainer className="mb-3">
          <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-200 font-medium">Password</Label>
          <div className="relative w-full">
            <Input 
              id="password" 
              name="password"
              placeholder="********" 
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={cn(
                errors.password && touched.password ? 'border-red-500 focus:border-red-500' : 'focus:border-primary/50 hover:border-neutral-300 dark:hover:border-neutral-500',
                'transition-all duration-200 w-full bg-neutral-50 dark:bg-neutral-900/50 rounded-md pr-10'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-neutral-100 transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && touched.password && (
            <span className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.password}</span>
          )}
        </LabelInputContainer>

        {/* Add Forgot Password link here */}
        <div className="flex justify-end mb-4">
          <a 
            href="/resetPassword" 
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <Button
          className="bg-gradient-to-br relative group/btn from-primary/90 dark:from-primary/80 dark:to-primary-dark/80 to-primary-dark/90 block w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_rgba(255,255,255,0.2)_inset,0px_-1px_0px_0px_rgba(255,255,255,0.1)_inset,0px_0px_10px_rgba(0,0,0,0.1)] dark:shadow-[0px_1px_0px_0px_rgba(255,255,255,0.1)_inset,0px_-1px_0px_0px_rgba(255,255,255,0.05)_inset,0px_0px_10px_rgba(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0px_0px_0px_1px_rgba(255,255,255,0.2)_inset,0px_0px_15px_rgba(120,120,250,0.3)]"
          type="submit"
          name="login"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <>Log In &rarr;</>
          )}
          <BottomGradient />
        </Button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-6 h-[1px] w-full" />

        <div className="flex flex-col space-y-4">
          <button
            className="relative group/btn flex space-x-2 justify-center items-center px-4 w-full rounded-md h-10 font-medium transition-all duration-300
            bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40
            hover:shadow-md hover:from-blue-100 hover:to-blue-50 dark:hover:from-blue-900/50 dark:hover:to-blue-800/50
            border border-blue-200/50 dark:border-blue-800/50"
            onClick={() => {
              setIsLoading(true);
              setCustomLoadingState(true);
              signIn("azure-ad", { callbackUrl: "/dashboard" });
            }}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <>
                <IconBrandWindowsFilled className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-blue-700 dark:text-blue-300 text-sm">
                  SSO with Microsoft
                </span>
              </>
            )}
            <BottomGradient />
          </button>
        </div>
      </form>
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
