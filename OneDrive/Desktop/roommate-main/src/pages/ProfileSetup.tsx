import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
    User, Users, MapPin, Phone, Calendar, 
    Circle, Square, Triangle, Hexagon, X 
} from "lucide-react";

const ProfileSetup = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    // --- GRID SHAPE GENERATOR ---
    const shapes = useMemo(() => {
        const items = [];
        const columns = 12; 
        const rows = 12;    
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                // Density control (Adjust > 0.5 to make it more/less crowded)
                if (1 > 0) {
                    
                    // --- DEPTH LOGIC ---
                    // Randomly assign a depth tier: 1 (Back), 2 (Mid), 3 (Front)
                    const depth = Math.random() < 0.6 ? 1 : Math.random() < 0.9 ? 2 : 3;
                    
                    // Base scale multipliers based on depth
                    const sizeBase = depth === 1 ? 8 : depth === 2 ? 15 : 25;
                    const speedBase = depth === 1 ? 0.1 : depth === 2 ? 0.3 : 0.6;

                    items.push({
                        id: `${row}-${col}`,
                        left: (col * (100 / columns)) + (Math.random() * (100 / columns)), 
                        top: (row * (100 / rows)) + (Math.random() * (100 / rows)),
                        
                        // Size varies by depth
                        size: Math.random() * 5 + sizeBase, 
                        
                        // Parallax speed varies by depth (Front moves faster)
                        parallaxSpeed: speedBase + Math.random() * 0.1,
                        
                        // Z-Index ensures correct overlapping
                        zIndex: depth, 

                        // Style properties
                        rotation: Math.random() * 360,
                        floatDuration: 10 + Math.random() * 10, // Slower float looks heavier
                        floatDelay: Math.random() * 5,
                        type: Math.floor(Math.random() * 5),
                        floatX: (Math.random() - 0.5) * 60, 
                        floatY: (Math.random() - 0.5) * 60  
                    });
                }
            }
        }
        return items;
    }, []);

    const ShapeIcon = ({ type, className }: { type: number, className?: string }) => {
        const icons = [Circle, Square, Triangle, Hexagon, X];
        const IconComponent = icons[type];
        return <IconComponent className={className} strokeWidth={1.5} />;
    };

    const [profile, setProfile] = useState({
        first_name: "",
        last_name: "",
        parent_name: "",
        age: "",
        gender: "",
        address: "",
        phone: "",
    });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
            const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
            setMousePos({ x, y });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const checkProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/auth");
                return;
            }
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (data) {
                setProfile({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    parent_name: data.parent_name || "",
                    age: data.age?.toString() || "",
                    gender: data.gender || "",
                    address: data.address || "",
                    phone: data.phone || "",
                });
            }
            setLoading(false);
        };
        checkProfile();
    }, [navigate]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    parent_name: profile.parent_name,
                    age: parseInt(profile.age) || 0,
                    gender: profile.gender,
                    phone: profile.phone,
                    address: profile.address,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            toast.success("Profile completed! Welcome to RoomMate 🚀");
            navigate("/lobby");
        } catch (error: any) {
            toast.error(error.message || "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 bg-background transition-colors duration-300">
            
            <style>{`
                @keyframes float {
                    0% { transform: translate(0px, 0px) rotate(0deg); }
                    33% { transform: translate(var(--tx), var(--ty)) rotate(10deg); }
                    66% { transform: translate(calc(var(--tx) * -0.5), calc(var(--ty) * -0.5)) rotate(-5deg); }
                    100% { transform: translate(0px, 0px) rotate(0deg); }
                }
            `}</style>

            {/* --- BACKGROUND SHAPES --- */}
            {shapes.map((shape) => (
                <div
                    key={shape.id}
                    className="absolute text-black dark:text-white pointer-events-none"
                    style={{
                        top: `${shape.top}%`,
                        left: `${shape.left}%`,
                        zIndex: shape.zIndex, // Use the calculated layer (1, 2, or 3)
                        
                        // Parallax logic uses the depth-based speed
                        transform: `translate(${mousePos.x * -50 * shape.parallaxSpeed}px, ${mousePos.y * -50 * shape.parallaxSpeed}px)`,
                        transition: 'transform 0.1s ease-out',
                        
                        // CSS Variables for random float direction
                        // @ts-ignore
                        "--tx": `${shape.floatX}px`, 
                        "--ty": `${shape.floatY}px`
                    }}
                >
                    <div 
                        style={{ 
                            width: `${shape.size}px`, 
                            height: `${shape.size}px`,
                            // Optional: Make back layers slightly transparent for atmospheric depth
                            opacity: shape.zIndex === 1 ? 0.3 : shape.zIndex === 2 ? 0.6 : 1,
                            animation: `float ${shape.floatDuration}s ease-in-out infinite`,
                            animationDelay: `${shape.floatDelay}s`
                        }}
                    >
                         <ShapeIcon type={shape.type} className="w-full h-full" />
                    </div>
                </div>
            ))}

            {/* --- MAIN CARD --- */}
            {/* z-10 ensures it sits above the Front Layer (z-3) */}
            <Card className="w-full max-w-2xl animate-fade-in border-2 relative z-10 bg-background/85 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
                    <CardDescription>Tell us a bit about yourself to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="grid md:grid-cols-2 gap-6">
                        
                        {/* LEFT COLUMN */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="firstName"
                                        className="pl-10 bg-background/50 focus:bg-background transition-all"
                                        placeholder="John"
                                        value={profile.first_name}
                                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="lastName"
                                        className="pl-10 bg-background/50 focus:bg-background transition-all"
                                        placeholder="Doe"
                                        value={profile.last_name}
                                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parentName">Parent's Name</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="parentName"
                                        className="pl-10 bg-background/50 focus:bg-background transition-all"
                                        placeholder="Father/Mother name"
                                        value={profile.parent_name}
                                        onChange={(e) => setProfile({ ...profile, parent_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="age"
                                        type="number"
                                        className="pl-10 bg-background/50 focus:bg-background transition-all"
                                        placeholder="21"
                                        value={profile.age}
                                        onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={profile.gender}
                                    onValueChange={(val) => setProfile({ ...profile, gender: val })}
                                    required
                                >
                                    <SelectTrigger className="w-full bg-background/50 focus:bg-background transition-all">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        className="pl-10 bg-background/50 focus:bg-background transition-all"
                                        placeholder="+91 XXXX XXX XXX"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        className="pl-10 bg-background/50 focus:bg-background transition-all"
                                        placeholder="Current address"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-12 text-lg hover:bg-background/80"
                                onClick={() => navigate("/lobby")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-[2] h-12 text-lg" disabled={saving}>
                                {saving ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileSetup;
