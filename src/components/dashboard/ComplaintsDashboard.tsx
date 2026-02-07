import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Member } from "@/hooks/useHostel";
import { ComplaintsList } from "./ComplaintsList";
import { LostAndFoundList } from "./LostAndFoundList";
import { MessageSquare, PackageSearch } from "lucide-react";

interface ComplaintsDashboardProps {
    hostelId: string;
    members: Member[];
    isOwner: boolean;
    currentMemberId: string | undefined;
    defaultTab?: "maintenance" | "lostfound";
}

export const ComplaintsDashboard = ({ hostelId, members, isOwner, currentMemberId, defaultTab }: ComplaintsDashboardProps) => {
    const [tab, setTab] = useState<"maintenance" | "lostfound">(defaultTab || "maintenance");
    useEffect(() => {
        if (defaultTab) setTab(defaultTab);
    }, [defaultTab]);

    return (
        <div className="space-y-6 animate-fade-in overflow-x-hidden min-w-0 w-full">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 sm:p-6 rounded-2xl border border-primary/10">
                <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent break-words">
                    RoomMate Support Center 🛠️
                </h2>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base break-words">
                    Raise complaints, track maintenance, or post lost & found items.
                </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "maintenance" | "lostfound")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                    <TabsTrigger value="maintenance" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Complaints
                    </TabsTrigger>
                    <TabsTrigger value="lostfound" className="gap-2">
                        <PackageSearch className="h-4 w-4" />
                        Lost & Found
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="maintenance" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <ComplaintsList
                        hostelId={hostelId}
                        members={members}
                        isOwner={isOwner}
                        currentMemberId={currentMemberId}
                    />
                </TabsContent>

                <TabsContent value="lostfound" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                    <LostAndFoundList
                        hostelId={hostelId}
                        members={members}
                        isOwner={isOwner}
                        currentMemberId={currentMemberId}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};
