import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface RoomCodeQRProps {
  hostelCode: string;
  hostelName?: string;
  className?: string;
}

export const RoomCodeQR = ({ hostelCode, hostelName, className }: RoomCodeQRProps) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const joinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?join=${encodeURIComponent(hostelCode.toUpperCase())}`
    : "";

  useEffect(() => {
    if (!joinUrl) return;
    QRCode.toDataURL(joinUrl, { width: 200, margin: 2 }).then(setDataUrl).catch(() => setDataUrl(null));
  }, [joinUrl]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full", className)}
          aria-label="Show QR code to share room"
        >
          <QrCode className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Scan to join
          </p>
          {dataUrl ? (
            <div className="rounded-xl border-2 border-border bg-white p-2">
              <img src={dataUrl} alt="Room join QR code" className="size-40" />
            </div>
          ) : (
            <div className="size-40 rounded-xl border-2 border-dashed border-muted flex items-center justify-center">
              <QrCode className="size-12 text-muted-foreground/50" />
            </div>
          )}
          {hostelName && (
            <p className="text-xs text-muted-foreground text-center max-w-[200px] truncate" title={hostelName}>
              {hostelName}
            </p>
          )}
          <code className="text-sm font-bold tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
            {hostelCode}
          </code>
        </div>
      </PopoverContent>
    </Popover>
  );
};
