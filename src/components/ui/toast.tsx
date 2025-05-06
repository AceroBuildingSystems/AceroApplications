import React from 'react'
import { ToastProps } from './use-toast'
import { X } from 'lucide-react'

interface ToastComponentProps extends ToastProps {
  onDismiss: () => void
}

export function Toast({ title, description, variant = 'default', onDismiss }: ToastComponentProps) {
  const variantClasses = {
    default: 'bg-white border-gray-200',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  }

  return (
    <div
      className={`p-4 rounded-md shadow-md border ${variantClasses[variant]} flex items-start justify-between`}
      role="alert"
    >
      <div>
        {title && <h4 className="font-medium text-sm">{title}</h4>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="ml-4 p-1 rounded-full hover:bg-gray-100"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, dismiss }: { toasts: ToastProps[]; dismiss: (index: number) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map((toast, index) => (
        <Toast key={index} {...toast} onDismiss={() => dismiss(index)} />
      ))}
    </div>
  )
} 