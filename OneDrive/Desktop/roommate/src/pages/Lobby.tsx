import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Users, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { toast } from "sonner";

interface JoinedHostel {
    id: string;
    name: string;
    room_no: string;
    code: string;
    owner_id: string;
}

const Lobby = () => {
    const [hostels, setHostels] = useState<JoinedHostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate("/auth");
            return;
        }

        // Fetch profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("first_name")
            .eq("id", session.user.id)
            .maybeSingle();

        if (!profile || !profile.first_name) {
            console.log("Lobby: Profile incomplete or missing. Redirecting to setup...", profile);
            navigate("/profile-setup");
            return;
        }

        setUserName(profile.first_name);
        setUserId(session.user.id);

        const { data: joinedMembers, error: membersError } = await supabase
            .from("members")
            .select(`
                room_no,
                hostels (
                    id,
                    name,
                    room_no,
                    code,
                    owner_id
                )
            `)
            .eq("profile_id", session.user.id);

        // 2. Fetch hostels where user is the owner
        const { data: ownedHostels, error: ownersError } = await supabase
            .from("hostels")
            .select("id, name, room_no, code, owner_id")
            .eq("owner_id", session.user.id);

        if (membersError || ownersError) {
            console.error("Lobby Load Error:", membersError || ownersError);
            toast.error("Error loading hostels. Please try again.");
        } else {
            const hFromMembers = (joinedMembers || []).map((m: any) => {
                const hostel = Array.isArray(m.hostels) ? m.hostels[0] : m.hostels;
                if (!hostel) return null;
                return {
                    ...hostel,
                    room_no: m.room_no || hostel.room_no || "Main"
                };
            }).filter(Boolean);

            const hFromOwned = (ownedHostels || []).map((h: any) => ({
                ...h,
                room_no: h.room_no || "Main"
            }));

            // Merge and de-duplicate by ID
            const allHostels = [...hFromMembers, ...hFromOwned];
            const uniqueMap = new Map();
            allHostels.forEach((h: any) => {
                if (h && h.id) uniqueMap.set(h.id, h);
            });

            setHostels(Array.from(uniqueMap.values()) as JoinedHostel[]);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass border-b">
                <div className="container flex items-center justify-between h-16">
                    <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl">RoomMate</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </div>
            </header>

            {/* Hero / Welcome */}
            <main className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Welcome, {userName}! 👋</h1>
                    <p className="text-muted-foreground">Select a room to manage or join/create a new one.</p>
                </div>

                {/* Hostel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create/Join Card */}
                    <Card
                        variant="interactive"
                        className="flex flex-col items-center justify-center p-8 border-dashed border-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate("/")}
                    >
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Plus className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg">New Room</h3>
                        <p className="text-sm text-muted-foreground text-center">Join an existing room or create your own</p>
                    </Card>

                    {/* Joined Hostels */}
                    {hostels.map((hostel) => (
                        <Card
                            key={hostel.id}
                            variant="elevated"
                            className="group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all overflow-hidden"
                            onClick={() => navigate(`/dashboard/${hostel.id}`)}
                        >
                            <div className="h-24 bg-gradient-to-br from-primary to-accent relative p-4">
                                <div className="absolute right-4 top-4 text-white/20">
                                    <Users className="h-12 w-12" />
                                </div>
                                <h3 className="text-white font-bold text-xl truncate">{hostel.name}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-white/80 text-sm">{hostel.room_no}</p>
                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-medium uppercase">
                                        {userId === hostel.owner_id ? "Owner/Admin" : "Member"}
                                    </span>
                                </div>
                            </div>
                            <CardContent className="pt-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Code</p>
                                    <p className="font-mono font-bold text-lg tracking-widest">{hostel.code}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Lobby;
