'use client'

import { SessionProvider } from "next-auth/react"
import { store } from "@/store"
import { Provider as ReduxProvider } from "react-redux"
import { ToastContainer } from "react-toastify"

interface ProviderProps {
  children: React.ReactNode
}

export default function Provider({ children }: ProviderProps) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        {children}
        <ToastContainer />
      </ReduxProvider>
    </SessionProvider>
  )
}
