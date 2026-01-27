import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart as PieChartIcon, BarChart3, TrendingUp, Loader2 } from "lucide-react";
import { Expense, Member, UtilityBill } from "@/hooks/useHostel";
import { useEffect, useRef, useState } from "react";

interface SpendingChartsProps {
  expenses: Expense[];
  members: Member[];
  utilityBills?: UtilityBill[];
}

const categoryColors: Record<string, string> = {
  food: "hsl(var(--food))",
  groceries: "hsl(var(--groceries))",
  utilities: "hsl(var(--utilities))",
  entertainment: "hsl(var(--entertainment))",
  transport: "hsl(var(--transport))",
  shopping: "hsl(var(--shopping))",
  other: "hsl(var(--other))",
  "Hostel Bills": "#8b5cf6", // Violet color for distinct look
};

// Cool colors for different members
const memberColors: string[] = [
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

const categoryLabels: Record<string, string> = {
  food: "Food",
  groceries: "Groceries",
  utilities: "Utilities",
  entertainment: "Entertainment",
  transport: "Transport",
  shopping: "Shopping",
  other: "Other",
  "Hostel Bills": "Hostel Bills",
};

export const SpendingCharts = ({ expenses, members, utilityBills = [] }: SpendingChartsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  // Re-trigger animation when theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      // Trigger re-animation by resetting key
      setAnimationKey(prev => prev + 1);
    };

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);

    // Also listen for manual theme toggle
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Theme has changed
          setAnimationKey(prev => prev + 1);
        }
      });
    });

    if (document.documentElement) {
      observer.observe(document.documentElement, { attributes: true });
    }

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  // Scroll/Intersection Observer for animation - optional, don't block rendering
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Filter out bill expenses from regular expenses for charts
  // Bills are tracked separately in UtilityBills component
  const regularExpenses = expenses.filter(exp => !exp.description?.startsWith("Bill:"));

  // Aggregate by category
  const expenseData = regularExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(expenseData).map(([category, amount]) => ({
    name: categoryLabels[category] || category,
    value: amount,
    color: categoryColors[category] || categoryColors.other,
  }));

  // Aggregate by member (only regular expenses, not bills)
  const memberData = members.map((member, index) => {
    const totalPaid = regularExpenses
      .filter((e) => e.paid_by_member_id === member.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: member.name,
      amount: totalPaid,
      color: memberColors[index % memberColors.length],
    };
  });

  // Top spending categories - sorted by amount (for ranking chart)
  const topSpendingData = Object.entries(expenseData)
    .map(([category, amount]) => ({
      name: categoryLabels[category] || category,
      value: amount,
      category: category,
      color: categoryColors[category] || categoryColors.other,
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg z-50">
          <p className="font-semibold">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-primary font-bold">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  if (regularExpenses.length === 0 && utilityBills.length === 0) {
    return (
      <Card variant="default">
        <CardContent className="py-12 text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No data to visualize yet</p>
          <p className="text-sm text-muted-foreground/70">Add expenses or bills to see charts!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default" ref={chartRef}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isVisible ? (
          <Tabs defaultValue="category" className="w-full animate-fade-in" key={animationKey}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="category" className="text-sm">
                <PieChartIcon className="h-4 w-4 mr-1" />
                By Category
              </TabsTrigger>
              <TabsTrigger value="member" className="text-sm">
                <BarChart3 className="h-4 w-4 mr-1" />
                By Person
              </TabsTrigger>
              <TabsTrigger value="ranking" className="text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                Top Spending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="category" className="mt-0">
              <div className="h-64" key={`pie-${animationKey}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart key={`pie-chart-${animationKey}`}>
                    <Pie
                      key={`pie-data-${animationKey}`}
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span className="text-sm">{value}</span>}
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="member" className="mt-0">
              <div className="h-64" key={`bar-${animationKey}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberData} layout="vertical" key={`bar-chart-${animationKey}`}>
                    <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      key={`bar-data-${animationKey}`}
                      dataKey="amount"
                      radius={[0, 8, 8, 0]}
                      animationDuration={1500}
                    >
                      {memberData.map((entry, index) => (
                        <Cell
                          key={`member-cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="ranking" className="mt-0">
              <div className="h-64" key={`ranking-${animationKey}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={topSpendingData} 
                    layout="vertical" 
                    key={`ranking-chart-${animationKey}`}
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                  >
                    <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      key={`ranking-data-${animationKey}`}
                      dataKey="value"
                      radius={[0, 8, 8, 0]}
                      animationDuration={1500}
                    >
                      {topSpendingData.map((entry, index) => (
                        <Cell
                          key={`ranking-cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="h-72 flex flex-col items-center justify-center text-muted-foreground/50">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-xs">Loading visualizations...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
