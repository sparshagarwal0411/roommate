
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, Utensils, Moon, Save, Calendar, Clock } from "lucide-react";
import { useMessMenu, useUpdateMessMenu, MessMenu } from "@/hooks/useHostel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface MessDashboardProps {
    hostelId: string;
    isOwner: boolean;
}

export const MessDashboard = ({ hostelId, isOwner }: MessDashboardProps) => {
    const { data: menu = [], isLoading } = useMessMenu(hostelId);
    const updateMenu = useUpdateMessMenu();
    const [editingDay, setEditingDay] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<MessMenu>>({});

    const startEditing = (dayIndex: number) => {
        if (!isOwner) return;
        const existing = menu.find(m => m.day_of_week === dayIndex);
        setEditForm(existing || { day_of_week: dayIndex, breakfast: "", lunch: "", dinner: "" });
        setEditingDay(dayIndex);
    };

    const handleSave = async () => {
        try {
            await updateMenu.mutateAsync({
                hostel_id: hostelId,
                day_of_week: editingDay!,
                breakfast: editForm.breakfast || "",
                lunch: editForm.lunch || "",
                dinner: editForm.dinner || "",
            });
            toast.success("Menu updated successfully! 🍱");
            setEditingDay(null);
        } catch (error) {
            toast.error("Failed to update menu.");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Mess Menu...</div>;

    const today = new Date().getDay();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-orange-500/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg shadow-orange-500/20">
                        <Utensils className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Hostel Mess Menu 🍽️</h2>
                        <p className="text-muted-foreground text-sm">Today's specials and weekly schedule</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {DAYS.map((day, idx) => {
                    const dayMenu = menu.find(m => m.day_of_week === idx);
                    const isToday = idx === today;

                    return (
                        <Card
                            key={day}
                            className={cn(
                                "relative overflow-hidden transition-all duration-300 border-none group",
                                isToday ? "ring-2 ring-orange-500 bg-orange-500/5 shadow-xl md:scale-105 z-10" : "bg-card/50 hover:bg-card shadow-sm",
                                isOwner && "cursor-pointer"
                            )}
                            onClick={() => isOwner && startEditing(idx)}
                        >
                            {isToday && (
                                <div className="absolute top-0 right-0 p-1">
                                    <span className="bg-orange-500 text-[8px] text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Today</span>
                                </div>
                            )}
                            <CardHeader className="p-4 pb-2 border-b border-border/40">
                                <CardTitle className={cn("text-xs font-bold uppercase tracking-tight text-center", isToday ? "text-orange-500" : "text-muted-foreground")}>
                                    {day}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase">
                                        <Coffee className="h-3 w-3 text-amber-500" /> Breakfast
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed">{dayMenu?.breakfast || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase">
                                        <Utensils className="h-3 w-3 text-orange-500" /> Lunch
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed">{dayMenu?.lunch || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase">
                                        <Moon className="h-3 w-3 text-blue-500" /> Dinner
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed">{dayMenu?.dinner || "—"}</p>
                                </div>

                                {isOwner && (
                                    <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="w-full h-7 text-[10px] py-0">Edit Menu</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {editingDay !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl border-orange-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-orange-500" />
                                Update Menu for {DAYS[editingDay]}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2"><Coffee className="h-4 w-4" /> Breakfast</label>
                                <Input
                                    placeholder="What's for breakfast?"
                                    value={editForm.breakfast || ""}
                                    onChange={e => setEditForm(prev => ({ ...prev, breakfast: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2"><Utensils className="h-4 w-4" /> Lunch</label>
                                <Input
                                    placeholder="Special lunch items?"
                                    value={editForm.lunch || ""}
                                    onChange={e => setEditForm(prev => ({ ...prev, lunch: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2"><Moon className="h-4 w-4" /> Dinner</label>
                                <Input
                                    placeholder="Dinner menu..."
                                    value={editForm.dinner || ""}
                                    onChange={e => setEditForm(prev => ({ ...prev, dinner: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setEditingDay(null)}>Cancel</Button>
                                <Button className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20" onClick={handleSave}>
                                    <Save className="h-4 w-4" /> Save Menu
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
