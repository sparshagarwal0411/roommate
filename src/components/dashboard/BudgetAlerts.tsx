import React, { useState } from "react";
import { AlertTriangle, AlertCircle, TrendingUp, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/hooks/useHostel";
import { toast } from "sonner";

interface BudgetAlertsProps {
  expenses: Expense[];
  monthlyBudget: number;
  onBudgetUpdate?: (newBudget: number) => void;
  isOwner?: boolean;
}

export const BudgetAlerts = ({
  expenses,
  monthlyBudget,
  onBudgetUpdate,
  isOwner,
}: BudgetAlertsProps) => {
  const [customThreshold, setCustomThreshold] = useState(80); // Default 80%
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(monthlyBudget.toString());
  const [dismissed, setDismissed] = useState(false);

  // Filter out bill expenses
  const regularExpenses = expenses.filter(exp => !exp.description?.startsWith("Bill:"));
  const totalSpent = regularExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const percentageUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const budgetRemaining = monthlyBudget - totalSpent;
  const isOverBudget = totalSpent > monthlyBudget;
  const hasExceededThreshold = percentageUsed >= customThreshold;

  const handleUpdateBudget = () => {
    const budget = parseFloat(newBudget);
    if (isNaN(budget) || budget <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    onBudgetUpdate?.(budget);
    setDialogOpen(false);
    toast.success("Budget updated! 💰");
  };

  if (monthlyBudget === 0 || !isOwner || dismissed) {
    return null;
  }

  // Show alert if exceeded threshold
  if (!hasExceededThreshold) {
    return null;
  }

  return (
    <Card
      variant="default"
      className={`border-l-4 ${
        isOverBudget ? "border-l-destructive bg-destructive/5" : "border-l-warning bg-warning/5"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {isOverBudget ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">Budget Exceeded!</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-warning" />
                <span className="text-warning">Budget Alert</span>
              </>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Alert Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Current Status</span>
            <Badge variant={isOverBudget ? "destructive" : "secondary"}>
              {percentageUsed.toFixed(0)}% Used
            </Badge>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isOverBudget ? "bg-destructive" : "bg-warning"
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Spending Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Total Spent</p>
            <p className="text-lg font-bold text-primary mt-1">
              ₹{totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              {isOverBudget ? "Over Budget" : "Remaining"}
            </p>
            <p
              className={`text-lg font-bold mt-1 ${
                isOverBudget ? "text-destructive" : "text-success"
              }`}
            >
              ₹{Math.abs(budgetRemaining).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Alert Message */}
        <div
          className={`p-3 rounded-lg text-sm ${
            isOverBudget
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-warning/10 text-warning border border-warning/20"
          }`}
        >
          <p className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {isOverBudget
              ? `You've exceeded your budget by ₹${Math.abs(budgetRemaining).toLocaleString("en-IN", { maximumFractionDigits: 0 })}!`
              : `You've used ${percentageUsed.toFixed(0)}% of your monthly budget. Only ₹${budgetRemaining.toLocaleString("en-IN", { maximumFractionDigits: 0 })} remaining!`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                Adjust Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Monthly Budget</DialogTitle>
                <DialogDescription>
                  Set a new monthly budget limit for your hostel expenses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="newBudget">New Budget (₹)</Label>
                  <Input
                    id="newBudget"
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="Enter budget amount"
                    className="h-12"
                  />
                </div>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    Current spending: <span className="font-bold text-foreground">₹{totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateBudget} className="flex-1">
                    Update Budget
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
