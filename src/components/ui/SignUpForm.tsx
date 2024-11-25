"use client";
import React, { useState, useEffect } from "react";
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
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function SignupForm({onSubmit, setCustomLoadingState}: {onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, setCustomLoadingState: (state: boolean) => void}) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        return !value.trim() ? 'First name is required' : '';
      case 'lastName':
        return !value.trim() ? 'Last name is required' : '';
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
    const fieldName = id === 'firstname' ? 'firstName' : id === 'lastname' ? 'lastName' : 'email';
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id } = e.target;
    const fieldName = id === 'firstname' ? 'firstName' : id === 'lastname' ? 'lastName' : 'email';
    
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();    

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true
    });

    if(formData.firstName === "" || formData.lastName === "" || formData.email === "") {
      toast.error("Please fill in all fields correctly");
      return;
    }

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error);
    if (hasErrors) {
      toast.error("Please fill in all fields correctly");
    } else {
      onSubmit(e);
    }
  }

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <div className="flex flex-col items-center justify-center">

        
        <div className="w-2/3 h-full flex-col justify-center items-center flex">
            <Image
          src="/logo/logo-big.png"
          alt="Acero Logo"
          width={500}
          height={500}
          style={{ width: "70%", height: "auto" }} 
            />
          </div>
      </div>
      <p className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300 ">
        Please contact the admin if you are signing up for the first time
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input 
              id="firstname" 
              placeholder="Tyler" 
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={cn(
                errors.firstName && touched.firstName ? 'border-red-500 focus:border-red-500' : '',
                'transition-colors duration-200'
              )}
            />
            {errors.firstName && touched.firstName && (
              <span className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.firstName}</span>
            )}
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input 
              id="lastname" 
              placeholder="Durden" 
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={cn(
                errors.lastName && touched.lastName ? 'border-red-500 focus:border-red-500' : '',
                'transition-colors duration-200'
              )}
            />
            {errors.lastName && touched.lastName && (
              <span className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.lastName}</span>
            )}
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            placeholder="projectmayhem@fc.com" 
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={cn(
              errors.email && touched.email ? 'border-red-500 focus:border-red-500' : '',
              'transition-colors duration-200'
            )}
          />
          {errors.email && touched.email && (
            <span className="text-red-500 text-xs mt-1 animate-fadeIn">{errors.email}</span>
          )}
        </LabelInputContainer>

        <Button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Sign up &rarr;
          <BottomGradient />
        </Button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        <div className="flex flex-col space-y-4">
          <button
            className=" relative group/btn flex space-x-2 justify-center items-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            onClick={() => {
              setCustomLoadingState(true);
              signIn("azure-ad", { callbackUrl: "/dashboard" });
            }}
            type="button"
          >
            <IconBrandWindowsFilled className="h-4 w-4 text-neutral-800 dark:text-neutral-300 flex justify-center items-center" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              SSO with outlook
            </span>
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
