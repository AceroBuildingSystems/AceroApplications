// This is a simplified version of shadcn/ui toast component
import { useState, useEffect } from 'react'

export type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

type ToastActionType = (props: ToastProps) => void

// Toast context to be used globally
const toastStorage: {
  toasts: ToastProps[]
  addToast: ToastActionType
  removeToast: (index: number) => void
} = {
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
}

export function toast(props: ToastProps) {
  toastStorage.addToast(props)
  // Auto-remove toast after 5 seconds
  setTimeout(() => {
    const index = toastStorage.toasts.findIndex(
      (toast) => toast.title === props.title && toast.description === props.description
    )
    if (index !== -1) {
      toastStorage.removeToast(index)
    }
  }, 5000)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  useEffect(() => {
    // Setup toast storage functions
    toastStorage.addToast = (props: ToastProps) => {
      setToasts((prev) => [...prev, props])
    }

    toastStorage.removeToast = (index: number) => {
      setToasts((prev) => prev.filter((_, i) => i !== index))
    }

    return () => {
      // Reset toast storage functions
      toastStorage.addToast = () => {}
      toastStorage.removeToast = () => {}
    }
  }, [])

  return {
    toasts,
    toast,
    dismiss: (index: number) => toastStorage.removeToast(index),
  }
} 