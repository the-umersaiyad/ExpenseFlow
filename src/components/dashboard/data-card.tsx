import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DataCardProps extends React.ComponentProps<typeof Card> {
  variant?: "warm" | "cool" | "default"
  title?: string
}

export function DataCard({ variant = "default", title, className, children, ...props }: DataCardProps) {
  return (
    <Card 
      className={cn(
        variant === "warm" && "bg-[var(--color-apricot-wash)]",
        variant === "cool" && "bg-[var(--color-sky-wash)]",
        className
      )}
      {...props}
    >
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
