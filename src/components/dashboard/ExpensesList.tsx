import { Receipt, Utensils, ShoppingCart, Zap, Film, Car, MoreHorizontal, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Member, Expense, useDeleteExpense } from "@/hooks/useHostel";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExpensesListProps {
  expenses: Expense[];
  members: Member[];
  hostelId: string;
}

const categoryIcons: Record<string, { icon: typeof Utensils; color: string; bg: string }> = {
  food: { icon: Utensils, color: "text-category-food", bg: "bg-category-food/10" },
  groceries: { icon: ShoppingCart, color: "text-category-groceries", bg: "bg-category-groceries/10" },
  utilities: { icon: Zap, color: "text-category-utilities", bg: "bg-category-utilities/10" },
  entertainment: { icon: Film, color: "text-category-entertainment", bg: "bg-category-entertainment/10" },
  transport: { icon: Car, color: "text-category-transport", bg: "bg-category-transport/10" },
  other: { icon: MoreHorizontal, color: "text-category-other", bg: "bg-category-other/10" },
};

export const ExpensesList = ({ expenses, members, hostelId }: ExpensesListProps) => {
  const deleteExpense = useDeleteExpense();

  const getMemberInfo = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return "Unknown";
    return member.room_no ? `${member.name} (${member.room_no})` : member.name;
  };

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteExpense.mutateAsync({ expenseId, hostelId });
      toast.success("Expense removed! 🗑️");
    } catch (error) {
      toast.error("Couldn't delete expense");
    }
  };

  if (expenses.length === 0) {
    return (
      <Card variant="default">
        <CardContent className="py-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No expenses yet</p>
          <p className="text-sm text-muted-foreground/70">Add your first shared expense above! 👆</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Recent Expenses ({expenses.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {expenses.map((expense, i) => {
          const cat = categoryIcons[expense.category] || categoryIcons.other;
          const Icon = cat.icon;

          return (
            <div
              key={expense.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl animate-fade-in group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-10 h-10 ${cat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${cat.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold truncate">
                    {expense.description || expense.category}
                  </span>
                  <span className="font-bold text-primary shrink-0">
                    ₹{Number(expense.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-0.5">
                  <span>Paid by {getMemberInfo(expense.paid_by_member_id)}</span>
                  <span>{format(new Date(expense.created_at), "MMM d")}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => handleDelete(expense.id)}
                disabled={deleteExpense.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>

              {expense.image_url && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Receipt for {expense.description || expense.category}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 rounded-xl overflow-hidden border">
                      <img
                        src={expense.image_url}
                        alt="Receipt"
                        className="w-full h-auto object-contain max-h-[70vh]"
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="outline" asChild>
                        <a href={expense.image_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Open Original
                        </a>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
