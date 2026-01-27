import { Bell, CreditCard, Receipt, MessageCircle, Check, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useMarkNotificationRead, Notification } from "@/hooks/useHostel";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface NotificationBellProps {
    memberId: string | null;
}

export const NotificationBell = ({ memberId }: NotificationBellProps) => {
    const { data: notifications = [], refetch } = useNotifications(memberId);
    const markRead = useMarkNotificationRead();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const handleNotificationClick = async (n: Notification) => {
        setSelectedNotification(n);
        if (!n.is_read) {
            try {
                await markRead.mutateAsync(n.id);
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }
    };

    const handlePrevious = async () => {
        if (!selectedNotification) return;
        const currentIndex = notifications.findIndex(n => n.id === selectedNotification.id);
        if (currentIndex > 0) {
            await handleNotificationClick(notifications[currentIndex - 1]);
        }
    };

    const handleNext = async () => {
        if (!selectedNotification) return;
        const currentIndex = notifications.findIndex(n => n.id === selectedNotification.id);
        if (currentIndex < notifications.length - 1) {
            await handleNotificationClick(notifications[currentIndex + 1]);
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'bill': return <Receipt className="h-5 w-5 text-warning" />;
            case 'payment': return <CreditCard className="h-5 w-5 text-success" />;
            case 'reminder': return <MessageCircle className="h-5 w-5 text-primary" />;
            case 'broadcast': return <Megaphone className="h-5 w-5 text-destructive animate-pulse" />;
            default: return <Bell className="h-5 w-5" />;
        }
    };

    const currentIndex = selectedNotification ? notifications.findIndex(n => n.id === selectedNotification.id) : -1;

    return (
        <>
            <Button 
                variant="ghost" 
                size="icon" 
                className="relative group"
                onClick={() => {
                    setDialogOpen(true);
                    if (notifications.length > 0 && !selectedNotification) {
                        setSelectedNotification(notifications[0]);
                    }
                }}
            >
                <Bell className={cn("h-5 w-5 transition-transform group-hover:rotate-12", unreadCount > 0 && "animate-pulse")} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    </span>
                )}
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-background pb-4 border-b z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notifications
                                </DialogTitle>
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="mt-2">{unreadCount} Unread</Badge>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    {notifications.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-xs uppercase tracking-wider font-semibold">All clear!</p>
                        </div>
                    ) : selectedNotification ? (
                        <div className="space-y-6">
                            {/* Detailed Notification View */}
                            <div className={cn(
                                "p-6 rounded-xl border-l-4 space-y-4",
                                selectedNotification.is_read 
                                    ? "bg-muted/30 border-l-muted" 
                                    : "bg-primary/5 border-l-primary"
                            )}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="p-3 bg-background rounded-lg">
                                            {getIcon(selectedNotification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{selectedNotification.actor_name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(parseISO(selectedNotification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    {!selectedNotification.is_read && (
                                        <Badge variant="default" className="shrink-0">New</Badge>
                                    )}
                                </div>
                                <p className="text-sm leading-relaxed text-foreground">
                                    {selectedNotification.content}
                                </p>
                            </div>

                            {/* Notification List */}
                            <div className="space-y-2 border-t pt-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Notifications</p>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {notifications.map((n, idx) => (
                                        <button
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg transition-colors border",
                                                selectedNotification.id === n.id
                                                    ? "bg-primary/10 border-primary"
                                                    : "bg-muted/50 border-transparent hover:bg-muted"
                                            )}
                                        >
                                            <div className="flex items-start gap-2 justify-between">
                                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                                    <span className="pt-0.5 shrink-0">
                                                        {getIcon(n.type)}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold truncate">{n.actor_name}</p>
                                                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                                                            {n.content}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!n.is_read && (
                                                    <div className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation */}
                            {notifications.length > 1 && (
                                <div className="flex items-center justify-between border-t pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrevious}
                                        disabled={currentIndex === 0}
                                    >
                                        ← Previous
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
                                        {currentIndex + 1} of {notifications.length}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNext}
                                        disabled={currentIndex === notifications.length - 1}
                                    >
                                        Next →
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
};
