import { useState } from "react";
import { UserPlus, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Member, useAddMember } from "@/hooks/useHostel";
import { toast } from "sonner";

interface MembersListProps {
  members: Member[];
  hostelId: string;
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

export const MembersList = ({ members, hostelId }: MembersListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const addMember = useAddMember();

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Name can't be empty! 👋");
      return;
    }

    try {
      await addMember.mutateAsync({ hostelId, name: newName.trim() });
      toast.success(`${newName} joined the crew! 🎉`);
      setNewName("");
      setIsAdding(false);
    } catch (error) {
      toast.error("Couldn't add member. Try again?");
    }
  };

  return (
    <Card variant="default">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Roommates ({members.length})
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
          <div className="flex gap-2 animate-fade-in">
            <Input
              placeholder="Roommate's name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="h-10"
              autoFocus
            />
            <Button
              onClick={handleAdd}
              disabled={addMember.isPending}
              size="sm"
            >
              Add
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {members.map((member, i) => (
            <div
              key={member.id}
              className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback
                  className={`${avatarColors[i % avatarColors.length]} text-white text-xs font-semibold`}
                >
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{member.name}</span>
            </div>
          ))}
        </div>

        {members.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No roommates yet. Add some! 👆
          </p>
        )}
      </CardContent>
    </Card>
  );
};
