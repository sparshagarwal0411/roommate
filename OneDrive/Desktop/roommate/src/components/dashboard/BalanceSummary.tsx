import { ArrowRight, AlertCircle, CheckCircle2, MessageCircle, CheckCircle, Loader2, Bell, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Member, Expense, Settlement as SettlementType, useAddSettlement, useAddNotification, useHostel } from "@/hooks/useHostel";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or I'll use Input/Textarea native
import { supabase } from "@/integrations/supabase/client";
import { startOfDay } from "date-fns";

interface BalanceSummaryProps {
  members: Member[];
  expenses: Expense[];
  settlements: SettlementType[];
  currentMemberId?: string;
  isOwner?: boolean;
}

interface Balance {
  memberId: string;
  name: string;
  paid: number;
  owes: number;
  balance: number; // positive = owed money, negative = owes money
}

interface SettlementUI {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

// Polite reminder messages for different situations
const reminderMessages = {
  small: [
    "Hey! Just a gentle reminder about ₹{amount} for our hostel expenses 😊",
    "Quick heads up! You owe ₹{amount} for shared expenses. No rush, just whenever you can! 🙏",
  ],
  medium: [
    "Hi! Friendly reminder that ₹{amount} is pending for our shared expenses. Would be great if you could settle when free! 💫",
    "Hey buddy! Just checking in about ₹{amount} for the group expenses. Let me know if you need more time! 🤝",
  ],
  large: [
    "Hello! There's ₹{amount} pending for shared expenses. I understand things get busy - just wanted to give you a heads up! 😊",
    "Hey! The pending amount is ₹{amount}. Please settle it whenever convenient. We're all in this together! 🏠",
  ],
};

export const BalanceSummary = ({ members, expenses, settlements, currentMemberId, isOwner }: BalanceSummaryProps) => {
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementUI | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const addSettlement = useAddSettlement();
  const addNotification = useAddNotification();
  const { data: hostel } = useHostel(members[0]?.hostel_id || null);

  // Calculate balances
  const calculateBalances = (): Balance[] => {
    const balances: Record<string, Balance> = {};

    // Initialize all members
    members.forEach((member) => {
      balances[member.id] = {
        memberId: member.id,
        name: member.name,
        paid: 0,
        owes: 0,
        balance: 0,
      };
    });

    // Calculate what each person paid and owes
    expenses.forEach((expense) => {
      const amount = Number(expense.amount);

      // Determine who splits this expense
      const splitAmong = expense.participants && expense.participants.length > 0
        ? members.filter(m => expense.participants?.includes(m.id))
        : members.filter(m => {
          if (!expense.created_at) return true;
          const memberJoinDate = new Date(m.created_at).getTime();
          const expenseDate = new Date(expense.created_at).getTime();
          // Always include the payer, or anyone who joined before or within 1 minute of the expense
          return m.id === expense.paid_by_member_id || memberJoinDate <= expenseDate + 60000;
        });

      const actualSplitAmong = splitAmong.length > 0 ? splitAmong : members;
      const splitAmount = amount / actualSplitAmong.length;

      if (balances[expense.paid_by_member_id]) {
        balances[expense.paid_by_member_id].paid += amount;
      }

      actualSplitAmong.forEach((member) => {
        if (balances[member.id]) {
          balances[member.id].owes += splitAmount;
        }
      });
    });

    // Subtract recorded settlements
    settlements.forEach((s) => {
      if (balances[s.from_member_id]) {
        balances[s.from_member_id].owes -= Number(s.amount);
      }
      if (balances[s.to_member_id]) {
        balances[s.to_member_id].paid -= Number(s.amount);
      }
    });

    Object.values(balances).forEach((b) => {
      b.balance = b.paid - b.owes;
    });

    return Object.values(balances);
  };

  // Simplify debts to minimal transactions
  const calculateSettlements = (balances: Balance[]): SettlementUI[] => {
    const settlementsUI: SettlementUI[] = [];

    const debtors = balances
      .filter((b) => b.balance < -0.5)
      .map((b) => ({ ...b }))
      .sort((a, b) => a.balance - b.balance);

    const creditors = balances
      .filter((b) => b.balance > 0.5)
      .map((b) => ({ ...b }))
      .sort((a, b) => b.balance - a.balance);

    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(-debtor.balance, creditor.balance);

      if (amount > 0.5) {
        settlementsUI.push({
          from: debtor.memberId,
          fromName: debtor.name,
          to: creditor.memberId,
          toName: creditor.name,
          amount: Math.round(amount * 100) / 100,
        });
      }

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.5) i++;
      if (Math.abs(creditor.balance) < 0.5) j++;
    }

    return settlementsUI;
  };

  const balances = calculateBalances();
  const pendingSettlements = calculateSettlements(balances);

  const handleMarkAsPaid = async (s: SettlementUI) => {
    const hostelId = members[0]?.hostel_id;
    if (!hostelId) return;

    try {
      await addSettlement.mutateAsync({
        hostel_id: hostelId,
        from_member_id: s.from,
        to_member_id: s.to,
        amount: s.amount,
      });

      // Notify the person who receives the money
      const sender = members.find(m => m.id === s.from);
      try {
        await addNotification.mutateAsync({
          hostel_id: hostelId,
          recipient_id: s.to,
          sender_id: s.from,
          actor_name: sender?.name || "A Roommate",
          type: 'payment',
          content: `${sender?.name} paid back his split of ₹${s.amount.toLocaleString()}...`,
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
        // Don't fail the whole action just because notification failed
      }

      toast.success(`Settlement recorded! ₹${s.amount} marked as paid. ✅`);
      setSelectedSettlement(null);
    } catch (error) {
      toast.error("Failed to record settlement.");
    }
  };

  const handleSendReminder = async (s: SettlementUI) => {
    const hostelId = members[0]?.hostel_id;
    if (!hostelId) return;

    // 1. Rate Check (Local Storage)
    const today = new Date().toDateString(); // e.g. "Mon Jan 01 2026"
    const storageKey = `reminder_${hostelId}_${s.from}_${today}`;

    if (localStorage.getItem(storageKey)) {
      toast.error("Daily limit reached! You can remind this person once per day. ⏳");
      return;
    }

    try {
      // 2. Send Reminder
      const creditor = members.find(m => m.id === s.to);
      const finalContent = customMessage.trim()
        ? `Total Due: ₹${s.amount.toLocaleString()}\n\n${customMessage.trim()}`
        : getRandomReminder(s.amount);

      await addNotification.mutateAsync({
        hostel_id: hostelId,
        recipient_id: s.from,
        sender_id: s.to,
        actor_name: creditor?.name || "A Roommate",
        type: 'reminder',
        content: finalContent,
      });

      // Mark as sent for today
      localStorage.setItem(storageKey, "true");

      toast.success("In-app reminder sent! 🔔");
      setSelectedSettlement(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reminder. Try again.");
    }
  };

  const getRandomReminder = (amount: number): string => {
    let messages = reminderMessages.small;
    if (amount > 1000) messages = reminderMessages.large;
    else if (amount > 500) messages = reminderMessages.medium;

    const msg = messages[Math.floor(Math.random() * messages.length)];
    return msg.replace("{amount}", amount.toLocaleString());
  };

  const copyReminder = (s: SettlementUI) => {
    const message = getRandomReminder(s.amount);
    navigator.clipboard.writeText(message);
    toast.success("Reminder copied! 📋 Share it politely 😊");
    setSelectedSettlement(null);
  };

  if (expenses.length === 0 || members.length === 0) {
    return (
      <Card variant="success">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
          <p className="font-semibold">All settled up! 🎉</p>
          <p className="text-sm text-muted-foreground">No pending dues</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="default">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Who Owes Whom
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingSettlements.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Everyone's squared up! 🎉</p>
            </div>
          ) : (
            pendingSettlements.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/10 rounded-xl animate-fade-in cursor-pointer hover:bg-destructive/10 transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setSelectedSettlement(s)}
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="font-semibold truncate">{s.fromName}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold truncate">{s.toName}</span>
                </div>
                <span className="font-bold text-destructive shrink-0">
                  ₹{s.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}

          {pendingSettlements.length > 0 && (
            <p className="text-[10px] text-muted-foreground text-center pt-2 italic">
              💡 Tap on a debt to remind or mark as paid
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Balance Card - Personal Wallet */}
      {(() => {
        const myBalance = balances.find(b => b.memberId === currentMemberId);
        if (!myBalance) return null;

        return (
          <Card variant="default" className="bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                My Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-success/10 rounded-xl border border-success/20">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Paid</span>
                    <p className="text-xl font-bold text-success mt-1">₹{Math.round(myBalance.paid).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">For group expenses</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-xl border border-destructive/20">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">My Share</span>
                    <p className="text-xl font-bold text-destructive mt-1">₹{Math.round(myBalance.owes).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">My consumption</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-xl border">
                  <div>
                    <span className="font-medium text-sm">Net Status</span>
                    <p className="text-xs text-muted-foreground">
                      {myBalance.balance > 0 ? "You are owed" : myBalance.balance < 0 ? "You owe" : "All settled"}
                    </p>
                  </div>
                  <span className={cn(
                    "text-2xl font-bold",
                    myBalance.balance > 0 ? "text-success" : myBalance.balance < 0 ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {myBalance.balance > 0 ? "+" : ""}₹{Math.abs(Math.round(myBalance.balance)).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {settlements.length > 0 && (
        <Card className="bg-success/5 border-success/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Recent Settlements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            {settlements.slice(0, 3).map((s, i) => {
              const fromName = members.find(m => m.id === s.from_member_id)?.name || "Unknown";
              const toName = members.find(m => m.id === s.to_member_id)?.name || "Unknown";
              return (
                <div key={s.id} className="flex items-center justify-between text-xs p-2 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="truncate max-w-[60px]">{fromName}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[60px]">{toName}</span>
                  </div>
                  <span className="font-bold text-success shrink-0">₹{Number(s.amount).toLocaleString()}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Settlement/Reminder Dialog */}
      <Dialog open={!!selectedSettlement} onOpenChange={(open) => {
        if (!open) setSelectedSettlement(null);
        else if (selectedSettlement) setCustomMessage(getRandomReminder(selectedSettlement.amount));
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Settle Shared Debt
            </DialogTitle>
            <DialogDescription>
              Mark this payment as received or send a reminder to {selectedSettlement?.fromName}
            </DialogDescription>
          </DialogHeader>

          {selectedSettlement && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-muted rounded-xl text-center">
                <p className="text-xl font-bold text-destructive">
                  ₹{selectedSettlement.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedSettlement.fromName} owes {selectedSettlement.toName}
                </p>
              </div>

              <div className="grid gap-3">
                <Button
                  variant="hero"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleMarkAsPaid(selectedSettlement)}
                  disabled={addSettlement.isPending}
                >
                  {addSettlement.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Mark as Fully Paid
                </Button>

                {(currentMemberId === selectedSettlement.to || isOwner) && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or send reminder</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium">Message:</p>
                      <Textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="text-xs min-h-[80px]"
                        placeholder="Type a polite reminder..."
                      />
                      <p className="text-[10px] text-muted-foreground text-right">Limit: 1/day</p>
                    </div>

                    <Button
                      variant="hero"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => handleSendReminder(selectedSettlement)}
                      disabled={addNotification.isPending}
                    >
                      {addNotification.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bell className="h-4 w-4 mr-2" />
                      )}
                      Send In-App Alert
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => copyReminder(selectedSettlement)}
                >
                  Copy Polite Reminder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
