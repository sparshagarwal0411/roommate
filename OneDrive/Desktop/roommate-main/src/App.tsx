import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Lobby from "./pages/Lobby";
import ProfileSetup from "./pages/ProfileSetup";
import NotFound from "./pages/NotFound";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useParams } from "react-router-dom";

const queryClient = new QueryClient();

// Wrapper for Dashboard to extract ID from URL
const DashboardWrapper = () => {
  const { id } = useParams();
  return <Dashboard hostelId={id || ""} onLeave={() => window.location.href = "/lobby"} />;
};

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading RoomMate...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Landing Page is now public */}
            <Route path="/" element={<Index />} />

            <Route path="/auth" element={session ? <Navigate to="/profile-setup" /> : <Auth />} />
            <Route path="/profile-setup" element={session ? <ProfileSetup /> : <Navigate to="/auth" />} />
            <Route path="/lobby" element={session ? <Lobby /> : <Navigate to="/auth" />} />
            <Route path="/dashboard/:id" element={session ? <DashboardWrapper /> : <Navigate to="/auth" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
