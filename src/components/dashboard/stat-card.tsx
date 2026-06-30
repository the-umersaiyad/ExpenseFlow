import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.ComponentProps<typeof Card> {
  title: string
  value: string
  delta?: string
  deltaType?: "positive" | "negative" | "neutral"
}

export function StatCard({ title, value, delta, deltaType = "neutral", className, ...props }: StatCardProps) {
  return (
    <Card className={cn("p-6", className)} {...props}>
      <CardContent className="p-0 flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h3 className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</h3>
          {delta && (
            <span className={cn(
              "text-sm font-medium",
              deltaType === "positive" && "text-[#16a34a]",
              deltaType === "negative" && "text-[#ef4444]",
              deltaType === "neutral" && "text-muted-foreground"
            )}>
              {deltaType === "positive" ? "↑" : deltaType === "negative" ? "↓" : ""} {delta}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
