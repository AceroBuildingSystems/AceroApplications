import useUserAuthorised from '@/hooks/useUserAuthorised';
import Loader from '../ui/Loader';
import React from 'react'
import { redirect, usePathname } from 'next/navigation';

const AuthComponent = ({children, loadingState}:{children:React.ReactNode, loadingState:boolean}) => {
    const { authenticated, status } = useUserAuthorised();
    const pathName = usePathname();

    if (!authenticated && status === "unauthenticated" && pathName !== "/") {
        return redirect("/");
    }

    if (authenticated && status === "authenticated" && pathName !== "/dashboard") {
      return redirect("/dashboard");
    }

  return (
    <Loader loading={!authenticated && status === "loading" || loadingState}>
      {children}
    </Loader>
  )
}

export default AuthComponent