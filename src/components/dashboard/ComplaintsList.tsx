
import { useState } from "react";
import { MessageSquare, Plus, CheckCircle2, Clock, AlertCircle, Megaphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Complaint,
    Member,
    useComplaints,
    useAddComplaint,
    useUpdateComplaintStatus,
    useAddAnnouncement
} from "@/hooks/useHostel";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ComplaintsProps {
    hostelId: string;
    members: Member[];
    isOwner: boolean;
    currentMemberId: string | undefined;
}

export const ComplaintsList = ({ hostelId, members, isOwner, currentMemberId }: ComplaintsProps) => {
    const { data: complaints = [], isLoading } = useComplaints(hostelId);
    const addComplaint = useAddComplaint();
    const updateStatus = useUpdateComplaintStatus();
    const addAnnouncement = useAddAnnouncement();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMemberId) {
            toast.error("You must be a member to submit a complaint");
            return;
        }
        if (!title.trim() || !description.trim()) return;

        try {
            await addComplaint.mutateAsync({
                hostel_id: hostelId,
                member_id: currentMemberId,
                title: title.trim(),
                description: description.trim(),
            });
            toast.success("Complaint submitted successfully! 📝");
            setTitle("");
            setDescription("");
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to submit complaint");
        }
    };

    const handlePublishAnnouncement = async (complaint: Complaint) => {
        try {
            await addAnnouncement.mutateAsync({
                hostel_id: hostelId,
                title: `Broadcast: ${complaint.title}`,
                content: complaint.description,
                type: 'urgent'
            });
            toast.success("Published as Announcement! 📢");
        } catch (error) {
            toast.error("Failed to publish announcement");
        }
    };

    const getStatusIcon = (status: Complaint['status']) => {
        switch (status) {
            case 'resolved': return <CheckCircle2 className="h-5 w-5 text-success animate-in zoom-in" />;
            case 'resolving': return <Clock className="h-5 w-5 text-warning animate-pulse" />;
            default: return <AlertCircle className="h-5 w-5 text-destructive" />;
        }
    };

    const getStatusStyles = (status: Complaint['status']) => {
        switch (status) {
            case 'resolved': return "bg-success/10 text-success border-success/20";
            case 'resolving': return "bg-warning/10 text-warning border-warning/20";
            default: return "bg-destructive/10 text-destructive border-destructive/20";
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 flex flex-row items-center justify-between pb-6">
                <div>
                    <CardTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-2">
                        <MessageSquare className="h-7 w-7 text-primary" />
                        Maintenance Tracker
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Raise issues or track ongoing repairs</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            <Plus className="h-4 w-4" />
                            Report Issue
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl rounded-[2rem]">
                        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-8">
                            <DialogHeader>
                                <div className="p-3 bg-primary w-fit rounded-2xl text-white shadow-lg shadow-primary/20 mb-4">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <DialogTitle className="text-2xl font-black tracking-tight">Report New Issue</DialogTitle>
                                <DialogDescription className="text-muted-foreground/80 font-medium">
                                    Help us maintain the hostel by reporting issues as soon as you spot them.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Issue Title</label>
                                    <Input
                                        placeholder="e.g., Water leakage in Room 302"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="h-12 border-primary/20 focus:border-primary bg-background/50 backdrop-blur-sm rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Description</label>
                                    <Textarea
                                        placeholder="Please provide details like location, severity, and when you first noticed it..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows={4}
                                        className="border-primary/20 focus:border-primary bg-background/50 backdrop-blur-sm rounded-xl resize-none p-4"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-2xl group transition-all"
                                    disabled={addComplaint.isPending}
                                >
                                    {addComplaint.isPending ? (
                                        "Broadcasting..."
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Submit Report <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Loading tickets...</p>
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted flex flex-col items-center">
                        <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-xl font-bold text-muted-foreground">No Active Issues</h3>
                        <p className="text-xs text-muted-foreground/60 max-w-[250px] mx-auto mt-2">
                            Everything seems to be working perfectly! Hit the plus button to report something.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {complaints.map((complaint) => {
                            const member = members.find(m => m.id === complaint.member_id);
                            return (
                                <div
                                    key={complaint.id}
                                    className="group relative p-5 rounded-2xl border bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5", getStatusStyles(complaint.status))}>
                                                {getStatusIcon(complaint.status)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-lg tracking-tight truncate">{complaint.title}</h3>
                                                    <Badge variant="outline" className={cn("text-[8px] h-4 font-bold uppercase tracking-widest", getStatusStyles(complaint.status))}>
                                                        {complaint.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                    {complaint.description}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] tabular-nums font-bold text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded-md">
                                            {format(parseISO(complaint.created_at), "MMM d, h:mm a")}
                                        </span>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 text-center">
                                                {member?.name?.[0] || "?"}
                                            </div>
                                            <span className="text-[10px] font-bold text-muted-foreground">
                                                Reported by {member?.name || "Member"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isOwner && (
                                                <>
                                                    <Button
                                                        variant="hero"
                                                        size="sm"
                                                        className="h-7 text-[10px] font-bold gap-1.5 px-3 rounded-full shadow-lg shadow-primary/20"
                                                        onClick={() => handlePublishAnnouncement(complaint)}
                                                    >
                                                        <Megaphone className="h-3 w-3" />
                                                        ANNOUNCE
                                                    </Button>
                                                    <div className="h-4 w-[1px] bg-border mx-1" />
                                                    <Button
                                                        variant="soft"
                                                        size="icon"
                                                        className={cn("h-7 w-7 rounded-full text-success hover:bg-success/20", complaint.status === 'resolved' && "bg-success/20")}
                                                        onClick={() => updateStatus.mutate({ complaintId: complaint.id, status: 'resolved', hostelId })}
                                                        title="Resolve"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="soft"
                                                        size="icon"
                                                        className={cn("h-7 w-7 rounded-full text-warning hover:bg-warning/20", complaint.status === 'resolving' && "bg-warning/20")}
                                                        onClick={() => updateStatus.mutate({ complaintId: complaint.id, status: 'resolving', hostelId })}
                                                        title="Resolving"
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
