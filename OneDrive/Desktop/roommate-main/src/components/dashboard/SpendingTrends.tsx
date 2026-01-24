import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Expense, Member } from "@/hooks/useHostel";
import { format, parseISO, startOfDay, startOfWeek } from "date-fns";

interface SpendingTrendsProps {
  expenses: Expense[];
  members: Member[];
  allExpenses: Expense[];
}

type TimeGranularity = "daily" | "weekly";

export const SpendingTrends = ({ expenses, members, allExpenses }: SpendingTrendsProps) => {
  const [granularity, setGranularity] = useState<TimeGranularity>("daily");

  // Group expenses by time period
  const groupByTimeGranularity = (exps: Expense[], granular: TimeGranularity) => {
    const grouped: Record<string, number> = {};
    const personGrouped: Record<string, Record<string, number>> = {};

    exps.forEach((expense) => {
      const date = parseISO(expense.created_at);
      let timeKey: string;

      if (granular === "daily") {
        timeKey = format(date, "dd MMM yyyy");
      } else {
        const weekStart = startOfWeek(date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        timeKey = `${format(weekStart, "dd MMM")} - ${format(weekEnd, "dd MMM")}`;
      }

      const amount = Number(expense.amount);

      // Skip bill expenses
      if (expense.description?.startsWith("Bill:")) return;

      // Add to time period total
      grouped[timeKey] = (grouped[timeKey] || 0) + amount;

      // Track per person spending
      if (!personGrouped[timeKey]) {
        personGrouped[timeKey] = {};
      }
      personGrouped[timeKey][expense.paid_by_member_id] =
        (personGrouped[timeKey][expense.paid_by_member_id] || 0) + amount;
    });

    return { grouped, personGrouped };
  };

  const { grouped: timeGrouped, personGrouped: personTimeGrouped } = groupByTimeGranularity(
    allExpenses,
    granularity
  );

  // Convert to array and sort by date
  const timeSeriesData = Object.entries(timeGrouped)
    .map(([timeKey, total]) => ({
      time: timeKey,
      total,
      sortKey: new Date(timeKey).getTime(),
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ time, total }) => ({
      time,
      total,
    }));

  // Calculate trend
  const calculateTrend = () => {
    if (timeSeriesData.length < 2) return { slope: 0, direction: "neutral" };

    const n = timeSeriesData.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = timeSeriesData.reduce((sum, d) => sum + d.total, 0);
    const sumXY = timeSeriesData.reduce((sum, d, i) => sum + (i + 1) * d.total, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return {
      slope,
      direction: slope > 100 ? "up" : slope < -100 ? "down" : "neutral",
    };
  };

  const trend = calculateTrend();

  // Per-person time data
  const personTimeData = Object.entries(personTimeGrouped).map(([timeKey, personData]) => {
    const item: Record<string, any> = { time: timeKey, sortKey: new Date(timeKey).getTime() };
    members.forEach((member) => {
      item[member.name] = personData[member.id] || 0;
    });
    return item;
  });

  const personTimeDataSorted = personTimeData
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey, ...item }) => item);

  const colors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#06b6d4", // Cyan
    "#84cc16", // Lime
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg z-50">
          <p className="font-semibold text-xs md:text-sm">{label || payload[0].payload.time}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs font-bold">
              {entry.name}: ₹{entry.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (timeSeriesData.length === 0) {
    return null;
  }

  const avgSpending =
    timeSeriesData.reduce((sum, d) => sum + d.total, 0) / timeSeriesData.length;
  const maxSpending = Math.max(...timeSeriesData.map((d) => d.total));
  const minSpending = Math.min(...timeSeriesData.map((d) => d.total));

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Spending Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Granularity Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setGranularity("daily")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              granularity === "daily"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setGranularity("weekly")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              granularity === "weekly"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Weekly
          </button>
        </div>

        {/* Trend Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-primary/10 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Average</p>
            <p className="text-lg font-bold text-primary mt-1">
              ₹{avgSpending.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-success/10 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Lowest</p>
            <p className="text-lg font-bold text-success mt-1">
              ₹{minSpending.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-warning/10 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Highest</p>
            <p className="text-lg font-bold text-warning mt-1">
              ₹{maxSpending.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div
            className={`${
              trend.direction === "up" ? "bg-destructive/10" : "bg-success/10"
            } p-3 rounded-lg`}
          >
            <p className="text-xs text-muted-foreground uppercase font-semibold">Trend</p>
            <p
              className={`text-lg font-bold mt-1 flex items-center gap-1 ${
                trend.direction === "up" ? "text-destructive" : "text-success"
              }`}
            >
              {trend.direction === "up" ? "📈 Rising" : trend.direction === "down" ? "📉 Falling" : "➡️ Stable"}
            </p>
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="total" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="total" className="text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              Total Spending
            </TabsTrigger>
            <TabsTrigger value="person" className="text-sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              By Person
            </TabsTrigger>
          </TabsList>

          {/* Total Spending Chart */}
          <TabsContent value="total" className="mt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${v / 1000}k`}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Total Spent"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Description */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <p className="text-muted-foreground">
                {trend.direction === "up" && (
                  <>
                    <span className="font-semibold text-destructive">Spending is increasing</span> over time.
                    Consider reviewing expenses and setting stricter budgets.
                  </>
                )}
                {trend.direction === "down" && (
                  <>
                    <span className="font-semibold text-success">Spending is decreasing</span> over time.
                    Great job controlling expenses! 🎉
                  </>
                )}
                {trend.direction === "neutral" && (
                  <>
                    <span className="font-semibold">Spending is stable</span>. You're maintaining
                    consistent expenses.
                  </>
                )}
              </p>
            </div>
          </TabsContent>

          {/* Per-Person Chart */}
          <TabsContent value="person" className="mt-0">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={personTimeDataSorted}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${v / 1000}k`}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {members.map((member, index) => (
                    <Bar
                      key={member.id}
                      dataKey={member.name}
                      stackId="a"
                      fill={colors[index % colors.length]}
                      animationDuration={1500}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
              <p className="text-muted-foreground">
                Shows how much each member has paid over {granularity === "daily" ? "each day" : "each week"}. Stacked bars help visualize
                overall spending contribution.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
