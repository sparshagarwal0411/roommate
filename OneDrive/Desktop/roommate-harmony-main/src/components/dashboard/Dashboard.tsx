import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShareButton } from "@/components/ShareButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MembersList } from "./MembersList";
import { BudgetTracker } from "./BudgetTracker";
import { ExpenseForm } from "./ExpenseForm";
import { ExpensesList } from "./ExpensesList";
import { UtilityBills } from "./UtilityBills";
import { BalanceSummary } from "./BalanceSummary";
import { SpendingCharts } from "./SpendingCharts";
import { useHostel, useMembers, useExpenses, useUtilityBills, Hostel } from "@/hooks/useHostel";
import { clearHostelSession } from "@/lib/hostel-store";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
  hostelId: string;
  onLeave: () => void;
}

export const Dashboard = ({ hostelId, onLeave }: DashboardProps) => {
  const { data: hostel, isLoading: hostelLoading } = useHostel(hostelId);
  const { data: members = [], isLoading: membersLoading } = useMembers(hostelId);
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(hostelId);
  const { data: utilityBills = [], isLoading: billsLoading } = useUtilityBills(hostelId);

  const handleLeave = () => {
    clearHostelSession();
    onLeave();
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBills = utilityBills.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = totalExpenses + totalBills;

  const isLoading = hostelLoading || membersLoading || expensesLoading || billsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b">
          <div className="container flex items-center justify-between h-16">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
        <main className="container py-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Hostel not found 😕</p>
          <Button onClick={handleLeave}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{hostel.name}</h1>
              <p className="text-xs text-muted-foreground">Code: {hostel.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ShareButton hostelCode={hostel.code} hostelName={hostel.name} />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLeave}
              className="rounded-full"
              title="Leave hostel"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Top Row: Budget & Add Expense */}
        <div className="grid md:grid-cols-2 gap-4">
          <BudgetTracker hostel={hostel} totalSpent={totalSpent} />
          <div className="flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-dashed border-primary/20">
            <ExpenseForm members={members} hostelId={hostelId} />
          </div>
        </div>

        {/* Members */}
        <MembersList members={members} hostelId={hostelId} />

        {/* Balance Summary */}
        <BalanceSummary members={members} expenses={expenses} />

        {/* Charts */}
        <SpendingCharts expenses={expenses} members={members} />

        {/* Expenses & Bills */}
        <div className="grid md:grid-cols-2 gap-4">
          <ExpensesList expenses={expenses} members={members} hostelId={hostelId} />
          <UtilityBills bills={utilityBills} hostelId={hostelId} memberCount={members.length} />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">₹{totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Shared Expenses</p>
          </div>
          <div className="bg-info/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-info">₹{totalBills.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Utility Bills</p>
          </div>
          <div className="bg-accent/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-accent">
              ₹{members.length > 0 ? Math.round(totalSpent / members.length).toLocaleString() : 0}
            </p>
            <p className="text-xs text-muted-foreground">Avg per Person</p>
          </div>
        </div>
      </main>

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
};
