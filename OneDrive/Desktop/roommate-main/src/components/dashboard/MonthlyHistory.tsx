import { useMemo, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
    History,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Calendar as CalendarIcon,
    ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expense, Income, UtilityBill, Member } from "@/hooks/useHostel";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { SpendingTrends } from "./SpendingTrends";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MonthlyHistoryProps {
    expenses: Expense[];
    incomes: Income[];
    utilityBills: UtilityBill[];
    members: Member[];
    onSelectMonth: (monthStr: string | null) => void;
    selectedMonth: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
    food: "#f87171",
    groceries: "#4ade80",
    utilities: "#60a5fa",
    entertainment: "#c084fc",
    transport: "#facc15",
    other: "#94a3b8",
};

export const MonthlyHistory = ({
    expenses,
    incomes,
    utilityBills,
    members,
    onSelectMonth,
    selectedMonth
}: MonthlyHistoryProps) => {

    const [showTrends, setShowTrends] = useState(false);

    const monthlyData = useMemo(() => {
        const data: Record<string, {
            month: string;
            totalSpent: number;
            totalIncome: number;
            categories: Record<string, number>;
            topSpender: { name: string; amount: number } | null;
        }> = {};

        // Helper to get month string (YYYY-MM)
        const getMonthStr = (date: string) => format(parseISO(date), "yyyy-MM");

        // Process Expenses
        expenses.forEach(e => {
            const mStr = getMonthStr(e.created_at);
            if (!data[mStr]) data[mStr] = { month: mStr, totalSpent: 0, totalIncome: 0, categories: {}, topSpender: null };

            data[mStr].totalSpent += Number(e.amount);
            data[mStr].categories[e.category] = (data[mStr].categories[e.category] || 0) + Number(e.amount);
        });

        // Process Incomes
        incomes.forEach(i => {
            const mStr = getMonthStr(i.created_at);
            if (!data[mStr]) data[mStr] = { month: mStr, totalSpent: 0, totalIncome: 0, categories: {}, topSpender: null };
            data[mStr].totalIncome += Number(i.amount);
        });

        // Process Utility Bills (using their 'month' field which is already YYYY-MM)
        utilityBills.filter(b => b.paid).forEach(b => {
            const mStr = b.month;
            if (!data[mStr]) data[mStr] = { month: mStr, totalSpent: 0, totalIncome: 0, categories: {}, topSpender: null };
            data[mStr].totalSpent += Number(b.amount);
            data[mStr].categories['utilities'] = (data[mStr].categories['utilities'] || 0) + Number(b.amount);
        });

        // Calculate top spender for each month
        Object.keys(data).forEach(mStr => {
            const monthExpenses = expenses.filter(e => getMonthStr(e.created_at) === mStr);
            const memberSpending: Record<string, number> = {};

            monthExpenses.forEach(e => {
                memberSpending[e.paid_by_member_id] = (memberSpending[e.paid_by_member_id] || 0) + Number(e.amount);
            });

            let topId = "";
            let maxAmount = 0;
            Object.entries(memberSpending).forEach(([id, amt]) => {
                if (amt > maxAmount) {
                    maxAmount = amt;
                    topId = id;
                }
            });

            if (topId) {
                const member = members.find(m => m.id === topId);
                data[mStr].topSpender = { name: member?.name || "Unknown", amount: maxAmount };
            }
        });

        return Object.values(data).sort((a, b) => b.month.localeCompare(a.month));
    }, [expenses, incomes, utilityBills, members]);

    const currentMonthStr = format(new Date(), "yyyy-MM");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <History className="h-6 w-6 text-primary" />
                        Financial History
                    </h2>
                    <p className="text-muted-foreground">Relive your past transactions and trends</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={showTrends} onOpenChange={setShowTrends}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Spending Trends
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Spending Trends Analysis</DialogTitle>
                                <DialogDescription>
                                    View your spending patterns over time with daily and weekly breakdowns
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-auto">
                                <SpendingTrends expenses={expenses} members={members} allExpenses={expenses} />
                            </div>
                        </DialogContent>
                    </Dialog>
                    {selectedMonth && (
                        <Button variant="outline" size="sm" onClick={() => onSelectMonth(null)} className="h-8">
                            Back to Current
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Current Month Card (Special) */}
                <Card
                    className={`relative overflow-hidden cursor-pointer transition-all border-2 ${!selectedMonth ? "border-primary shadow-glow bg-primary/5" : "border-transparent hover:bg-muted/50"}`}
                    onClick={() => onSelectMonth(null)}
                >
                    {!selectedMonth && (
                        <div className="absolute top-2 right-2">
                            <Badge className="bg-primary animate-pulse border-none">LIVE</Badge>
                        </div>
                    )}
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            Current Month
                        </CardTitle>
                        <CardDescription>{format(new Date(), "MMMM yyyy")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Active Tracking</span>
                            <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                {/* History Cards */}
                {monthlyData.filter(d => d.month !== currentMonthStr).map((data, idx) => (
                    <Card
                        key={data.month}
                        className={`group relative overflow-hidden cursor-pointer transition-all border-2 ${selectedMonth === data.month ? "border-primary shadow-glow bg-primary/5" : "border-transparent hover:bg-muted/50"} animate-in fade-in slide-in-from-bottom-4`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                        onClick={() => onSelectMonth(data.month)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">{format(parseISO(data.month + "-01"), "MMMM")}</CardTitle>
                                    <CardDescription>{format(parseISO(data.month + "-01"), "yyyy")}</CardDescription>
                                </div>
                                {selectedMonth === data.month && (
                                    <Badge variant="outline" className="border-primary text-primary">VIEWING</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Spent</p>
                                    <p className="text-lg font-bold text-destructive flex items-center gap-1 group-hover:scale-105 transition-transform origin-left">
                                        <TrendingDown className="h-3 w-3" />
                                        ₹{data.totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Income</p>
                                    <p className="text-lg font-bold text-success flex items-center justify-end gap-1 group-hover:scale-105 transition-transform origin-right">
                                        <TrendingUp className="h-3 w-3" />
                                        ₹{data.totalIncome.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Mini category chart */}
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                                {Object.entries(data.categories).map(([cat, amt]) => {
                                    const percentage = data.totalSpent > 0 ? (amt / data.totalSpent) * 100 : 0;
                                    return (
                                        <div
                                            key={cat}
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: CATEGORY_COLORS[cat] || "#94a3b8"
                                            }}
                                            title={`${cat}: ₹${amt}`}
                                        />
                                    );
                                })}
                            </div>

                            {data.topSpender && (
                                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        👑 Top: <span className="font-semibold text-foreground">{data.topSpender.name}</span>
                                    </span>
                                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {monthlyData.filter(d => d.month !== currentMonthStr).length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl bg-muted/20">
                        <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="font-semibold text-muted-foreground">No historical data yet</h3>
                        <p className="text-sm text-muted-foreground/60">Keep using the app to build your monthly timeline! 🚀</p>
                    </div>
                )}
            </div>
        </div>
    );
};
