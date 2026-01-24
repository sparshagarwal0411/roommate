import React, { useState } from "react";
import { Zap, Plus, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { 
  RecurringBill, 
  useAddRecurringBill, 
  useDeleteRecurringBill, 
  useToggleRecurringBill,
  useGenerateMonthlyBills
} from "@/hooks/useHostel";
import { toast } from "sonner";

interface RecurringBillsProps {
  recurringBills: RecurringBill[];
  hostelId: string;
  memberCount: number;
  isOwner: boolean;
}

const billTypes = [
  { value: "electricity", label: "Electricity" },
  { value: "wifi", label: "WiFi / Internet" },
  { value: "rent", label: "Rent" },
  { value: "water", label: "Water" },
  { value: "other", label: "Other" },
];

export const RecurringBills = ({ 
  recurringBills, 
  hostelId, 
  memberCount, 
  isOwner 
}: RecurringBillsProps) => {
  const [open, setOpen] = useState(false);
  const [billType, setBillType] = useState("");
  const [billDescription, setBillDescription] = useState("");
  const [targetRoom, setTargetRoom] = useState("all");
  const [amount, setAmount] = useState("");

  const addRecurringBill = useAddRecurringBill();
  const deleteRecurringBill = useDeleteRecurringBill();
  const toggleRecurringBill = useToggleRecurringBill();
  const generateMonthlyBills = useGenerateMonthlyBills();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billType || !amount) {
      toast.error("Please fill in all fields! 📝");
      return;
    }

    if (billType === "other" && !billDescription.trim()) {
      toast.error("Please provide a description for 'Other' bill! 📝");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount 💰");
      return;
    }

    try {
      await addRecurringBill.mutateAsync({
        hostel_id: hostelId,
        bill_type: billType,
        amount: amountNum,
        target_room: targetRoom,
        description: billType === "other" ? billDescription.trim() : null,
        is_active: true,
      });

      toast.success("Recurring bill created! 🔄 It will auto-generate every month.");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Couldn't create recurring bill");
    }
  };

  const resetForm = () => {
    setBillType("");
    setBillDescription("");
    setTargetRoom("all");
    setAmount("");
  };

  const handleDelete = async (billId: string) => {
    if (!confirm("Delete this recurring bill template?")) return;
    
    try {
      await deleteRecurringBill.mutateAsync({ billId, hostelId });
      toast.success("Recurring bill deleted! 🗑️");
    } catch (error) {
      toast.error("Couldn't delete recurring bill");
    }
  };

  const handleToggle = async (bill: RecurringBill) => {
    try {
      await toggleRecurringBill.mutateAsync({
        billId: bill.id,
        hostelId,
        isActive: !bill.is_active,
      });
      toast.success(bill.is_active ? "Bill deactivated ⏸️" : "Bill activated ▶️");
    } catch (error) {
      toast.error("Couldn't update bill status");
    }
  };

  const handleGenerateNow = async () => {
    if (!isOwner) {
      toast.error("Only the owner can generate bills");
      return;
    }

    try {
      await generateMonthlyBills.mutateAsync(hostelId);
      toast.success("Monthly bills generated! 📅");
    } catch (error) {
      toast.error("Couldn't generate bills");
    }
  };

  if (!isOwner) return null;

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-info" />
            Recurring Bills (Auto Monthly)
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="soft" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Recurring Bill</DialogTitle>
                <DialogDescription>
                  This bill will automatically generate at the start of every month
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bill Type *</Label>
                    <Select value={billType} onValueChange={setBillType}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {billTypes.map((bill) => (
                          <SelectItem key={bill.value} value={bill.value}>
                            {bill.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Room *</Label>
                    <Select value={targetRoom} onValueChange={setTargetRoom}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

                {billType === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="billDescription">Description *</Label>
                    <Input
                      id="billDescription"
                      placeholder="e.g. Maintenance, Repair..."
                      value={billDescription}
                      onChange={(e) => setBillDescription(e.target.value)}
                      className="h-12"
                    />
                  </div>
                )}

                <div className="p-3 bg-muted rounded-xl text-xs text-muted-foreground">
                  ✨ This bill will auto-generate on the 1st of every month
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
                    className="flex-1"
                    disabled={addRecurringBill.isPending}
                  >
                    {addRecurringBill.isPending ? "Adding..." : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recurringBills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recurring bills. Create one to auto-generate bills every month! 👆
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {recurringBills.map((bill, i) => {
                const billLabel = billTypes.find(b => b.value === bill.bill_type)?.label || bill.bill_type;
                
                return (
                  <div
                    key={bill.id}
                    className={`flex items-center gap-3 p-3 rounded-xl animate-fade-in ${
                      bill.is_active ? "bg-info/10" : "bg-muted/50"
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold capitalize">{billLabel}</span>
                        <span className="font-bold shrink-0">₹{Number(bill.amount).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {bill.target_room === "all" ? "All rooms" : `Room ${bill.target_room}`}
                        {bill.description && ` • ${bill.description}`}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleToggle(bill)}
                      disabled={toggleRecurringBill.isPending}
                    >
                      {bill.is_active ? (
                        <Eye className="h-5 w-5 text-success" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() => handleDelete(bill.id)}
                      disabled={deleteRecurringBill.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleGenerateNow}
              className="w-full mt-4"
              disabled={generateMonthlyBills.isPending}
              variant="outline"
            >
              {generateMonthlyBills.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Generate This Month's Bills Now"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
