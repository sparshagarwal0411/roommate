import { useState } from "react";
import { Plus, Receipt, Utensils, ShoppingCart, Zap, Film, Car, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Member, useAddExpense } from "@/hooks/useHostel";
import { toast } from "sonner";

interface ExpenseFormProps {
  members: Member[];
  hostelId: string;
}

const categories = [
  { value: "food", label: "Food & Dining", icon: Utensils, color: "text-category-food" },
  { value: "groceries", label: "Groceries", icon: ShoppingCart, color: "text-category-groceries" },
  { value: "utilities", label: "Utilities", icon: Zap, color: "text-category-utilities" },
  { value: "entertainment", label: "Entertainment", icon: Film, color: "text-category-entertainment" },
  { value: "transport", label: "Transport", icon: Car, color: "text-category-transport" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "text-category-other" },
];

export const ExpenseForm = ({ members, hostelId }: ExpenseFormProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [paidBy, setPaidBy] = useState<string>("");
  const [description, setDescription] = useState("");
  
  const addExpense = useAddExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !paidBy) {
      toast.error("Please fill in all required fields! 📝");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount 💰");
      return;
    }

    try {
      await addExpense.mutateAsync({
        hostel_id: hostelId,
        paid_by_member_id: paidBy,
        amount: amountNum,
        category: category as any,
        description: description.trim() || null,
        split_equally: true,
      });
      
      toast.success("Expense added! 🎉");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Couldn't add expense. Try again?");
    }
  };

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setPaidBy("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="w-full">
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            New Expense
          </DialogTitle>
          <DialogDescription>
            Add a shared expense to split with your roommates
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-bold h-14"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="What's this for?" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <cat.icon className={`h-4 w-4 ${cat.color}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Paid By *</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">
            💡 This expense will be split equally among all {members.length} roommates
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={addExpense.isPending}
            >
              {addExpense.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
