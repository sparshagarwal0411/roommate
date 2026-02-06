import React from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Expense } from '@/hooks/useHostel';
import { cn } from '@/lib/utils';

interface SpendingHeatmapProps {
    month: string; // YYYY-MM
    expenses: Expense[];
}

export const SpendingHeatmap = ({ month, expenses }: SpendingHeatmapProps) => {
    const monthDate = parseISO(`${month}-01`);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate daily totals
    const dailyTotals: Record<string, number> = {};
    expenses.forEach(e => {
        const dStr = format(parseISO(e.created_at), 'yyyy-MM-dd');
        dailyTotals[dStr] = (dailyTotals[dStr] || 0) + Number(e.amount);
    });

    // Scale relative to max spent in a single day *this month* (not global max)
    const maxSpendingThisMonth = Math.max(...Object.values(dailyTotals), 1);

    // Padding for the start of the week (0 = Sunday)
    const firstDayOfWeek = getDay(monthStart);
    const paddingDays = Array.from({ length: firstDayOfWeek });

    return (
        <div className="p-6 bg-card/50 backdrop-blur-sm rounded-[2rem] border border-border/50 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold tracking-tight">{format(monthDate, 'MMMM yyyy')}</h3>
                    <p className="text-xs text-muted-foreground">Daily spending heatmap</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-primary/30" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Max this month: ₹{maxSpendingThisMonth.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-black text-muted-foreground uppercase opacity-40">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
                {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                ))}
                {daysInMonth.map((day) => {
                    const dStr = format(day, 'yyyy-MM-dd');
                    const total = dailyTotals[dStr] || 0;
                    const ratio = total / maxSpendingThisMonth;

                    // Scale from 30% to 100% of the cell size for non-zero spending
                    const scale = total > 0 ? 30 + (ratio * 70) : 0;

                    return (
                        <TooltipProvider key={dStr}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <div className="aspect-square flex items-center justify-center relative group cursor-pointer">
                                        {/* Day Number */}
                                        <span className={cn(
                                            "text-[10px] font-bold z-10 transition-all duration-300",
                                            total > 0 ? "text-foreground" : "text-muted-foreground opacity-30 group-hover:opacity-100"
                                        )}>
                                            {format(day, 'd')}
                                        </span>

                                        {/* Heatmap Circle */}
                                        {total > 0 && (
                                            <div
                                                className="absolute rounded-full bg-primary shadow-lg transition-all duration-700 ease-out group-hover:scale-110 group-hover:shadow-primary/20"
                                                style={{
                                                    width: `${Math.min(scale, 100)}%`,
                                                    height: `${Math.min(scale, 100)}%`,
                                                    opacity: 0.15 + (ratio * 0.75),
                                                    background: `radial-gradient(circle at 30% 30%, hsl(var(--primary)), hsl(var(--primary) / 0.8))`
                                                }}
                                            />
                                        )}

                                        {/* Today marker if current month/day */}
                                        {format(new Date(), 'yyyy-MM-dd') === dStr && (
                                            <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-accent rounded-full border border-background shadow-sm" />
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-popover/90 backdrop-blur-md border-primary/20 px-3 py-2">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                            {format(day, 'EEEE, MMM do')}
                                        </p>
                                        <p className="text-lg font-black tracking-tighter">
                                            ₹{total.toLocaleString()}
                                        </p>
                                        {total > 0 && (
                                            <div className="mt-1 h-1 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${ratio * 100}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
        </div>
    );
};
