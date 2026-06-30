"use client";

import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DailyPoint {
  date: string;
  income: number;
  expense: number;
}

interface Props {
  chartData: DailyPoint[];
  totalBalance?: number;
}

const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value}`;
};

export function AnalyticsCharts({ chartData, totalBalance = 0 }: Props) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
  };

  const hasGrowth = chartData.length >= 2;
  const firstIncome = chartData[0]?.income || 0;
  const lastIncome = chartData[chartData.length - 1]?.income || 0;
  
  let growth: number | null = null;
  if (hasGrowth && firstIncome > 0) {
    growth = ((lastIncome - firstIncome) / firstIncome) * 100;
  }

  const balanceInDollars = totalBalance / 100;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">
              Cash Flow & Expenses
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track your daily income and spending trends over time
            </CardDescription>
          </div>
          <div className="text-right sm:text-left">
            <div className={`text-xl sm:text-2xl font-bold ${balanceInDollars >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balanceInDollars >= 0 ? '+' : '-'}₹{Math.abs(balanceInDollars).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Net Balance
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="w-full flex-1 min-h-[450px] overflow-x-auto">
          <div className="min-w-[300px] h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatDate}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="income"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatCurrency}
                  domain={[0, "auto"]}
                  tick={{ fill: "#22c55e", fontSize: 10 }}
                  width={50}
                />
                <YAxis
                  yAxisId="expense"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatCurrency}
                  domain={[0, "auto"]}
                  tick={{ fill: "#ef4444", fontSize: 10 }}
                  width={40}
                  interval="preserveStartEnd"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-md shadow-lg p-2 text-xs">
                          <p className="font-medium mb-1">
                            {formatDate(payload[0].payload.date)}
                          </p>
                          {payload.map((entry) => (
                            <p
                              key={entry.dataKey}
                              style={{ color: entry.color }}
                              className="flex items-center justify-between gap-4"
                            >
                              <span>{entry.name}:</span>
                              <span className="font-semibold">{formatCurrency(Number(entry.value ?? 0))}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  yAxisId="expense"
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorExpense)"
                  fillOpacity={1}
                />
                <Area
                  yAxisId="income"
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorIncome)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Income (₹)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Expense (₹)</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {growth !== null && (
              <>
                {growth >= 0 ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                ) : (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 rotate-180" />
                )}
                <span
                  className={
                    growth >= 0
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {growth >= 0 ? "+" : ""}
                  {growth.toFixed(1)}%
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
