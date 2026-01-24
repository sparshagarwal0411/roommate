import { useState } from "react";
import { Plus, Receipt, Utensils, ShoppingCart, Zap, Film, Car, ShoppingBag, MoreHorizontal } from "lucide-react";
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
import { Member, useAddExpense, useAddNotification } from "@/hooks/useHostel";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users as UsersIcon } from "lucide-react";

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
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "text-category-shopping" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "text-category-other" },
];

export const ExpenseForm = ({ members, hostelId }: ExpenseFormProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [paidBy, setPaidBy] = useState<string>("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  const addExpense = useAddExpense();
  const addNotification = useAddNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !paidBy) {
      toast.error("Please fill in all required fields! 📝");
      return;
    }

    if (category === "other" && !description.trim()) {
      toast.error("Description is required for 'Other' category! 📝");
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
        split_equally: participants.length === 0 || participants.length === members.length,
        participants: participants.length > 0 ? participants : null,
      });

      // Send notifications to participants
      const payer = members.find(m => m.id === paidBy);
      const targets = participants.length > 0 ? participants : members.map(m => m.id);
      const splitAmount = amountNum / targets.length;

      const notificationsPromises = targets
        .filter(targetId => targetId !== paidBy) // Don't notify the payer
        .map(targetId => {
          return addNotification.mutateAsync({
            hostel_id: hostelId,
            recipient_id: targetId,
            sender_id: paidBy,
            actor_name: payer?.name || "A Roommate",
            type: 'bill',
            content: `${payer?.name || "Someone"} paid ₹${amountNum.toLocaleString()} for ${category === 'other' ? description : categories.find(c => c.value === category)?.label || category}... Head over to pay split of ₹${Math.round(splitAmount).toLocaleString()}...`
          });
        });

      await Promise.all(notificationsPromises);

      toast.success("Expense added! 🎉");
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error instanceof Error ? error.message : "Couldn't add expense. Try again?");
    }
  };

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setPaidBy("");
    setDescription("");
    setParticipants([]);
  };

  const toggleParticipant = (memberId: string) => {
    setParticipants(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAll = () => setParticipants(members.map(m => m.id));
  const selectNone = () => setParticipants([]);

  const handlePaidByChange = (value: string) => {
    setPaidBy(value);
    setParticipants((prev) => {
      // If currently "All" (empty), switch to "Explicit All" so user can verify/uncheck
      if (prev.length === 0) return members.map((m) => m.id);

      // Otherwise, ensure the new payer is included
      return prev.includes(value) ? prev : [...prev, value];
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {categories.slice(0, 6).map(cat => (
              <button
                key={cat.value}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-background/50 hover:bg-background border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                onClick={(e) => {
                  // Prevent default trigger behavior if necessary, but here we want it to open.
                  // Actually, DialogTrigger expects a single child. We can't wrap multiple buttons easily in one Trigger unless we manage state manually.
                  // Better approach: Remove DialogTrigger as a wrapper around complex UI. Use the open/setOpen state directly.
                  e.preventDefault();
                  setCategory(cat.value);
                  setOpen(true);
                }}
              >
                <div className={`p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors ${cat.color}`}>
                  <cat.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">{cat.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <Button variant="hero" size="lg" className="w-full" onClick={() => { setCategory(""); setOpen(true); }}>
            <Plus className="h-5 w-5 mr-2" />
            Add Expense
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            New Expense
          </DialogTitle>
          <DialogDescription>
            Add a shared expense to split with all hostel members
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] overflow-y-auto pr-4 -mr-4">
          <form onSubmit={handleSubmit} className="space-y-3 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl font-bold h-12"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="For?" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2 text-xs">
                          <cat.icon className={`h-3 w-3 ${cat.color}`} />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Paid By *</Label>
                <Select value={paidBy} onValueChange={handlePaidByChange}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Who?" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id} className="text-xs">
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description {category === "other" ? "*" : "(optional)"}</Label>
              <Input
                id="description"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs">
                  <UsersIcon className="h-3 w-3" />
                  Split With *
                </Label>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={selectAll} className="text-[10px] h-6 px-2">All</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={selectNone} className="text-[10px] h-6 px-2">None</Button>
                </div>
              </div>
              <div className="max-h-[100px] overflow-y-auto pr-2 border rounded-xl p-2 bg-muted/30">
                <div className="grid grid-cols-2 gap-1.5">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2 p-1 rounded-lg hover:bg-background transition-colors">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={participants.includes(member.id)}
                        onCheckedChange={() => toggleParticipant(member.id)}
                      />
                      <label
                        htmlFor={`member-${member.id}`}
                        className="text-[10px] font-medium leading-none cursor-pointer overflow-hidden truncate"
                      >
                        {member.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-2 bg-primary/5 border border-primary/10 rounded-lg text-[10px] text-muted-foreground">
              💡 {participants.length === 0
                ? `Split among all ${members.length} members?`
                : `Splitting between ${participants.length} members`}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                className="flex-1 h-10"
                disabled={addExpense.isPending}
              >
                {addExpense.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
