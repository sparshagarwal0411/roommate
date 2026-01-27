import { useState } from "react";
import { Plus, Wallet, Receipt } from "lucide-react";
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
import { useAddIncome } from "@/hooks/useHostel";
import { toast } from "sonner";

interface IncomeFormProps {
    hostelId: string;
}

export const IncomeForm = ({ hostelId }: IncomeFormProps) => {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const addIncome = useAddIncome();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount) {
            toast.error("Please enter an amount! 💰");
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error("Enter a valid amount 💰");
            return;
        }

        try {
            await addIncome.mutateAsync({
                hostel_id: hostelId,
                amount: amountNum,
                description: description.trim() || null,
            });

            toast.success("Income added! 📈");
            setOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error adding income:", error);
            toast.error(error instanceof Error ? error.message : "Couldn't add income. Try again?");
        }
    };

    const resetForm = () => {
        setAmount("");
        setDescription("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="soft" size="lg" className="w-full">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Income / Funds
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        New Income / Extra Funds
                    </DialogTitle>
                    <DialogDescription>
                        Add extra funds to increase your monthly budget
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="income-amount">Amount (₹) *</Label>
                        <Input
                            id="income-amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-2xl font-bold h-14"
                            min="0"
                            step="0.01"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="income-description">Description (optional)</Label>
                        <Textarea
                            id="income-description"
                            placeholder="Where did these funds come from?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">
                        💡 This will increase your total available budget for the month.
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
                            disabled={addIncome.isPending}
                        >
                            {addIncome.isPending ? "Adding..." : "Add Income"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
