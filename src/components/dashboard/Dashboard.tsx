import { useState, useEffect, useMemo } from "react";
import { Building2, LogOut, DoorOpen, Trash2, Pencil, Check, X, LayoutDashboard, History, MessageSquare, Utensils, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { ShareButton } from "@/components/ShareButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Footer } from "@/components/Footer";
import { MembersList } from "./MembersList";
import { BudgetTracker } from "./BudgetTracker";
import { ExpenseForm } from "./ExpenseForm";
import { ExpensesList } from "./ExpensesList";
import { UtilityBills } from "./UtilityBills";
import { RecurringBills } from "./RecurringBills";
import { BalanceSummary } from "./BalanceSummary";
import { SpendingCharts } from "./SpendingCharts";
import { IncomeForm } from "./IncomeForm";
import { MonthlyHistory } from "./MonthlyHistory";
import { NotificationBell } from "./NotificationBell";
import { NotificationPopup } from "./NotificationPopup";
import { BroadcastDialog } from "./BroadcastDialog";
import { MonthlySummary, MonthlySummaryButton } from "./MonthlySummary";
import { AISpendingAdvisor } from "./AISpendingAdvisor";
import { EchoVoiceAssistant } from "./EchoVoiceAssistant";
import { ComplaintsDashboard } from "./ComplaintsDashboard";
import { AnnouncementsList } from "./AnnouncementsList";
import { MessDashboard } from "./MessDashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  useHostel,
  useMembers,
  useExpenses,
  useUtilityBills,
  useRecurringBills,
  useRemoveMember,
  useDeleteHostel,
  useUpdateHostel,
  useIncomes,
  useSettlements,
  useUpdateMember,
  Hostel,
  useResetBalances
} from "@/hooks/useHostel";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardProps {
  hostelId: string;
  onLeave: () => void;
}

export const Dashboard = ({ hostelId, onLeave }: DashboardProps) => {
  const { data: hostel, isLoading: hostelLoading } = useHostel(hostelId);
  const { data: members = [], isLoading: membersLoading } = useMembers(hostelId);
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(hostelId);
  const { data: utilityBills = [], isLoading: billsLoading } = useUtilityBills(hostelId);
  const { data: recurringBills = [], isLoading: recurringBillsLoading } = useRecurringBills(hostelId);
  const { data: incomes = [], isLoading: incomesLoading } = useIncomes(hostelId);
  const { data: settlements = [], isLoading: settlementsLoading } = useSettlements(hostelId);

  const removeMember = useRemoveMember();
  const deleteHostel = useDeleteHostel();
  const updateHostel = useUpdateHostel();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const navigate = useNavigate();
  const [editedName, setEditedName] = useState("");
  const [editedRoom, setEditedRoom] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const resetBalances = useResetBalances();

  const [viewMode, setViewMode] = useState<"current" | "history" | "complaints" | "mess">("current");
  const [complaintsSubTab, setComplaintsSubTab] = useState<"maintenance" | "lostfound">("maintenance");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [alertedThresholds, setAlertedThresholds] = useState<{ [key: string]: Set<number> }>(
    () => ({
      [format(new Date(), "yyyy-MM")]: new Set(),
    })
  );

  const updateMember = useUpdateMember();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  // Self-healing: Link profile_id to member record if missing
  useEffect(() => {
    if (!currentUserId || membersLoading || members.length === 0) return;

    const meFound = members.find(m => m.profile_id === currentUserId);
    if (!meFound) {
      const storedMemberId = localStorage.getItem('roommate_member_id');
      if (storedMemberId) {
        const storedMember = members.find(m => m.id === storedMemberId);
        if (storedMember && !storedMember.profile_id) {
          console.log("Healing: Linking profile to member...");
          updateMember.mutateAsync({
            memberId: storedMemberId,
            hostelId,
            profile_id: currentUserId,
          } as any).then(() => {
            queryClient.invalidateQueries({ queryKey: ['members', hostelId] });
          }).catch(err => console.error("Linkage failed:", err));
        }
      }
    }
  }, [currentUserId, members, membersLoading, hostelId]);

  const me = members.find(m => m.profile_id === currentUserId);
  const isOwner = currentUserId === hostel?.owner_id;

  const handleUpdateName = async () => {
    if (!editedName.trim() || editedName === hostel?.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await updateHostel.mutateAsync({ hostelId, name: editedName.trim() });
      toast.success("Hostel name updated! 🏢");
      setIsEditingName(false);
    } catch (error) {
      toast.error("Failed to update hostel name.");
    }
  };

  const handleUpdateRoom = async () => {
    if (!editedRoom.trim() || editedRoom === (hostel?.room_no || "")) {
      setIsEditingRoom(false);
      return;
    }
    try {
      await updateHostel.mutateAsync({ hostelId, room_no: editedRoom.trim() });
      toast.success("Room number updated! 🚪");
      setIsEditingRoom(false);
    } catch (error) {
      toast.error("Failed to update room number.");
    }
  };

  const startEditingName = () => {
    setEditedName(hostel?.name || "");
    setIsEditingName(true);
  };

  const startEditingRoom = () => {
    setEditedRoom(hostel?.room_no || "");
    setIsEditingRoom(true);
  };

  const handleDeleteHostel = async () => {
    if (!isOwner) return;

    if (!confirm("CRITICAL: This will permanently delete the hostel and all its data. Are you absolutely sure?")) return;

    try {
      await deleteHostel.mutateAsync(hostelId);
      toast.success("Hostel deleted successfully.");
      onLeave();
    } catch (error) {
      toast.error("Failed to delete hostel.");
    }
  };

  const handleExitHostel = async () => {
    if (!me) return;

    const message = isOwner
      ? "As the owner, if you leave, you might want to delete the hostel instead. Are you sure you want to remove yourself?"
      : "Are you sure you want to leave this hostel? You will be removed from the roommates list.";

    if (!confirm(message)) return;

    try {
      await removeMember.mutateAsync({ memberId: me.id, hostelId });
      toast.success("You have left the hostel. 👋");
      onLeave();
    } catch (error) {
      toast.error("Failed to leave the hostel. Try again?");
    }
  };

  const handleResetBalances = async () => {
    if (!isOwner) return;

    if (!confirm("DANGER: This will permanently delete all expenses, incomes, settlements, and utility bills. Balances will be reset to zero. Continue?")) return;
    if (!confirm("ARE YOU ABSOLUTELY SURE? This cannot be undone.")) return;

    try {
      await resetBalances.mutateAsync(hostelId);
      toast.success("Balances reset successfully! 🧹");
    } catch (error) {
      toast.error("Failed to reset balances.");
    }
  };

  const currentMonthStr = format(new Date(), "yyyy-MM");
  const activeMonth = selectedMonth || currentMonthStr;

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => format(parseISO(e.created_at), "yyyy-MM") === activeMonth);
  }, [expenses, activeMonth]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(i => format(parseISO(i.created_at), "yyyy-MM") === activeMonth);
  }, [incomes, activeMonth]);

  const filteredBills = useMemo(() => {
    // For utility bills:
    // If viewing history (selectedMonth is set): only show bills for that month
    // If viewing current (selectedMonth is null): show bills for current month OR any unpaid bills from past
    if (selectedMonth) {
      return utilityBills.filter(b => b.month === selectedMonth);
    }
    return utilityBills.filter(b => b.month === currentMonthStr || !b.paid);
  }, [utilityBills, activeMonth, selectedMonth, currentMonthStr]);

  const filteredSettlements = useMemo(() => {
    return settlements.filter(s => format(parseISO(s.created_at), "yyyy-MM") === activeMonth);
  }, [settlements, activeMonth]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBills = filteredBills.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalIncome = filteredIncomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalSpent = totalExpenses + totalBills;
  const currentBudget = (hostel?.monthly_budget || 0) + totalIncome;

  // Budget Alert Notifications
  useEffect(() => {
    if (!isOwner || !currentBudget || currentBudget === 0 || selectedMonth) return;

    const spendingPercentage = (totalSpent / currentBudget) * 100;
    const monthKey = activeMonth;

    const alertThresholds = [75, 90];

    alertThresholds.forEach((threshold) => {
      if (spendingPercentage >= threshold && !alertedThresholds[monthKey]?.has(threshold)) {
        const icon = threshold === 75 ? "🟠" : "🔴";
        const message = threshold === 75
          ? `Budget Alert! You've spent 75% of your budget (₹${Math.floor(totalSpent)}/₹${Math.floor(currentBudget)})`
          : `Warning! You've spent 90% of your budget (₹${Math.floor(totalSpent)}/₹${Math.floor(currentBudget)})`;

        toast.warning(`${icon} ${message}`);

        setAlertedThresholds(prev => ({
          ...prev,
          [monthKey]: new Set([...(prev[monthKey] || new Set()), threshold])
        }));
      }
    });
  }, [totalSpent, currentBudget, isOwner, selectedMonth, activeMonth, alertedThresholds]);

  const isInitialLoading = (hostelLoading && !hostel) || (membersLoading && members.length === 0);
  const isSyncing = hostelLoading || membersLoading || expensesLoading || billsLoading || recurringBillsLoading || incomesLoading || settlementsLoading;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 glass border-b">
          <div className="container flex items-center justify-between h-16">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
        <main className="container py-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  const navItems: { value: typeof viewMode; label: string; icon: React.ReactNode }[] = [
    { value: "current", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { value: "history", label: "History", icon: <History className="h-5 w-5" /> },
    { value: "complaints", label: "Complaints", icon: <MessageSquare className="h-5 w-5" /> },
    { value: "mess", label: "Mess", icon: <Utensils className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b drop-shadow-sm">
        <div className="container flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 px-3 sm:px-4">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <div
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <img
                src="/ChatGPT Image Jan 15, 2026, 09_03_32 PM.png"
                alt="RoomMate Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {isEditingName ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="h-8 w-32 md:w-48 text-lg font-bold"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                    />
                    <div className="flex items-center">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-success" onClick={handleUpdateName}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setIsEditingName(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-lg md:text-xl font-bold truncate">
                      {hostel?.name}
                    </h1>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={startEditingName}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 group">
                {isEditingRoom ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Input
                      value={editedRoom}
                      onChange={(e) => setEditedRoom(e.target.value)}
                      className="h-6 w-20 text-xs"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateRoom()}
                    />
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-success" onClick={handleUpdateRoom}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => setIsEditingRoom(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground truncate">
                      Room {hostel?.room_no || "N/A"} • {hostel?.code}
                    </p>
                    <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-1" onClick={startEditingRoom}>
                      <Pencil className="h-2.5 w-2.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Desktop: full actions + tabs */}
            <div className="hidden sm:flex items-center gap-2">
              <ShareButton
                hostelCode={hostel?.code || ""}
                hostelName={hostel?.name || ""}
                roomNo={hostel?.room_no}
              />
              {isOwner && me && (
                <BroadcastDialog members={members} currentMemberId={me.id} />
              )}
              <NotificationBell
                memberId={me?.id || null}
                onNavigateTo={(view, subTab) => {
                  setViewMode(view);
                  if (subTab) setComplaintsSubTab(subTab);
                }}
              />
              <NotificationPopup memberId={me?.id || null} />
              <ThemeToggle />
              <UserMenu />
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="current" className="text-xs">Dashboard</TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
                  <TabsTrigger value="complaints" className="text-xs">Complaints</TabsTrigger>
                  <TabsTrigger value="mess" className="text-xs">Mess</TabsTrigger>
                </TabsList>
              </Tabs>
              {isOwner && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-warning hover:bg-warning/10" onClick={handleResetBalances} disabled={resetBalances.isPending}>
                      <DoorOpen className="h-5 w-5 rotate-180" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Reset Balances (Zero all)</p></TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={isOwner ? handleDeleteHostel : handleExitHostel}>
                    {isOwner ? <Trash2 className="h-5 w-5" /> : <DoorOpen className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{isOwner ? "Delete Hostel" : "Leave Hostel"}</p></TooltipContent>
              </Tooltip>
            </div>
            {/* Mobile: menu sheet + bell only */}
            <div className="flex sm:hidden items-center gap-1">
              <NotificationBell
                memberId={me?.id || null}
                onNavigateTo={(view, subTab) => {
                  setViewMode(view);
                  if (subTab) setComplaintsSubTab(subTab);
                }}
              />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] flex flex-col gap-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigate</p>
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <Button
                        key={item.value}
                        variant={viewMode === item.value ? "secondary" : "ghost"}
                        className="justify-start gap-3"
                        onClick={() => setViewMode(item.value)}
                      >
                        {item.icon}
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  <div className="border-t pt-4 flex flex-col gap-1">
                    <div className="w-full [&_button]:w-full [&_button]:justify-start">
                      <ShareButton hostelCode={hostel?.code || ""} hostelName={hostel?.name || ""} roomNo={hostel?.room_no} />
                    </div>
                    {isOwner && me && <BroadcastDialog members={members} currentMemberId={me.id} />}
                    <ThemeToggle />
                    <UserMenu />
                    {isOwner && (
                      <Button variant="ghost" size="sm" className="justify-start text-warning" onClick={handleResetBalances} disabled={resetBalances.isPending}>
                        <DoorOpen className="h-5 w-5 rotate-180 mr-3" /> Reset Balances
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="justify-start text-destructive" onClick={isOwner ? handleDeleteHostel : handleExitHostel}>
                      {isOwner ? <Trash2 className="h-5 w-5 mr-3" /> : <DoorOpen className="h-5 w-5 mr-3" />}
                      {isOwner ? "Delete Hostel" : "Leave Hostel"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background/95 backdrop-blur border-t">
        <div className="grid grid-cols-4 h-14">
          {navItems.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setViewMode(item.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                viewMode === item.value ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="container py-6 space-y-6">
        <AnnouncementsList hostelId={hostelId} />

        {viewMode === "history" ? (
          <MonthlyHistory
            expenses={expenses}
            incomes={incomes}
            utilityBills={utilityBills}
            members={members}
            selectedMonth={selectedMonth}
            onSelectMonth={(month) => {
              setSelectedMonth(month);
              setViewMode("current");
            }}
          />
        ) : viewMode === "complaints" ? (
          <ComplaintsDashboard
            hostelId={hostelId}
            members={members}
            isOwner={isOwner}
            currentMemberId={me?.id}
            defaultTab={complaintsSubTab}
          />
        ) : viewMode === "mess" ? (
          <MessDashboard
            hostelId={hostelId}
            isOwner={isOwner}
          />
        ) : (
          <>
            {/* Welcome Message */}
            {me && (
              <section className="animate-fade-in p-4 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-2xl border border-primary/10 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    {selectedMonth ? `History: ${format(parseISO(selectedMonth + "-01"), "MMMM yyyy")} 🕰️` : `Welcome ${me.name}! 👋`}
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm md:text-base">
                    {selectedMonth
                      ? `Viewing data from a previous month. Transactions and balances are filtered.`
                      : `You're in Room ${me.room_no || "N/A"} of ${hostel?.name} 🏠`}
                  </p>
                </div>
                {selectedMonth && (
                  <Button variant="soft" size="sm" onClick={() => setSelectedMonth(null)}>
                    Back to Live
                  </Button>
                )}
              </section>
            )}

            {/* Top Row: Budget & Add Expense */}
            <div className={`grid md:grid-cols-2 gap-4 ${selectedMonth ? "opacity-50 pointer-events-none" : ""}`}>
              <BudgetTracker hostel={hostel!} totalSpent={totalSpent} totalIncome={totalIncome} expenses={filteredExpenses} />
              <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-dashed border-primary/20 justify-center h-full">
                <ExpenseForm members={members} hostelId={hostelId} />
                <IncomeForm hostelId={hostelId} />
              </div>
            </div>

            {selectedMonth && (
              <div className="p-2 bg-warning/10 border border-warning/20 rounded-lg text-xs text-warning-foreground text-center">
                ⚠️ You are viewing historical data. Adding new transactions is disabled until you return to the current month.
              </div>
            )}

            <MembersList
              members={members}
              hostelId={hostelId}
              isOwner={isOwner}
              currentProfileId={currentUserId || undefined}
            />

            {/* Calculations and Charts */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <AISpendingAdvisor
                  hostel={hostel!}
                  expenses={filteredExpenses}
                  members={members}
                  currentMemberId={me?.id}
                  totalSpent={totalSpent}
                />
                <BalanceSummary
                  members={members}
                  expenses={filteredExpenses}
                  settlements={filteredSettlements}
                  currentMemberId={me?.id}
                  isOwner={isOwner}
                />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <SpendingCharts expenses={filteredExpenses} members={members} />
                <div className="grid sm:grid-cols-2 gap-6">
                  <ExpensesList expenses={filteredExpenses} members={members} hostelId={hostelId} />
                  <UtilityBills
                    bills={filteredBills}
                    hostelId={hostelId}
                    memberCount={members.length}
                    isOwner={isOwner}
                    members={members}
                    currentMemberId={me?.id}
                  />
                </div>

                {isOwner && (
                  <RecurringBills
                    recurringBills={recurringBills}
                    hostelId={hostelId}
                    memberCount={members.length}
                    isOwner={isOwner}
                  />
                )}

                {/* Monthly Summary Button */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Month Summary</h3>
                  <MonthlySummaryButton
                    expenses={filteredExpenses}
                    members={members}
                    month={activeMonth}
                  />
                </div>
              </div>
            </div>


          </>
        )}
      </main>
      <ScrollToTop />
      <EchoVoiceAssistant members={members} hostelId={hostelId} />
      <Footer />
    </div>
  );
};
