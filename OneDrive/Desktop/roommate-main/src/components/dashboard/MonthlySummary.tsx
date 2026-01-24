import React, { useState } from "react";
import { Download, ChevronDown, ChevronUp, Banknote, TrendingUp, Users, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expense, Member } from "@/hooks/useHostel";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Settlement {
  from: Member;
  to: Member;
  amount: number;
}

interface MonthlySummaryProps {
  expenses: Expense[];
  members: Member[];
  month: string; // yyyy-MM format
}

export const MonthlySummary = ({ expenses, members, month }: MonthlySummaryProps) => {
  const [expanded, setExpanded] = useState(false);

  // Calculate total spent per person
  const spentPerPerson: Record<string, number> = {};
  const paidByPerson: Record<string, number> = {};

  members.forEach((member) => {
    spentPerPerson[member.id] = 0;
    paidByPerson[member.id] = 0;
  });

  // Calculate amounts
  expenses.forEach((expense) => {
    const amount = Number(expense.amount);
    paidByPerson[expense.paid_by_member_id] = (paidByPerson[expense.paid_by_member_id] || 0) + amount;

    // Split expense among participants
    if (expense.split_equally && expense.participants && expense.participants.length > 0) {
      const sharePerPerson = amount / expense.participants.length;
      expense.participants.forEach((participantId) => {
        spentPerPerson[participantId] = (spentPerPerson[participantId] || 0) + sharePerPerson;
      });
    } else {
      // If not split equally, just attribute to payer
      spentPerPerson[expense.paid_by_member_id] = (spentPerPerson[expense.paid_by_member_id] || 0) + amount;
    }
  });

  // Calculate settlements (who owes whom)
  const settlements: Settlement[] = [];
  const balances: Record<string, number> = {};

  // Calculate net balance for each person (positive = owed to them, negative = they owe)
  members.forEach((member) => {
    const paid = paidByPerson[member.id] || 0;
    const spent = spentPerPerson[member.id] || 0;
    balances[member.id] = paid - spent;
  });

  // Simple settlement algorithm - match debtors with creditors
  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance < 0)
    .map(([memberId, balance]) => ({ memberId, balance: Math.abs(balance) }));

  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance > 0)
    .map(([memberId, balance]) => ({ memberId, balance }));

  debtors.forEach((debtor) => {
    let remaining = debtor.balance;

    for (let i = 0; i < creditors.length && remaining > 0; i++) {
      const creditor = creditors[i];
      const amount = Math.min(remaining, creditor.balance);

      const debtorMember = members.find((m) => m.id === debtor.memberId);
      const creditorMember = members.find((m) => m.id === creditor.memberId);

      if (debtorMember && creditorMember && amount > 0) {
        settlements.push({
          from: debtorMember,
          to: creditorMember,
          amount,
        });
      }

      creditor.balance -= amount;
      remaining -= amount;
    }
  });

  // Total calculations
  const totalSpent = Object.values(spentPerPerson).reduce((a, b) => a + b, 0);
  const totalPaid = Object.values(paidByPerson).reduce((a, b) => a + b, 0);

  // Export to PDF
  const handleExportPDF = () => {
    const html = generatePDFHTML();
    const element = document.createElement("div");
    element.innerHTML = html;
    document.body.appendChild(element);

    // Use html2canvas + jspdf if available, otherwise use a simple approach
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }

    document.body.removeChild(element);
    toast.success("Monthly summary ready to export! 📄");
  };

  const generatePDFHTML = () => {
    const monthName = format(parseISO(month + "-01"), "MMMM yyyy");
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Monthly Summary - ${monthName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h1 { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
          h2 { color: #444; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:hover { background-color: #f9f9f9; }
          .settlement { background-color: #e8f5e9; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .positive { color: #4caf50; font-weight: bold; }
          .negative { color: #f44336; font-weight: bold; }
          .summary { display: flex; justify-content: space-around; margin: 20px 0; }
          .summary-box { text-align: center; padding: 15px; background-color: #f5f5f5; border-radius: 5px; flex: 1; margin: 0 10px; }
          .summary-box h3 { margin: 0; color: #666; font-size: 12px; }
          .summary-box .value { font-size: 24px; font-weight: bold; color: #0066cc; margin-top: 5px; }
        </style>
      </head>
      <body>
        <h1>Monthly Summary Report</h1>
        <p><strong>Period:</strong> ${format(parseISO(month + "-01"), "MMMM yyyy")}</p>
        <p><strong>Generated:</strong> ${format(new Date(), "MMM d, yyyy 'at' hh:mm a")}</p>

        <div class="summary">
          <div class="summary-box">
            <h3>TOTAL EXPENSES</h3>
            <div class="value">₹${totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-box">
            <h3>TOTAL PAID</h3>
            <div class="value">₹${totalPaid.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-box">
            <h3>PEOPLE INVOLVED</h3>
            <div class="value">${members.length}</div>
          </div>
        </div>

        <h2>Expense Breakdown</h2>
        <table>
          <tr>
            <th>Member</th>
            <th>Amount Paid</th>
            <th>Amount Spent</th>
            <th>Balance</th>
          </tr>
          ${members
            .map((member) => {
              const paid = paidByPerson[member.id] || 0;
              const spent = spentPerPerson[member.id] || 0;
              const balance = paid - spent;
              const balanceClass = balance >= 0 ? "positive" : "negative";
              return `
                <tr>
                  <td>${member.name}</td>
                  <td>₹${paid.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td>₹${spent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td class="${balanceClass}">
                    ${balance >= 0 ? "+" : ""}₹${balance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              `;
            })
            .join("")}
        </table>

        <h2>Settlement Suggestions</h2>
        ${
          settlements.length === 0
            ? "<p>Everyone is settled! No transfers needed.</p>"
            : settlements
                .map(
                  (settlement) =>
                    `<div class="settlement">
                  <strong>${settlement.from.name}</strong> should pay <strong>₹${settlement.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong> to <strong>${settlement.to.name}</strong>
                </div>`
                )
                .join("")
        }

        <p style="margin-top: 40px; font-size: 12px; color: #999;">
          This report was generated automatically. Please verify calculations with roommates.
        </p>
      </body>
      </html>
    `;
  };

  if (members.length === 0) {
    return null;
  }

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="h-5 w-5 text-info" />
            Monthly Summary
          </CardTitle>
          <Button
            variant="soft"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total Spent</p>
            <p className="text-xl font-bold text-primary mt-1">₹{totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-success/10 p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total Paid</p>
            <p className="text-xl font-bold text-success mt-1">₹{totalPaid.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-warning/10 p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Avg per Person</p>
            <p className="text-xl font-bold text-warning mt-1">₹{(totalSpent / members.length).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <span className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Expense Breakdown
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {members.map((member) => {
                const paid = paidByPerson[member.id] || 0;
                const spent = spentPerPerson[member.id] || 0;
                const balance = paid - spent;

                return (
                  <div
                    key={member.id}
                    className="p-3 bg-muted/30 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Paid: ₹{paid.toLocaleString("en-IN", { maximumFractionDigits: 0 })} • Spent: ₹{spent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div
                      className={`text-right font-bold text-sm ${
                        balance >= 0 ? "text-success" : "text-warning"
                      }`}
                    >
                      {balance >= 0 ? "+" : ""}₹{balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settlement Suggestions */}
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            Settlement Suggestions
          </h3>

          {settlements.length === 0 ? (
            <div className="p-4 bg-success/10 rounded-lg text-center">
              <p className="text-sm font-semibold text-success">✓ Everyone is settled!</p>
              <p className="text-xs text-muted-foreground mt-1">All payments are balanced.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="p-3 bg-warning/10 rounded-lg border border-warning/30 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      <span className="text-warning">{settlement.from.name}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="text-warning">{settlement.to.name}</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    ₹{settlement.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export function MonthlySummaryButton({ expenses, members, month }: MonthlySummaryProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate total spent per person
  const spentPerPerson: Record<string, number> = {};
  const paidByPerson: Record<string, number> = {};

  members.forEach((member) => {
    spentPerPerson[member.id] = 0;
    paidByPerson[member.id] = 0;
  });

  // Calculate amounts
  expenses.forEach((expense) => {
    const amount = Number(expense.amount);
    paidByPerson[expense.paid_by_member_id] = (paidByPerson[expense.paid_by_member_id] || 0) + amount;

    // Split expense among participants
    if (expense.split_equally && expense.participants && expense.participants.length > 0) {
      const sharePerPerson = amount / expense.participants.length;
      expense.participants.forEach((participantId) => {
        spentPerPerson[participantId] = (spentPerPerson[participantId] || 0) + sharePerPerson;
      });
    } else {
      // If not split equally, just attribute to payer
      spentPerPerson[expense.paid_by_member_id] = (spentPerPerson[expense.paid_by_member_id] || 0) + amount;
    }
  });

  // Calculate settlements (who owes whom)
  const settlements: Settlement[] = [];
  const balances: Record<string, number> = {};

  // Calculate net balance for each person (positive = owed to them, negative = they owe)
  members.forEach((member) => {
    const paid = paidByPerson[member.id] || 0;
    const spent = spentPerPerson[member.id] || 0;
    balances[member.id] = paid - spent;
  });

  // Simple settlement algorithm - match debtors with creditors
  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance < 0)
    .map(([memberId, balance]) => ({ memberId, balance: Math.abs(balance) }));

  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance > 0)
    .map(([memberId, balance]) => ({ memberId, balance }));

  debtors.forEach((debtor) => {
    let remaining = debtor.balance;

    for (let i = 0; i < creditors.length && remaining > 0; i++) {
      const creditor = creditors[i];
      const amount = Math.min(remaining, creditor.balance);

      const debtorMember = members.find((m) => m.id === debtor.memberId);
      const creditorMember = members.find((m) => m.id === creditor.memberId);

      if (debtorMember && creditorMember && amount > 0.01) {
        settlements.push({
          from: debtorMember,
          to: creditorMember,
          amount,
        });

        creditor.balance -= amount;
        remaining -= amount;
      }
    }
  });

  const handleExportPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Monthly Summary Report</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 900px; margin: 20px auto; background-color: white; padding: 30px; border-radius: 8px; }
          h1 { color: #333; text-align: center; }
          h2 { color: #444; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:hover { background-color: #f9f9f9; }
          .settlement { background-color: #e8f5e9; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .positive { color: #4caf50; font-weight: bold; }
          .negative { color: #f44336; font-weight: bold; }
          .summary { display: flex; justify-content: space-around; margin: 20px 0; }
          .summary-box { text-align: center; padding: 15px; background-color: #f5f5f5; border-radius: 5px; flex: 1; margin: 0 10px; }
          .summary-box h3 { margin: 0; color: #666; font-size: 12px; }
          .summary-box .value { font-size: 24px; font-weight: bold; color: #0066cc; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Monthly Summary Report</h1>
          <p><strong>Period:</strong> ${format(parseISO(month + "-01"), "MMMM yyyy")}</p>
          <p><strong>Generated:</strong> ${format(new Date(), "MMM d, yyyy 'at' hh:mm a")}</p>

          <div class="summary">
            <div class="summary-box">
              <h3>Total Spent</h3>
              <div class="value">₹${Object.values(spentPerPerson).reduce((sum, v) => sum + v, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            </div>
            <div class="summary-box">
              <h3>Total Paid</h3>
              <div class="value">₹${Object.values(paidByPerson).reduce((sum, v) => sum + v, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            </div>
            <div class="summary-box">
              <h3>Avg per Person</h3>
              <div class="value">₹${(Object.values(spentPerPerson).reduce((sum, v) => sum + v, 0) / members.length).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            </div>
          </div>

          <h2>Per-Person Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Paid</th>
                <th>Spent</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${members.map((m) => {
        const paid = paidByPerson[m.id] || 0;
        const spent = spentPerPerson[m.id] || 0;
        const balance = paid - spent;
        return `
                <tr>
                  <td>${m.name}</td>
                  <td>₹${paid.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                  <td>₹${spent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                  <td class="${balance >= 0 ? "positive" : "negative"}">
                    ${balance >= 0 ? "+" : ""}₹${balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              `;
      }).join("")}
            </tbody>
          </table>

          <h2>Settlement Suggestions</h2>
          ${settlements.length === 0
        ? '<p style="color: #4caf50;"><strong>✓ Everyone is settled!</strong></p>'
        : settlements.map((s) => `
            <div class="settlement">
              <strong>${s.from.name}</strong> should pay <strong>₹${s.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong> to <strong>${s.to.name}</strong>
            </div>
          `).join("")
      }
        </div>
      </body>
      </html>
    `;

    const newWindow = window.open("", "PRINT", "height=600,width=900");
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.print();
    }

    toast.success("PDF ready for download!");
  };

  const totalSpent = Object.values(spentPerPerson).reduce((sum, v) => sum + v, 0);
  const totalPaid = Object.values(paidByPerson).reduce((sum, v) => sum + v, 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Monthly Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Monthly Summary Report</DialogTitle>
          <DialogDescription>
            {format(parseISO(month + "-01"), "MMMM yyyy")} • Generated {format(new Date(), "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-primary/10 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total Spent</p>
                <p className="text-lg font-bold text-primary mt-1">₹{totalSpent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-success/10 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total Paid</p>
                <p className="text-lg font-bold text-success mt-1">₹{totalPaid.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-warning/10 p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Avg per Person</p>
                <p className="text-lg font-bold text-warning mt-1">₹{(totalSpent / members.length).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            {/* Expense Breakdown Table */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Per-Person Breakdown
              </h3>
              <div className="rounded-lg border overflow-hidden text-sm">
                <div className="bg-muted px-3 py-2 grid grid-cols-3 gap-2 font-semibold text-xs">
                  <div>Member</div>
                  <div>Paid</div>
                  <div>Balance</div>
                </div>
                <div className="divide-y">
                  {members.map((member) => {
                    const paid = paidByPerson[member.id] || 0;
                    const spent = spentPerPerson[member.id] || 0;
                    const balance = paid - spent;

                    return (
                      <div key={member.id} className="px-3 py-2 grid grid-cols-3 gap-2 text-xs">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-muted-foreground">₹{paid.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
                        <div
                          className={`font-semibold ${
                            balance >= 0 ? "text-success" : "text-warning"
                          }`}
                        >
                          {balance >= 0 ? "+" : ""}₹{balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Settlement Suggestions */}
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                Settlement Suggestions
              </h3>

              {settlements.length === 0 ? (
                <div className="p-3 bg-success/10 rounded-lg text-center text-sm">
                  <p className="font-semibold text-success">✓ Everyone is settled!</p>
                  <p className="text-xs text-muted-foreground mt-1">All payments are balanced.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settlements.map((settlement, index) => (
                    <div
                      key={index}
                      className="p-3 bg-warning/10 rounded-lg border border-warning/30 flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-semibold">
                          <span className="text-warning">{settlement.from.name}</span>
                          <span className="text-muted-foreground mx-2">→</span>
                          <span className="text-warning">{settlement.to.name}</span>
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        ₹{settlement.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PDF Export Button */}
            <Button
              onClick={handleExportPDF}
              className="w-full gap-2"
              variant="default"
            >
              <Download className="h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
