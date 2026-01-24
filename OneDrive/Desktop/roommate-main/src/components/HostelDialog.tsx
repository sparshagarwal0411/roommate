import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface HostelDialogProps {
    userId: string | null;
    onHostelCreated: () => void;
    onHostelJoined: () => void;
}

export const HostelDialog = ({ userId, onHostelCreated, onHostelJoined }: HostelDialogProps) => {
    const [isCreate, setIsCreate] = useState(true);
    const [hostelName, setHostelName] = useState("");
    const [roomNo, setRoomNo] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateHostel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hostelName.trim() || !userId) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            // Call your backend API or supabase function to create hostel
            const response = await fetch("/api/hostels/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: hostelName,
                    room_no: roomNo || "Main",
                    owner_id: userId,
                }),
            });

            if (!response.ok) throw new Error("Failed to create hostel");
            
            toast.success("Hostel created successfully! 🎉");
            setHostelName("");
            setRoomNo("");
            onHostelCreated();
        } catch (error: any) {
            console.error("Create error:", error);
            toast.error(error.message || "Failed to create hostel");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinHostel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim() || !userId) {
            toast.error("Please enter a valid code");
            return;
        }

        setLoading(true);
        try {
            // Call your backend API or supabase function to join hostel
            const response = await fetch("/api/hostels/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: joinCode,
                    profile_id: userId,
                }),
            });

            if (!response.ok) throw new Error("Failed to join hostel");
            
            toast.success("Joined hostel successfully! 🎉");
            setJoinCode("");
            onHostelJoined();
        } catch (error: any) {
            console.error("Join error:", error);
            toast.error(error.message || "Failed to join hostel");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md animate-fade-in border-2">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">
                        {isCreate ? "Create a Hostel" : "Join a Hostel"}
                    </CardTitle>
                    <CardDescription>
                        {isCreate
                            ? "Set up a new room for your hostel"
                            : "Enter the code to join an existing hostel"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isCreate ? (
                        <form onSubmit={handleCreateHostel} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="hostel-name">Hostel Name</Label>
                                <Input
                                    id="hostel-name"
                                    placeholder="e.g., Girls Hostel Block A"
                                    value={hostelName}
                                    onChange={(e) => setHostelName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room-no">Room Number (Optional)</Label>
                                <Input
                                    id="room-no"
                                    placeholder="e.g., A-101"
                                    value={roomNo}
                                    onChange={(e) => setRoomNo(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                                {loading ? "Creating..." : "Create Hostel"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleJoinHostel} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="join-code">Hostel Code</Label>
                                <Input
                                    id="join-code"
                                    placeholder="Enter the 6-digit code"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Ask your hostel admin for the unique code
                            </p>
                            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                                {loading ? "Joining..." : "Join Hostel"}
                            </Button>
                        </form>
                    )}

                    <div className="relative h-px bg-border my-6">
                        <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground uppercase">
                            Or
                        </span>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        {isCreate ? "Already have a code?" : "Want to create one?"}{" "}
                        <button
                            onClick={() => {
                                setIsCreate(!isCreate);
                                setHostelName("");
                                setRoomNo("");
                                setJoinCode("");
                            }}
                            className="text-primary font-semibold hover:underline"
                        >
                            {isCreate ? "Join Instead" : "Create Hostel"}
                        </button>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
