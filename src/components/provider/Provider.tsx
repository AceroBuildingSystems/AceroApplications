'use client'

import { SessionProvider } from "next-auth/react"
import { store } from "@/store"
import { Provider as ReduxProvider } from "react-redux"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ToastProvider } from "@/components/ui/toast-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ProviderProps {
  children: React.ReactNode
}

// Create a client
const queryClient = new QueryClient()

export default function Provider({ children }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ReduxProvider store={store}>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </ReduxProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
