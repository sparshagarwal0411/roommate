import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Member, useAddNotification } from "@/hooks/useHostel";
import { supabase } from "@/integrations/supabase/client";

interface BroadcastDialogProps {
    members: Member[];
    currentMemberId: string;
}

export const BroadcastDialog = ({ members, currentMemberId }: BroadcastDialogProps) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleBroadcast = async () => {
        if (!message.trim()) {
            toast.error("Please enter a message to broadcast");
            return;
        }

        try {
            setIsSending(true);
            const hostelId = members[0]?.hostel_id;
            if (!hostelId) throw new Error("No hostel found");

            // Filter out the sender
            const recipients = members.filter(m => m.id !== currentMemberId);

            if (recipients.length === 0) {
                toast.error("No one else to broadcast to!");
                return;
            }

            const notifications = recipients.map(recipient => ({
                hostel_id: hostelId,
                recipient_id: recipient.id,
                sender_id: currentMemberId,
                actor_name: "📢 Hostel Announcement", // Special name for broadcasts
                type: 'broadcast',
                content: message.trim(),
            }));

            const { error } = await supabase.from('notifications').insert(notifications);

            if (error) throw error;

            toast.success(`Broadcast sent to ${recipients.length} members! 📢`);
            setOpen(false);
            setMessage("");
        } catch (error) {
            console.error("Broadcast failed:", error);
            toast.error("Failed to send broadcast");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="group" title="Make Announcement">
                    <Megaphone className="h-5 w-5 group-hover:text-primary transition-colors" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" />
                        Hostel Broadcast
                    </DialogTitle>
                    <DialogDescription>
                        Send an important announcement to all active members in the hostel.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="e.g. Sunday Special Menu: Biryani! 🍗"
                            className="min-h-[100px]"
                        />
                        <p className="text-[10px] text-muted-foreground text-right">
                            Will be sent to {members.length - 1} members
                        </p>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleBroadcast}
                        disabled={isSending || !message.trim()}
                    >
                        {isSending ? "Sending..." : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Broadcast to Everyone
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
