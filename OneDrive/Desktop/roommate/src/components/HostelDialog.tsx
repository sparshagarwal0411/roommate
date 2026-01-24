import { useState } from "react";
import { Building2, Users, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useCreateHostel, useHostelByCode, useJoinHostel } from "@/hooks/useHostel";

interface HostelDialogProps {
  onHostelJoined: () => void;
  onClose: () => void;
  initialMode?: 'create' | 'join';
}

export const HostelDialog = ({ onHostelJoined, onClose, initialMode = 'create' }: HostelDialogProps) => {
  const [mode, setMode] = useState<'create' | 'join'>(initialMode);
  const [hostelName, setHostelName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [yourName, setYourName] = useState('');
  const [budget, setBudget] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isRoommate, setIsRoommate] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdCode, setCreatedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const createHostel = useCreateHostel();
  const joinHostel = useJoinHostel();
  const { data: foundHostel, isLoading: searchingHostel } = useHostelByCode(joinCode);

  // Reset form fields
  const resetForm = () => {
    setHostelName('');
    setRoomNo('');
    setYourName('');
    setBudget('');
    setJoinCode('');
    setIsRoommate(true);
  };

  // Handle mode change with form reset
  const handleModeChange = (newMode: 'create' | 'join') => {
    setMode(newMode);
    resetForm();
  };

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelName.trim() || !roomNo.trim() || !yourName.trim()) {
      toast.error("Please fill in all mandatory fields! 📝");
      return;
    }

    try {
      const result = await createHostel.mutateAsync({
        name: hostelName.trim(),
        room_no: roomNo.trim(),
        creatorName: yourName.trim(),
        budget: parseFloat(budget) || 0,
        includeCreatorAsMember: isRoommate,
      });
      
      // Show success screen with hostel code
      setCreatedCode(result.code || 'GENERATED');
      setShowSuccess(true);
    } catch (error: any) {
      toast.error(error?.message || "Oops! Something went wrong. Try again?");
    }
  };

  const handleJoinHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code! 🔑");
      return;
    }
    if (!foundHostel) {
      toast.error("Hostel not found. Check the code! 🔍");
      return;
    }
    if (!yourName.trim() || !roomNo.trim()) {
      toast.error("Please fill in both your name and room number! 👋");
      return;
    }

    try {
      await joinHostel.mutateAsync({
        hostelId: foundHostel.id,
        name: yourName.trim(),
        room_no: roomNo.trim(),
      });
      toast.success(`🎉 Welcome to ${foundHostel.name}!`);
      onHostelJoined();
    } catch (error: any) {
      toast.error(error?.message || "Couldn't join. Try again?");
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Hostel code copied! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  // Success screen after hostel creation
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card variant="elevated" className="w-full max-w-md animate-fade-in border-2 sm:max-w-lg">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success animate-bounce" />
            </div>
            <CardTitle className="text-3xl">Hostel Created! 🎉</CardTitle>
            <CardDescription className="text-base">
              Share this code with your roommates to invite them
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/10 p-6 rounded-lg text-center space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Hostel Code</p>
              <p className="text-4xl font-bold tracking-[0.2em] text-primary">{createdCode}</p>
              <Button
                onClick={() => copyToClipboard(createdCode)}
                variant="outline"
                className="w-full h-10"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={onHostelJoined}
              variant="hero"
              className="w-full h-12 text-lg transition-all duration-300 hover:scale-105"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card variant="elevated" className="w-full max-w-2xl animate-fade-in border-2 sm:max-w-3xl">
        <CardHeader className="text-center px-4 py-6 sm:px-6 sm:py-8">
          <CardTitle className="text-2xl sm:text-3xl mb-4">Get Started with RoomMate</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Choose to create a new hostel or join an existing one
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {/* Tab Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
            <button
              onClick={() => handleModeChange('create')}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 ${
                mode === 'create'
                  ? 'border-primary bg-primary/10 scale-105'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2" />
              <p className="font-semibold text-sm sm:text-base">Create Hostel</p>
              <p className="text-xs text-muted-foreground">Start a new one</p>
            </button>
            <button
              onClick={() => handleModeChange('join')}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 ${
                mode === 'join'
                  ? 'border-accent bg-accent/10 scale-105'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2" />
              <p className="font-semibold text-sm sm:text-base">Join Hostel</p>
              <p className="text-xs text-muted-foreground">Use invite code</p>
            </button>
          </div>

          {/* Content */}
          {mode === 'create' ? (
            <form onSubmit={handleCreateHostel} className="space-y-4 transition-all duration-300">
              <div className="space-y-2">
                <Label htmlFor="hostelName" className="text-sm sm:text-base">Hostel Name *</Label>
                <Input
                  id="hostelName"
                  placeholder="e.g., Grand Residency, PG House..."
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNo" className="text-sm sm:text-base">Number of Rooms *</Label>
                <Input
                  id="roomNo"
                  placeholder="e.g., Room 302, B-Block 101..."
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yourName" className="text-sm sm:text-base">Your Name *</Label>
                <Input
                  id="yourName"
                  placeholder="What do your roommates call you?"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleCreateHostel(e as any)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm sm:text-base">Monthly Max. Budget Target (optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="₹10000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleCreateHostel(e as any)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isRoommate"
                  checked={isRoommate}
                  onChange={(e) => setIsRoommate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <Label htmlFor="isRoommate" className="text-xs sm:text-sm font-normal cursor-pointer">
                  Join as a roommate (I'll share expenses)
                </Label>
              </div>
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-105"
                  disabled={createHostel.isPending}
                >
                  {createHostel.isPending ? "Creating..." : "Create Hostel"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleJoinHostel} className="space-y-4 transition-all duration-300">
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-sm sm:text-base">Hostel Code *</Label>
                <Input
                  id="joinCode"
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  className="h-12 sm:h-14 text-xl sm:text-2xl font-bold tracking-[0.3em] uppercase text-center"
                  maxLength={6}
                  onKeyPress={(e) => e.key === "Enter" && joinCode.length === 6 && handleJoinHostel(e as any)}
                  required
                />
                {joinCode.length === 6 && (
                  <p className="text-xs sm:text-sm text-center transition-all duration-300">
                    {searchingHostel ? (
                      <span className="text-muted-foreground">Searching... 🔍</span>
                    ) : foundHostel ? (
                      <span className="text-success flex items-center justify-center gap-1">
                        <Check className="h-4 w-4" />
                        Found: {foundHostel.name} ✓
                      </span>
                    ) : (
                      <span className="text-destructive">No hostel found ✗</span>
                    )}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="yourNameJoin" className="text-sm sm:text-base">Your Name *</Label>
                <Input
                  id="yourNameJoin"
                  placeholder="What do your roommates call you?"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleJoinHostel(e as any)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNoJoin" className="text-sm sm:text-base">Room Number *</Label>
                <Input
                  id="roomNoJoin"
                  placeholder="e.g., Room 302, B-Block 101..."
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleJoinHostel(e as any)}
                  required
                />
              </div>
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 hover:scale-105"
                  disabled={!foundHostel || joinHostel.isPending}
                >
                  {joinHostel.isPending ? "Joining..." : "Join Hostel"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
