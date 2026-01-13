import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { Expense, Member } from "@/hooks/useHostel";

interface SpendingChartsProps {
  expenses: Expense[];
  members: Member[];
}

const categoryColors: Record<string, string> = {
  food: "hsl(var(--food))",
  groceries: "hsl(var(--groceries))",
  utilities: "hsl(var(--utilities))",
  entertainment: "hsl(var(--entertainment))",
  transport: "hsl(var(--transport))",
  other: "hsl(var(--other))",
};

const categoryLabels: Record<string, string> = {
  food: "Food",
  groceries: "Groceries",
  utilities: "Utilities",
  entertainment: "Entertainment",
  transport: "Transport",
  other: "Other",
};

export const SpendingCharts = ({ expenses, members }: SpendingChartsProps) => {
  // Aggregate by category
  const categoryData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    name: categoryLabels[category] || category,
    value: amount,
    color: categoryColors[category] || categoryColors.other,
  }));

  // Aggregate by member
  const memberData = members.map((member) => {
    const totalPaid = expenses
      .filter((e) => e.paid_by_member_id === member.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: member.name,
      amount: totalPaid,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="font-semibold">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-primary font-bold">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  if (expenses.length === 0) {
    return (
      <Card variant="default">
        <CardContent className="py-12 text-center">
          <PieChartIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No data to visualize yet</p>
          <p className="text-sm text-muted-foreground/70">Add some expenses to see charts!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="category" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="category" className="text-sm">
              <PieChartIcon className="h-4 w-4 mr-1" />
              By Category
            </TabsTrigger>
            <TabsTrigger value="member" className="text-sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              By Person
            </TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="mt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
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
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
