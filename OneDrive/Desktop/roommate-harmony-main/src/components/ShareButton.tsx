import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  hostelCode: string;
  hostelName: string;
}

export const ShareButton = ({ hostelCode, hostelName }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const shareText = `Join my hostel "${hostelName}" on RoomMate! 🏠\n\nUse code: ${hostelCode}\n\n${window.location.origin}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success("Copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${hostelName} on RoomMate`,
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        // User cancelled or error
        console.log("Share cancelled");
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Share your hostel 🏠</h4>
          <p className="text-xs text-muted-foreground">
            Invite roommates to join with this code
          </p>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
            <code className="text-lg font-bold tracking-widest flex-1 text-center">
              {hostelCode}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button onClick={shareNative} className="w-full" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Invite
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
