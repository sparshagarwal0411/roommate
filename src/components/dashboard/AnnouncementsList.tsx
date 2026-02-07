import { useMemo } from "react";
import { Megaphone, AlertTriangle, Info, Calendar } from "lucide-react";
import { useAnnouncements, useLostAndFound, Announcement } from "@/hooks/useHostel";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const DISMISSED_ANNOUNCEMENTS_KEY = "roommate_dismissed_announcements";

function parseLostFoundContent(content: string): { lostFoundId: string; description?: string; contact?: string; title?: string } | null {
    try {
        const p = JSON.parse(content) as unknown;
        if (p && typeof p === "object" && "lostFoundId" in p) return p as { lostFoundId: string; description?: string; contact?: string; title?: string };
    } catch { /* ignore */ }
    return null;
}

interface AnnouncementsListProps {
    hostelId: string;
}

export const AnnouncementsList = ({ hostelId }: AnnouncementsListProps) => {
    const { data: announcements = [], isLoading } = useAnnouncements(hostelId);
    const { data: lostFoundItems = [] } = useLostAndFound(hostelId);

    const visibleAnnouncements = useMemo(() => {
        if (typeof window === "undefined") return announcements;
        const dismissed: string[] = JSON.parse(localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY) || "[]");
        const closedLostFoundIds = new Set(lostFoundItems.filter((i) => i.status === "closed").map((i) => i.id));
        return announcements.filter((a) => {
            if (dismissed.includes(a.id)) return false;
            const lf = parseLostFoundContent(a.content);
            if (lf && closedLostFoundIds.has(lf.lostFoundId)) return false;
            return true;
        });
    }, [announcements, lostFoundItems]);

    if (isLoading) return null;
    if (visibleAnnouncements.length === 0) return null;

    const getTypeStyles = (type: Announcement['type']) => {
        switch (type) {
            case 'urgent': return "bg-destructive/10 border-destructive/20 text-destructive shadow-destructive/10";
            case 'event': return "bg-blue-500/10 border-blue-500/20 text-blue-600 shadow-blue-500/10";
            default: return "bg-amber-500/10 border-amber-500/20 text-amber-600 shadow-amber-500/10";
        }
    };

    const getIcon = (type: Announcement['type']) => {
        switch (type) {
            case 'urgent': return <AlertTriangle className="h-5 w-5 animate-pulse" />;
            case 'event': return <Calendar className="h-5 w-5" />;
            default: return <Megaphone className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Info className="h-3 w-3" /> Announcements & Alerts
                </h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                {visibleAnnouncements.map((announcement) => (
                    <div
                        key={announcement.id}
                        className={cn(
                            "flex-none w-[280px] md:w-[350px] p-4 rounded-[1.5rem] border backdrop-blur-md snap-center relative shadow-sm transition-all hover:shadow-md",
                            getTypeStyles(announcement.type)
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-white/20">
                                {getIcon(announcement.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                        {announcement.type}
                                    </span>
                                    <span className="text-[9px] font-medium opacity-60">
                                        {format(parseISO(announcement.created_at), "MMM d")}
                                    </span>
                                </div>
                                <h4 className="font-black text-sm mb-1 leading-tight truncate">{announcement.title}</h4>
                                <p className="text-[11px] leading-relaxed opacity-80 line-clamp-2">
                                    {(() => {
                                        const lf = parseLostFoundContent(announcement.content);
                                        if (lf) return [lf.description, lf.contact ? `Contact: ${lf.contact}` : null].filter(Boolean).join(" · ");
                                        return announcement.content;
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
