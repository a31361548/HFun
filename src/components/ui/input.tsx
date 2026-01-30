import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-2xl border-none bg-background px-4 py-2 text-base shadow-clay-in outline-none transition-all placeholder:text-muted-foreground focus-visible:shadow-[inset_8px_8px_16px_#D1D9E6,inset_-8px_-8px_16px_#FFFFFF] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
