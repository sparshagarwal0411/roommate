import { useState } from "react";
import { UserPlus, User, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Member, useAddMember, useRemoveMember, useRemoveRoom, useUpdateMember } from "@/hooks/useHostel";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MembersListProps {
  members: Member[];
  hostelId: string;
  isOwner?: boolean;
  currentProfileId?: string;
}

// Fun color palette for avatars
const avatarColors = [
  "bg-primary/80",
  "bg-accent/80",
  "bg-info/80",
  "bg-warning/80",
  "bg-category-entertainment/80",
  "bg-category-groceries/80",
];

export const MembersList = ({ members, hostelId, isOwner, currentProfileId }: MembersListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const addMember = useAddMember();
  const removeMember = useRemoveMember();
  const removeRoom = useRemoveRoom();
  const updateMember = useUpdateMember();

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRoomValue, setEditingRoomValue] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Name can't be empty! 👋");
      return;
    }

    try {
      await addMember.mutateAsync({ hostelId, name: newName.trim(), room_no: newRoom.trim() });
      toast.success(`${newName} joined the crew! 🎉`);
      setNewName("");
      setNewRoom("");
      setIsAdding(false);
    } catch (error) {
      toast.error("Couldn't add member. Try again?");
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName}?`)) return;
    try {
      await removeMember.mutateAsync({ memberId, hostelId });
      toast.success(`${memberName} has been removed.`);
    } catch (error) {
      toast.error("Failed to remove member.");
    }
  };

  const handleRemoveRoom = async (room_no: string) => {
    if (!confirm(`Are you sure you want to remove all members in room ${room_no}?`)) return;
    try {
      await removeRoom.mutateAsync({ room_no, hostelId });
      toast.success(`Room ${room_no} has been cleared.`);
    } catch (error) {
      toast.error("Failed to remove room.");
    }
  };

  const handleUpdateMemberRoom = async (memberId: string) => {
    if (!editingRoomValue.trim()) {
      setEditingMemberId(null);
      return;
    }
    try {
      await updateMember.mutateAsync({ memberId, hostelId, room_no: editingRoomValue.trim() });
      toast.success("Room updated! 🚪");
      setEditingMemberId(null);
    } catch (error) {
      toast.error("Failed to update room.");
    }
  };

  const startEditingMember = (memberId: string, currentRoom: string) => {
    setEditingMemberId(memberId);
    setEditingRoomValue(currentRoom);
  };

  const currentUser = members.find(m => m.profile_id === currentProfileId);
  const userRoom = currentUser?.room_no || "Unassigned";

  const activeMembers = members.filter(m => m.profile_id);

  const groupedByRoom = activeMembers.reduce((acc, member) => {
    const room = member.room_no || "Unassigned";
    if (!acc[room]) acc[room] = [];
    acc[room].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  // Filter or Sort rooms
  const roomEntries = Object.entries(groupedByRoom).sort(([roomA], [roomB]) => {
    if (roomA === userRoom) return -1;
    if (roomB === userRoom) return 1;
    return roomA.localeCompare(roomB);
  });

  // If not owner, only show user's room to avoid showing the whole hostel
  const displayedRooms = isOwner ? roomEntries : roomEntries.filter(([room]) => room === userRoom);

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {isOwner ? `Hostellers (${members.length})` : "Your Roommates"}
          </CardTitle>
          <Button
            variant="soft"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex gap-2">
              <Input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-10 flex-[2]"
              />
              <Input
                placeholder="Room"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                className="h-10 flex-1"
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={addMember.isPending}
              size="sm"
              className="w-full"
            >
              Add Member
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {displayedRooms.map(([room, roomMembers]) => (
            <div key={room} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {room === userRoom ? `Your Room (${room})` : room === "Unassigned" ? room : `Room ${room}`}
                </h4>
                {isOwner && room !== "Unassigned" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveRoom(room)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {roomMembers.map((member, i) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl animate-fade-in group relative"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback
                        className={`${avatarColors[members.indexOf(member) % avatarColors.length]} text-white text-xs font-semibold`}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">
                        {member.name} {member.profile_id === currentProfileId && "(You)"}
                      </span>
                      {editingMemberId === member.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <Input
                            value={editingRoomValue}
                            onChange={(e) => setEditingRoomValue(e.target.value)}
                            className="h-6 w-16 text-[10px] py-0 px-1"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateMemberRoom(member.id)}
                          />
                          <button onClick={() => handleUpdateMemberRoom(member.id)} className="text-primary">
                            <Check className="h-3 w-3" />
                          </button>
                          <button onClick={() => setEditingMemberId(null)} className="text-muted-foreground">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {member.room_no || "Unassigned"}
                          </span>
                          <button
                            onClick={() => startEditingMember(member.id, member.room_no || "")}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Pencil className="h-2.5 w-2.5 text-muted-foreground hover:text-primary" />
                          </button>
                        </div>
                      )}
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-sm transition-opacity hover:scale-110"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {displayedRooms.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No roommates yet. Add some! 👆
          </p>
        )}
      </CardContent>
    </Card>
  );
};
