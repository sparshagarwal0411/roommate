import { useState } from "react";
import { Zap, Wifi, Home, Plus, Check, Circle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UtilityBill, useAddUtilityBill, useToggleBillPaid, Member } from "@/hooks/useHostel";
import { toast } from "sonner";
import { format } from "date-fns";

interface UtilityBillsProps {
  bills: UtilityBill[];
  hostelId: string;
  memberCount: number;
}

const billTypes = [
  { value: "electricity", label: "Electricity", icon: Zap },
  { value: "wifi", label: "WiFi / Internet", icon: Wifi },
  { value: "rent", label: "Rent", icon: Home },
  { value: "water", label: "Water", icon: Home },
  { value: "other", label: "Other", icon: Home },
];

export const UtilityBills = ({ bills, hostelId, memberCount }: UtilityBillsProps) => {
  const [open, setOpen] = useState(false);
  const [billType, setBillType] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));

  const addBill = useAddUtilityBill();
  const togglePaid = useToggleBillPaid();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billType || !amount) {
      toast.error("Please fill in all fields! 📝");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount 💰");
      return;
    }

    try {
      await addBill.mutateAsync({
        hostel_id: hostelId,
        bill_type: billType,
        amount: amountNum,
        month,
        paid: false,
      });
      toast.success("Bill added! 📋");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Couldn't add bill");
    }
  };

  const resetForm = () => {
    setBillType("");
    setAmount("");
    setMonth(format(new Date(), "yyyy-MM"));
  };

  const handleTogglePaid = async (bill: UtilityBill) => {
    try {
      await togglePaid.mutateAsync({
        billId: bill.id,
        paid: !bill.paid,
        hostelId,
      });
      toast.success(bill.paid ? "Marked as unpaid" : "Marked as paid! ✓");
    } catch (error) {
      toast.error("Couldn't update bill");
    }
  };

  const getBillIcon = (type: string) => {
    const bill = billTypes.find((b) => b.value === type);
    return bill?.icon || Home;
  };

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-info" />
            Utility Bills
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="soft" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Utility Bill</DialogTitle>
                <DialogDescription>
                  Track shared bills like electricity, wifi, or rent
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Bill Type *</Label>
                  <Select value={billType} onValueChange={setBillType}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select bill type" />
                    </SelectTrigger>
                    <SelectContent>
                      {billTypes.map((bill) => (
                        <SelectItem key={bill.value} value={bill.value}>
                          <div className="flex items-center gap-2">
                            <bill.icon className="h-4 w-4 text-info" />
                            {bill.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billAmount">Amount (₹) *</Label>
                  <Input
                    id="billAmount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billMonth">Month</Label>
                  <Input
                    id="billMonth"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="h-12"
                  />
                </div>

                {memberCount > 0 && amount && (
                  <div className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">
                    💡 Split: ₹{(parseFloat(amount) / memberCount).toFixed(2)} per person
                  </div>
                )}

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
                    className="flex-1"
                    disabled={addBill.isPending}
                  >
                    {addBill.isPending ? "Adding..." : "Add Bill"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No bills added yet. Add your first one! 👆
          </p>
        ) : (
          bills.map((bill, i) => {
            const Icon = getBillIcon(bill.bill_type);
            const splitAmount = memberCount > 0 ? Number(bill.amount) / memberCount : Number(bill.amount);

            return (
              <div
                key={bill.id}
                className={`flex items-center gap-3 p-3 rounded-xl animate-fade-in transition-colors ${
                  bill.paid ? "bg-success/10" : "bg-warning/10"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  bill.paid ? "bg-success/20" : "bg-warning/20"
                }`}>
                  <Icon className={`h-5 w-5 ${bill.paid ? "text-success" : "text-warning"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold capitalize">{bill.bill_type}</span>
                    <span className="font-bold shrink-0">
                      ₹{Number(bill.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(bill.month + "-01"), "MMMM yyyy")} • ₹{splitAmount.toFixed(0)}/person
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleTogglePaid(bill)}
                  disabled={togglePaid.isPending}
                >
                  {bill.paid ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
