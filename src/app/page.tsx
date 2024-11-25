"use client";

import { FC, useState } from "react";
import { GridBackground } from "@/components/ui/GridBackground";
import { SignupForm } from "@/components/ui/SignUpForm";
import AuthComponent from "@/components/AuthComponent/AuthComponent";



const LoginPage: FC = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setCustomLoadingState(true);
    e.preventDefault();
    console.log("Form submitted");
  };

  const [customLoadingState, setCustomLoadingState] = useState(false);

  return (
    <AuthComponent loadingState={customLoadingState}>
    <section className="h-screen w-screen flex gap-2 overflow-hidden">
      <GridBackground >
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="w-1/3 h-full flex-col justify-center items-center flex mr-10">
            <SignupForm onSubmit={handleSubmit} setCustomLoadingState={setCustomLoadingState} />
          </div>
        </div>
      </GridBackground>
      </section>
    </AuthComponent>
  );
};

export default LoginPage;
