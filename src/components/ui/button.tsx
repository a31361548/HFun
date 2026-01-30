import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-base font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-background text-primary shadow-clay-out hover:text-primary-dark active:shadow-clay-active",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-dark shadow-[6px_6px_12px_rgba(255,140,148,0.4),-6px_-6px_12px_rgba(255,255,255,0.8)] active:shadow-clay-active",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 shadow-[6px_6px_12px_rgba(252,129,129,0.4),-6px_-6px_12px_rgba(255,255,255,0.8)] active:shadow-clay-active",
        outline:
          "border-2 border-primary/20 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-clay-out hover:bg-secondary/80 active:shadow-clay-active",
        ghost:
          "hover:bg-muted/50 text-muted-foreground hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4 text-sm",
        lg: "h-14 rounded-2xl px-8 text-lg",
        icon: "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
