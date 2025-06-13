"use client";

import { FC, useState } from "react";
import { GridBackground } from "@/components/ui/GridBackground";
import { SignupForm } from "@/components/ui/SignUpForm";
import AuthComponent from "@/components/AuthComponent/AuthComponent";
import Image from "next/image";

const LoginPage: FC = () => {
  const [customLoadingState, setCustomLoadingState] = useState(false);

  return (
    <AuthComponent loadingState={customLoadingState}>
      <section className="h-screen w-screen flex gap-2 overflow-hidden">
        <GridBackground>
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative">
            {/* Add decorative elements */}
            <div className="absolute top-8 left-8 animate-float hidden md:block">
              <Image 
                src="/globe.svg" 
                alt="Decorative element" 
                width={60} 
                height={60}
                className="opacity-40 dark:opacity-20"
              />
            </div>
            <div className="absolute bottom-8 right-8 animate-float-delayed hidden md:block">
              <Image 
                src="/window.svg" 
                alt="Decorative element" 
                width={60} 
                height={60}
                className="opacity-40 dark:opacity-20"
              />
            </div>
            
            {/* Main content */}
            <div className="w-full md:w-2/3 lg:w-1/3 h-full flex-col justify-center items-center flex md:mr-10">
              <SignupForm setCustomLoadingState={setCustomLoadingState} />
            </div>
          </div>
        </GridBackground>
      </section>
    </AuthComponent>
  );
};

export default LoginPage;
