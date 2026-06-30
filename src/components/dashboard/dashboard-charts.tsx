"use client"

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

export function CashFlowChart({ data }: { data: any[] }) {
  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(var(--primary))",
    },
    expense: {
      label: "Expense",
      color: "hsl(var(--destructive))",
    },
  } satisfies ChartConfig

  if (data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

export function CategoryPieChart({ data }: { data: any[] }) {
  const chartConfig = {
    value: {
      label: "Amount",
    }
  } satisfies ChartConfig

  // Generate dynamic colors for pie slices
  const COLORS = ['#006591', '#0ea5e9', '#6cf8bb', '#006c49', '#b91a24', '#ff6c66', '#3e4850'];

  if (data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  )
}
