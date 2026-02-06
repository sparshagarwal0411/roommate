
import { useState } from "react";
import { Search, Plus, MapPin, Phone, CheckCircle, PackageSearch, Tag, Info } from "lucide-react";
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
import { Member, useLostAndFound, useAddLostAndFound, useUpdateLostAndFoundStatus, LostAndFound } from "@/hooks/useHostel";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

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
            <CardHeader className="px-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <PackageSearch className="h-6 w-6 text-primary" />
                        Lost & Found Board
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Help your roommates find their belongings</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search items..."
                            className="pl-9 w-full md:w-64 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 shrink-0">
                                <Plus className="h-4 w-4" />
                                Post Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Post to Lost & Found</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-1">
                                            <Tag className="h-3.5 w-3.5" /> Type
                                        </label>
                                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lost">Lost</SelectItem>
                                                <SelectItem value="found">Found</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Item Name</label>
                                        <Input
                                            placeholder="e.g., Wallet, Keys"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        <Info className="h-3.5 w-3.5" /> Description
                                    </label>
                                    <Textarea
                                        placeholder="Provide details (color, brand, last seen location...)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" /> Contact Info (Optional)
                                    </label>
                                    <Input
                                        placeholder="Phone number, Room number, etc."
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={addItem.isPending}>
                                    {addItem.isPending ? "Posting..." : "Post Item"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground italic">Loading board...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                        <PackageSearch className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">The board is empty. {searchQuery ? "Try a different search." : "Nothing lost, nothing found! 🌈"}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredItems.map((item) => {
                            const member = members.find(m => m.id === item.member_id);
                            const isAuthor = currentMemberId === item.member_id;

                            return (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-xl border bg-card hover:shadow-md transition-all animate-fade-in flex flex-col ${item.status === 'closed' ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge variant={item.type === 'lost' ? 'destructive' : 'outline'} className={`uppercase text-[10px] ${item.type === 'found' ? 'border-success text-success' : ''}`}>
                                            {item.type}
                                        </Badge>
                                        {item.status === 'closed' && (
                                            <Badge variant="secondary" className="text-[10px]">RECOVERED</Badge>
                                        )}
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(parseISO(item.created_at), "MMM d")}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-lg mb-1 leading-tight">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                                        {item.description}
                                    </p>

                                    <div className="space-y-2 mt-auto">
                                        {item.contact_info && (
                                            <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/5 p-2 rounded-lg">
                                                <Phone className="h-3 w-3" />
                                                {item.contact_info}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] uppercase font-bold text-accent-foreground">
                                                    {member?.name?.[0] || "?"}
                                                </div>
                                                <span className="text-xs truncate">{member?.name || "Member"}</span>
                                            </div>

                                            {(isAuthor || isOwner) && item.status === 'open' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-[10px] gap-1 text-success"
                                                    onClick={() => handleStatusChange(item.id, 'closed')}
                                                >
                                                    <CheckCircle className="h-3 w-3" />
                                                    Mark Done
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
