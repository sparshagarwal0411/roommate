import { useState } from "react";
import { Wallet, Edit2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useUpdateBudget, Hostel } from "@/hooks/useHostel";
import { toast } from "sonner";

interface BudgetTrackerProps {
  hostel: Hostel;
  totalSpent: number;
}

export const BudgetTracker = ({ hostel, totalSpent }: BudgetTrackerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(hostel.monthly_budget.toString());
  const updateBudget = useUpdateBudget();

  const budget = Number(hostel.monthly_budget) || 0;
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
      <CardHeader className="pb-3">
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
      <CardContent className="space-y-4">
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
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">
                ₹{totalSpent.toLocaleString()}
              </span>
              <span className="text-muted-foreground">
                / ₹{budget.toLocaleString()}
              </span>
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
