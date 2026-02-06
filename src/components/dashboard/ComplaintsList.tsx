
import { useState } from "react";
import { MessageSquare, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Complaint, Member, useComplaints, useAddComplaint, useUpdateComplaintStatus } from "@/hooks/useHostel";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

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

    const getStatusIcon = (status: Complaint['status']) => {
        switch (status) {
            case 'resolved': return <CheckCircle2 className="h-4 w-4 text-success" />;
            case 'resolving': return <Clock className="h-4 w-4 text-warning" />;
            default: return <AlertCircle className="h-4 w-4 text-destructive" />;
        }
    };

    const getStatusBadge = (status: Complaint['status']) => {
        switch (status) {
            case 'resolved': return <Badge variant="outline" className="border-success text-success">Resolved</Badge>;
            case 'resolving': return <Badge variant="secondary" className="bg-warning/20 text-warning hover:bg-warning/30">Resolving</Badge>;
            default: return <Badge variant="destructive">Pending</Badge>;
        }
    };

    const handleStatusChange = async (complaintId: string, newStatus: Complaint['status']) => {
        try {
            await updateStatus.mutateAsync({ complaintId, status: newStatus, hostelId });
            toast.success(`Status updated to ${newStatus}!`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Maintenance & Complaints
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Complaint
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit a New Complaint</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Issue Title</label>
                                <Input
                                    placeholder="e.g., Leaking tap, Broken light"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    placeholder="Describe the issue in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={addComplaint.isPending}>
                                {addComplaint.isPending ? "Submitting..." : "Submit Complaint"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground italic">Loading complaints...</div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No complaints found. Everything's looking good! ✨</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {complaints.map((complaint) => {
                            const member = members.find(m => m.id === complaint.member_id);
                            return (
                                <div
                                    key={complaint.id}
                                    className="p-4 rounded-xl border bg-card hover:shadow-md transition-all animate-fade-in"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(complaint.status)}
                                            <h3 className="font-bold text-lg">{complaint.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(complaint.status)}
                                            <span className="text-xs text-muted-foreground">
                                                {format(parseISO(complaint.created_at), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                        {complaint.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                                            Reported by: {member?.name || "Unknown"}
                                        </span>
                                        {isOwner && (
                                            <div className="flex items-center gap-1">
                                                {complaint.status !== 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-[10px]"
                                                        onClick={() => handleStatusChange(complaint.id, 'pending')}
                                                    >
                                                        Set Pending
                                                    </Button>
                                                )}
                                                {complaint.status !== 'resolving' && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 text-[10px]"
                                                        onClick={() => handleStatusChange(complaint.id, 'resolving')}
                                                    >
                                                        Set Resolving
                                                    </Button>
                                                )}
                                                {complaint.status !== 'resolved' && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="h-8 text-[10px]"
                                                        onClick={() => handleStatusChange(complaint.id, 'resolved')}
                                                    >
                                                        Mark Resolved
                                                    </Button>
                                                )}
                                            </div>
                                        )}
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
