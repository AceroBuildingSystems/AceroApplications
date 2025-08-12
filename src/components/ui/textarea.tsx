import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
                    `flex min-h-[60px] gap-2 py-2 items-center h-[35px] w-full border-2 border-gray-300 bg-white dark:bg-zinc-800 
             text-black dark:text-white rounded-md px-2 text-sm 
             focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-neutral-600
             transition duration-300`
                  ,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }