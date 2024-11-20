"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { FC } from "react";

const LoginPage: FC = () => {
  const { data: session } = useSession();

  console.log(session);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {!session ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Acero</h2>
            <p className="text-gray-600 mb-8">Please sign in to continue</p>
            <button
              onClick={() => signIn("azure-ad")}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 15a7 7 0 110-14 7 7 0 010 14z"/>
              </svg>
              Sign in with Microsoft
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {session.user?.name}
            </h2>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
