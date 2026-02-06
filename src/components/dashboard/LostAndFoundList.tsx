
import { useState } from "react";
import { Search, Plus, MapPin, Phone, CheckCircle, PackageSearch, Tag, Info, Megaphone } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Member,
    useLostAndFound,
    useAddLostAndFound,
    useUpdateLostAndFoundStatus,
    LostAndFound,
    useAddAnnouncement,
    useAddNotification
} from "@/hooks/useHostel";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LostAndFoundProps {
    hostelId: string;
    members: Member[];
    isOwner: boolean;
    currentMemberId: string | undefined;
}

export const LostAndFoundList = ({ hostelId, members, isOwner, currentMemberId }: LostAndFoundProps) => {
    const { data: items = [], isLoading } = useLostAndFound(hostelId);
    const addItem = useAddLostAndFound();
    const updateStatus = useUpdateLostAndFoundStatus();
    const addAnnouncement = useAddAnnouncement();
    const addNotification = useAddNotification();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<'lost' | 'found'>('lost');
    const [contactInfo, setContactInfo] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMemberId) {
            toast.error("You must be a member to post an item");
            return;
        }
        if (!title.trim() || !description.trim()) return;

        try {
            await addItem.mutateAsync({
                hostel_id: hostelId,
                member_id: currentMemberId,
                title: title.trim(),
                description: description.trim(),
                type,
                contact_info: contactInfo.trim(),
                image_url: null,
            });
            toast.success(`${type === 'lost' ? 'Lost' : 'Found'} item posted! 🔍`);
            setTitle("");
            setDescription("");
            setContactInfo("");
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Failed to post item");
        }
    };

    const handlePublishAnnouncement = async (item: LostAndFound) => {
        try {
            const ann = await addAnnouncement.mutateAsync({
                hostel_id: hostelId,
                title: `${item.type.toUpperCase()}: ${item.title}`,
                content: `${item.description}\n\nContact: ${item.contact_info || "Not provided"}`,
                type: 'info'
            });
            const actorName = members.find(m => m.id === currentMemberId)?.name || "Hostel";
            const payload = JSON.stringify({ announcementId: ann.id, link: 'lostfound', title: ann.title, content: ann.content });
            for (const member of members) {
                if (member.id === currentMemberId) continue;
                await addNotification.mutateAsync({
                    hostel_id: hostelId,
                    recipient_id: member.id,
                    sender_id: currentMemberId!,
                    actor_name: actorName,
                    type: 'broadcast',
                    content: payload,
                });
            }
            toast.success("Broadcasted to all roommates! 📢 Notifications sent.");
        } catch (error) {
            toast.error("Failed to broadcast");
        }
    };

    const handleStatusChange = async (itemId: string, newStatus: LostAndFound['status']) => {
        try {
            await updateStatus.mutateAsync({ itemId, status: newStatus, hostelId });
            toast.success(`Item marked as ${newStatus}!`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8">
                <div className="space-y-1">
                    <CardTitle className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center gap-3">
                        <PackageSearch className="h-8 w-8 text-blue-500" />
                        Lost & Found Board
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">Helping roommates reconnect with their belongings</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Find items..."
                            className="pl-10 w-full md:w-64 h-10 border-muted-foreground/20 focus:border-primary rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 px-5 gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl font-bold">
                                <Plus className="h-4 w-4" />
                                Post New
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Post an Item</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-muted-foreground">Status</label>
                                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                                            <SelectTrigger className="h-11 rounded-xl">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lost">Lost</SelectItem>
                                                <SelectItem value="found">Found</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-muted-foreground">Item Name</label>
                                        <Input
                                            placeholder="Wallet, Keys..."
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            className="h-11 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground font-sans">Description</label>
                                    <Textarea
                                        placeholder="Add details like color, last seen location..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows={3}
                                        className="rounded-xl resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground">Where to find you?</label>
                                    <Input
                                        placeholder="Phone or Room number"
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11 text-lg font-bold bg-blue-600 hover:bg-blue-700 mt-2" disabled={addItem.isPending}>
                                    {addItem.isPending ? "Posting..." : "Share on Board"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-muted/40 rounded-3xl" />)}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-24 bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-muted/50 flex flex-col items-center">
                        <PackageSearch className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xl font-bold text-muted-foreground/80">Nothing here yet</h3>
                        <p className="text-sm text-muted-foreground/50 mt-1">{searchQuery ? "Try searching for something else." : "Lost something? Let the roommates help!"}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {filteredItems.map((item) => {
                            const member = members.find(m => m.id === item.member_id);
                            const isAuthor = currentMemberId === item.member_id;

                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "group relative p-6 rounded-[2rem] border bg-gradient-to-br transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 flex flex-col",
                                        item.type === 'lost' ? "from-red-500/[0.03] to-transparent border-red-500/10" : "from-emerald-500/[0.03] to-transparent border-emerald-500/10",
                                        item.status === 'closed' && "grayscale opacity-50"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge
                                            className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                                                item.type === 'lost' ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                                            )}
                                        >
                                            {item.type}
                                        </Badge>
                                        <div className="flex items-center gap-2">
                                            {item.status === 'closed' && (
                                                <Badge variant="secondary" className="text-[10px] font-bold bg-muted/50 text-muted-foreground px-2">RECOVERED</Badge>
                                            )}
                                            <span className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
                                                {format(parseISO(item.created_at), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black mb-2 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed flex-grow">
                                        {item.description}
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                                                    {member?.name?.[0] || "?"}
                                                </div>
                                                <span className="text-xs font-bold truncate">{member?.name || "Member"}</span>
                                            </div>

                                            {item.contact_info && (
                                                <div className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/10">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {item.contact_info}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-border/40 flex items-center justify-end gap-2">
                                            {isOwner && (
                                                <Button
                                                    variant="soft"
                                                    size="sm"
                                                    className="h-8 text-[10px] font-bold gap-1.5 px-3 rounded-full hover:bg-primary/20"
                                                    onClick={() => handlePublishAnnouncement(item)}
                                                >
                                                    <Megaphone className="h-3.5 w-3.5" />
                                                    ANNOUNCE
                                                </Button>
                                            )}

                                            {(isAuthor || isOwner) && item.status === 'open' && (
                                                <Button
                                                    variant="hero"
                                                    size="sm"
                                                    className="h-8 px-4 text-[10px] font-bold gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                                    onClick={() => handleStatusChange(item.id, 'closed')}
                                                >
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    MARK FOUND
                                                </Button>
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
