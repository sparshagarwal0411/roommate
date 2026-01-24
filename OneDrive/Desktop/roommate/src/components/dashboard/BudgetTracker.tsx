import { useState, useMemo } from "react";
import { Wallet, Edit2, Check, X, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateBudget, Hostel, Expense } from "@/hooks/useHostel";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area } from "recharts";
import { getDaysInMonth, getDate, endOfMonth, format } from "date-fns";

interface BudgetTrackerProps {
  hostel: Hostel;
  totalSpent: number;
  totalIncome?: number;
  expenses?: Expense[];
}

export const BudgetTracker = ({ hostel, totalSpent, totalIncome = 0, expenses = [] }: BudgetTrackerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(hostel.monthly_budget?.toString() || "0");
  const updateBudget = useUpdateBudget();

  const baseBudget = Number(hostel.monthly_budget) || 0;
  const budget = baseBudget + totalIncome;
  const percentage = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const remaining = budget - totalSpent;

  const handleSave = async () => {
    const budgetNum = parseFloat(newBudget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      toast.error("Please enter a valid amount 💰");
      return;
    }

    try {
      await updateBudget.mutateAsync({ hostelId: hostel.id, budget: budgetNum });
      toast.success("Budget updated! 📊");
      setIsEditing(false);
    } catch (error) {
      toast.error("Couldn't update budget");
    }
  };

  // --- Projection Chart Logic ---
  const chartData = useMemo(() => {
    if (budget === 0) return [];

    const today = new Date();
    const daysInMonth = getDaysInMonth(today);
    const currentDay = getDate(today);

    // 1. Group expenses by day
    const dailySpend: Record<number, number> = {};
    expenses.forEach(e => {
      const date = new Date(e.created_at);
      const day = getDate(date);
      // Only count if it's this month (filteredExpenses passed from parent guarantees month, but let's be safe if logic changes)
      dailySpend[day] = (dailySpend[day] || 0) + Number(e.amount);
    });

    // 2. Build cumulative data
    let runningTotal = 0;
    const data = [];

    // Calculate average daily burn rate based on PAST days (including today)
    // To avoid huge spikes on day 1 projecting nicely, maybe average over active days? 
    // Simple approach: Total Spent / Current Day Number
    const dailyBurnRate = totalSpent / Math.max(currentDay, 1);

    for (let day = 1; day <= daysInMonth; day++) {
      const isPastOrToday = day <= currentDay;

      if (isPastOrToday) {
        // Actual Data
        const spendToday = dailySpend[day] || 0;
        runningTotal += spendToday;
        data.push({
          day,
          actual: runningTotal,
          projected: null, // Don't show projection on past days to keep it clean, or show dashed line? User asked "Projected" in different color.
          limit: budget
        });
      } else {
        // Future Projection
        // Project from the LAST KNOWN total
        const projectedTotal = runningTotal + (dailyBurnRate * (day - currentDay));
        data.push({
          day,
          actual: null,
          projected: projectedTotal,
          limit: budget
        });
      }
    }

    // Connect the lines: make the first projected point start at the last actual point
    if (data[currentDay - 1] && data[currentDay]) {
      data[currentDay].projected = data[currentDay - 1].actual; // Start projection from current actual
    }

    return data;
  }, [expenses, totalSpent, budget]);

  const projectedEndTotal = chartData.length > 0 ? chartData[chartData.length - 1].projected : 0;
  const isOverBudgetJson = (projectedEndTotal || 0) > budget;


  // Color based on spending
  const getStatusColor = () => {
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 70) return "text-warning";
    return "text-success";
  };

  const getProgressColor = () => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-warning";
    return "bg-primary";
  };

  return (
    <Card variant="primary">
      <CardHeader className="pb-3 card-header-separator">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Monthly Budget
          </CardTitle>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setNewBudget(hostel.monthly_budget.toString());
                setIsEditing(true);
              }}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8 text-success"
                disabled={updateBudget.isPending}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <Input
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="text-2xl font-bold h-14"
            autoFocus
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">
                ₹{totalSpent.toLocaleString()}
              </span>
              <div className="text-right">
                <span className="text-muted-foreground block text-xs">
                  Limit: ₹{budget.toLocaleString()}
                </span>
                {totalIncome > 0 && (
                  <span className="text-success text-[10px]">
                    (incl. ₹{totalIncome} extra funds)
                  </span>
                )}
              </div>
            </div>

            {budget > 0 && (
              <>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className={getStatusColor()}>
                    {percentage.toFixed(0)}% used
                  </span>
                  <span className="text-muted-foreground">
                    {remaining >= 0
                      ? `₹${remaining.toLocaleString()} left`
                      : `₹${Math.abs(remaining).toLocaleString()} over!`}
                  </span>
                </div>

                {/* Projection Chart */}
                <div className="h-32 mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Projection
                    </p>
                    <p className={`text-xs ${isOverBudgetJson ? "text-destructive" : "text-success"}`}>
                      Est. End: ₹{projectedEndTotal?.toFixed(0) || "0"}
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover border text-popover-foreground text-xs rounded-lg p-2 shadow-sm">
                                <p className="font-bold mb-1">Day {data.day}</p>
                                {data.actual !== null && <p className="text-destructive">Spent: ₹{data.actual.toLocaleString()}</p>}
                                {data.projected !== null && <p className="text-muted-foreground">Est: ₹{data.projected.toFixed(0)}</p>}
                                <p className="text-success">Limit: ₹{budget.toLocaleString()}</p>
                              </div>
                            )
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={budget} stroke="#22c55e" strokeDasharray="3 3" />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        animationDuration={1000}
                      />
                      <Line
                        type="monotone"
                        dataKey="projected"
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        dot={false}
                        strokeOpacity={0.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {budget === 0 && (
              <p className="text-sm text-muted-foreground">
                Set a budget to track your spending 📊
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
