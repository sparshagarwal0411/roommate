import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkNotificationRead, Notification } from "@/hooks/useHostel";
import { useEffect, useState } from "react";
import { Bell, CreditCard, MessageCircle, Receipt, X, Megaphone } from "lucide-react";

interface NotificationPopupProps {
    memberId: string | null;
}

export const NotificationPopup = ({ memberId }: NotificationPopupProps) => {
    const { data: notifications = [] } = useNotifications(memberId);
    const markRead = useMarkNotificationRead();
    const [open, setOpen] = useState(false);
    const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
    const [seenNotificationIds, setSeenNotificationIds] = useState<Set<string>>(new Set());

    // Find the most recent unread notification that we haven't shown yet
    const latestUnread = notifications.find(n => !n.is_read && !seenNotificationIds.has(n.id));

    useEffect(() => {
        if (latestUnread && !open) {
            // Suppress popups for financial notifications (red dot only)
            if (latestUnread.type === 'bill' || latestUnread.type === 'payment') {
                setSeenNotificationIds(prev => new Set(prev).add(latestUnread.id));
                return;
            }

            setActiveNotification(latestUnread);
            setOpen(true);
        }
    }, [latestUnread, open]);

    const handleOk = async () => {
        if (activeNotification) {
            // Mark as seen first
            setSeenNotificationIds(prev => new Set(prev).add(activeNotification.id));
            
            // Close dialog
            setOpen(false);
            setActiveNotification(null);

            // Mark as read in background
            try {
                await markRead.mutateAsync(activeNotification.id);
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }
    };

    const handleClose = () => {
        if (activeNotification) {
            // Mark as seen so it doesn't pop up again
            setSeenNotificationIds(prev => new Set(prev).add(activeNotification.id));
        }
        setOpen(false);
        setActiveNotification(null);
    };

    if (!activeNotification) return null;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'bill': return <Receipt className="h-12 w-12 text-warning" />;
            case 'payment': return <CreditCard className="h-12 w-12 text-success" />;
            case 'reminder': return <MessageCircle className="h-12 w-12 text-primary" />;
            default: return <Bell className="h-12 w-12 text-foreground" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) {
                handleClose();
            }
        }}>
            <DialogContent className="sm:max-w-[425px] border-l-4 border-l-primary/50">
                <DialogHeader className="flex flex-col items-center gap-4 pt-4">
                    <div className="p-4 bg-muted/50 rounded-full">
                        {getIcon(activeNotification.type)}
                    </div>
                    <DialogTitle className="text-xl text-center">New Notification!</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2 font-medium text-foreground">
                        {activeNotification.content}
                    </DialogDescription>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        From {activeNotification.actor_name}
                    </p>
                </DialogHeader>
                <DialogFooter className="sm:justify-center gap-2 pb-2">
                    <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                    <Button onClick={handleOk} className="w-full sm:w-1/2">
                        OK, Got it!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
