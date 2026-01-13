import { useState, useEffect } from "react";
import { LandingPage } from "@/components/landing/LandingPage";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { getStoredHostelId } from "@/lib/hostel-store";

const Index = () => {
  const [hostelId, setHostelId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check for stored hostel session
    const storedId = getStoredHostelId();
    setHostelId(storedId);
    setIsChecking(false);

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleHostelJoined = () => {
    const storedId = getStoredHostelId();
    setHostelId(storedId);
  };

  const handleLeave = () => {
    setHostelId(null);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-xl font-semibold text-primary">
          Loading RoomMate...
        </div>
      </div>
    );
  }

  if (hostelId) {
    return <Dashboard hostelId={hostelId} onLeave={handleLeave} />;
  }

  return <LandingPage onHostelJoined={handleHostelJoined} />;
};

export default Index;
