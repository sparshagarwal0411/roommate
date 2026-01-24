import React, { useState } from "react";
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
import { UtilityBill, useAddUtilityBill, useToggleBillPaid, Member, useAddExpense, useAddNotification } from "@/hooks/useHostel";
import { toast } from "sonner";
import { format } from "date-fns";

interface UtilityBillsProps {
  bills: UtilityBill[];
  hostelId: string;
  memberCount: number;
  isOwner: boolean;
  members: Member[];
  currentMemberId?: string;
}

const billTypes = [
  { value: "electricity", label: "Electricity", icon: Zap },
  { value: "wifi", label: "WiFi / Internet", icon: Wifi },
  { value: "rent", label: "Rent", icon: Home },
  { value: "water", label: "Water", icon: Home },
  { value: "other", label: "Other", icon: Home },
];

export const UtilityBills = ({ bills, hostelId, memberCount, isOwner, members, currentMemberId }: UtilityBillsProps) => {
  const [open, setOpen] = useState(false);
  const [billType, setBillType] = useState("");
  const [billDescription, setBillDescription] = useState("");
  const [targetRoom, setTargetRoom] = useState("all");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));

  const addBill = useAddUtilityBill();
  const togglePaid = useToggleBillPaid();
  const addExpense = useAddExpense();
  const addNotification = useAddNotification();

  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<UtilityBill | null>(null);
  const [paidBy, setPaidBy] = useState("");

  const me = members.find(m => m.id === currentMemberId);
  const billRoom = selectedBill ? selectedBill.bill_type.split("|")[1] : null;
  const billParticipants = billRoom ? members.filter(m => m.room_no === billRoom) : members;
  const participantCount = billParticipants.length;

  const uniqueRooms = Array.from(new Set(members.map(m => m.room_no).filter(Boolean))) as string[];

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
      const roomsToCreate = targetRoom === "all" ? uniqueRooms : [targetRoom];

      if (roomsToCreate.length === 0) {
        toast.error("No occupied rooms found to add bills to! 🤷‍♂️");
        return;
      }

      for (const room of roomsToCreate) {
        const fullType = billType === "other"
          ? `${billType}|${room}|${billDescription.trim()}`
          : `${billType}|${room}`;

        const createdBill = await addBill.mutateAsync({
          hostel_id: hostelId,
          bill_type: fullType,
          amount: amountNum,
          month,
          paid: false,
        });

        // Trigger notifications for roommates in that room
        const roommatesInRoom = members.filter(m => m.room_no === room && m.profile_id); // Only active members
        const owner = members.find(m => m.id === currentMemberId);

        for (const recipient of roommatesInRoom) {
          if (recipient.id === currentMemberId) continue; // Don't notify self

          await addNotification.mutateAsync({
            hostel_id: hostelId,
            recipient_id: recipient.id,
            sender_id: currentMemberId || "",
            actor_name: owner?.name || "Hostel Owner",
            type: 'bill',
            content: `New ${billType === 'other' ? billDescription : billType} bill for Room ${room}: ₹${amountNum}`,
          });
        }
      }

      toast.success(targetRoom === "all" ? `Bills added for ${roomsToCreate.length} rooms! 📋` : "Bill added! 📋");
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Couldn't add bill");
    }
  };

  const resetForm = () => {
    setBillType("");
    setBillDescription("");
    setTargetRoom("all");
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

  const handleSettleBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill || !paidBy) return;

    try {
      const splitParticipants = billParticipants.map(m => m.id);

      // Add as expense
      await addExpense.mutateAsync({
        hostel_id: hostelId,
        amount: Number(selectedBill.amount),
        category: "utilities",
        description: `Bill: ${selectedBill.bill_type} (${selectedBill.month})`,
        paid_by_member_id: paidBy,
        split_equally: true,
        participants: splitParticipants,
      });

      // Mark bill as paid
      await togglePaid.mutateAsync({
        billId: selectedBill.id,
        paid: true,
        hostelId,
      });

      toast.success("Bill settled and expense added! 💸");
      setSettleOpen(false);
      setSelectedBill(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to settle bill");
    }
  };

  const openSettleDialog = (bill: UtilityBill) => {
    if (bill.paid) return;
    setSelectedBill(bill);
    setPaidBy(currentMemberId || "");
    setSettleOpen(true);
  };

  const getBillIcon = (type: string) => {
    const pureType = type.split("|")[0];
    const bill = billTypes.find((b) => b.value === pureType);
    return bill?.icon || Home;
  };

  const getBillLabel = (type: string) => {
    const [pureType, room, description] = type.split("|");
    if (pureType === "other" && description) return isOwner ? `${description} (Room ${room})` : description;
    const label = billTypes.find((b) => b.value === pureType)?.label || pureType;
    return isOwner ? `${label} (Room ${room})` : label;
  };

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-info" />
            Hostel Bills
          </CardTitle>
          {isOwner && (
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
                      <Label>Target Room *</Label>
                      <Select value={targetRoom} onValueChange={setTargetRoom}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Room" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Rooms</SelectItem>
                          {uniqueRooms.sort().map((room) => (
                            <SelectItem key={room} value={room}>
                              Room {room}
                            </SelectItem>
                          ))}
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

                  {targetRoom !== "all" && memberCount > 0 && amount && (
                    <div className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">
                      💡 Note: Split will be among all {memberCount} hostel members when paid
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
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No bills added yet. Add your first one! 👆
          </p>
        ) : (
          bills
            .filter(bill => {
              if (isOwner) return true;
              const [, room] = bill.bill_type.split("|");
              return room === me?.room_no;
            })
            .map((bill, i) => {
              const Icon = getBillIcon(bill.bill_type);
              const [, room] = bill.bill_type.split("|");
              const membersInRoom = members.filter(m => m.room_no === room);
              const label = getBillLabel(bill.bill_type);

              return (
                <div
                  key={bill.id}
                  onClick={() => !bill.paid && openSettleDialog(bill)}
                  className={`flex items-center gap-3 p-3 rounded-xl animate-fade-in transition-colors cursor-pointer hover:brightness-95 ${bill.paid ? "bg-success/10" : "bg-warning/10"
                    }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bill.paid ? "bg-success/20" : "bg-warning/20"
                    }`}>
                    <Icon className={`h-5 w-5 ${bill.paid ? "text-success" : "text-warning"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold capitalize">{label}</span>
                      <span className="font-bold shrink-0">
                        ₹{Number(bill.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(bill.month + "-01"), "MMMM yyyy")} • ₹{(Number(bill.amount) / membersInRoom.length).toFixed(0)}/person ({membersInRoom.length} member{membersInRoom.length !== 1 ? "s" : ""} in Room {room})
                    </div>
                  </div>

                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePaid(bill);
                      }}
                      disabled={togglePaid.isPending}
                    >
                      {bill.paid ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                  {!isOwner && bill.paid && (
                    <Check className="h-5 w-5 text-success shrink-0" />
                  )}
                </div>
              );
            })
        )}
      </CardContent>

      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settle Utility Bill</DialogTitle>
            <DialogDescription>
              Record who paid this bill and how it should be split among roommates.
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <form onSubmit={handleSettleBill} className="space-y-4 pt-4">
              <div className="p-4 bg-muted rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium capitalize">{getBillLabel(selectedBill.bill_type)}</p>
                  <p className="text-xs text-muted-foreground">{selectedBill.month}</p>
                </div>
                <p className="text-xl font-bold">₹{selectedBill.amount}</p>
              </div>

              <div className="space-y-2">
                <Label>Paid By</Label>
                <Select value={paidBy} onValueChange={setPaidBy}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {billParticipants.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} {m.id === currentMemberId ? "(You)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl text-sm">
                <p className="text-muted-foreground">
                  Split: ₹{(Number(selectedBill.amount) / participantCount).toFixed(0)} each among {participantCount} member{participantCount !== 1 ? "s" : ""} in Room {billRoom}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSettleOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={addExpense.isPending || togglePaid.isPending}
                >
                  {addExpense.isPending ? "Processing..." : "Confirm Payment"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
