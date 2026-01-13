import { ArrowRight, AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Member, Expense } from "@/hooks/useHostel";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface BalanceSummaryProps {
  members: Member[];
  expenses: Expense[];
}

interface Balance {
  memberId: string;
  name: string;
  paid: number;
  owes: number;
  balance: number; // positive = owed money, negative = owes money
}

interface Settlement {
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

export const BalanceSummary = ({ members, expenses }: BalanceSummaryProps) => {
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

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
      const splitAmount = amount / members.length;

      // Add to paid amount for the payer
      if (balances[expense.paid_by_member_id]) {
        balances[expense.paid_by_member_id].paid += amount;
      }

      // Each member owes their split
      members.forEach((member) => {
        balances[member.id].owes += splitAmount;
      });
    });

    // Calculate net balance
    Object.values(balances).forEach((b) => {
      b.balance = b.paid - b.owes;
    });

    return Object.values(balances);
  };

  // Simplify debts to minimal transactions
  const calculateSettlements = (balances: Balance[]): Settlement[] => {
    const settlements: Settlement[] = [];
    
    // Create copies for calculation
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
        settlements.push({
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

    return settlements;
  };

  const balances = calculateBalances();
  const settlements = calculateSettlements(balances);

  const getRandomReminder = (amount: number): string => {
    let messages = reminderMessages.small;
    if (amount > 1000) messages = reminderMessages.large;
    else if (amount > 500) messages = reminderMessages.medium;
    
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return msg.replace("{amount}", amount.toLocaleString());
  };

  const copyReminder = (settlement: Settlement) => {
    const message = getRandomReminder(settlement.amount);
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
    <>
      <Card variant="default">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Who Owes Whom
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settlements.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Everyone's squared up! 🎉</p>
            </div>
          ) : (
            settlements.map((settlement, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-warning/10 rounded-xl animate-fade-in cursor-pointer hover:bg-warning/15 transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setSelectedSettlement(settlement)}
              >
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="font-semibold truncate">{settlement.fromName}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold truncate">{settlement.toName}</span>
                </div>
                <span className="font-bold text-warning shrink-0">
                  ₹{settlement.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}

          {settlements.length > 0 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              💡 Tap on a settlement to send a friendly reminder
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reminder Dialog */}
      <Dialog open={!!selectedSettlement} onOpenChange={() => setSelectedSettlement(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Send a Friendly Reminder
            </DialogTitle>
            <DialogDescription>
              Copy a polite message to remind {selectedSettlement?.fromName}
            </DialogDescription>
          </DialogHeader>

          {selectedSettlement && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm leading-relaxed">
                  {getRandomReminder(selectedSettlement.amount)}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedSettlement(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => copyReminder(selectedSettlement)}
                >
                  Copy Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
