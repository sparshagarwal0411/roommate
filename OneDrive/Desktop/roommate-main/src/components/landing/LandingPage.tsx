import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Building2, Users, Receipt, PieChart, Sparkles, Wallet, Calculator, Bell, Heart, Star, ArrowRight, CheckCircle2, Coffee, Utensils, Wifi, Zap, Car, Cake, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateHostel, useHostelByCode, useJoinHostel } from "@/hooks/useHostel";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HostelDialog } from "@/components/HostelDialog";

import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserMenu } from "@/components/UserMenu";
import { Footer } from "@/components/Footer";
import { HowItWorksCarousel } from "./HowItWorksCarousel";


// --- CUSTOM HOOK FOR SMOOTH ANIMATION (Pie Chart) ---
const useSmoothProgress = (target: number, duration: number = 1500) => {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    startValueRef.current = progress;
    startTimeRef.current = null;

    const animate = (time: number) => {
      if (startTimeRef.current === null) startTimeRef.current = time;
      const timeElapsed = time - startTimeRef.current;
      const ease = (t: number) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      if (timeElapsed < duration) {
        const t = timeElapsed / duration;
        setProgress(startValueRef.current + (target - startValueRef.current) * ease(t));
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(target);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [target, duration]);

  return progress;
};

// --- GRAIN TEXTURE OVERLAY ---
const GrainOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[20]">
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// --- LIQUID BACKGROUND (STATIC) ---
const LiquidBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Static Container */}
      <div className="absolute inset-0 w-full h-full">
        {/* Blob 1: Emerald/Green */}
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px]" />

        {/* Blob 2: Blue */}
        <div className="absolute top-[30%] right-[20%] w-[35vw] h-[35vw] bg-blue-500/20 dark:bg-blue-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px]" />

        {/* Blob 3: Purple */}
        <div className="absolute bottom-[20%] left-[30%] w-[45vw] h-[45vw] bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px]" />
      </div>

      {/* Grid overlay for texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    </div>
  );
};

// --- DANCING LIGHTS BACKGROUND COMPONENT (STATIC) ---
const DancingLights = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
      {/* Light 1: Primary Green */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full 
                      bg-green-400/40 dark:bg-primary/30 
                      blur-[80px] 
                      dark:mix-blend-screen" />

      {/* Light 2: Blue/Cyan */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full 
                      bg-blue-400/40 dark:bg-blue-500/30 
                      blur-[80px] 
                      dark:mix-blend-screen" />

      {/* Light 3: Purple/Accent */}
      <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full 
                      bg-purple-400/40 dark:bg-purple-500/20 
                      blur-[60px] 
                      dark:mix-blend-screen" />
    </div>
  );
};

// --- TYPEWRITER COMPONENT ---
const Typewriter = () => {
  const messages = [
    "The easiest way to track shared expenses 🏠",
    "Split bills fairly without the drama ✨",
    "Know exactly who owes whom instantly 💸"
  ];
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleType = () => {
      const fullText = messages[messageIndex % messages.length];

      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        setTypingSpeed(30);
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        setTypingSpeed(80);
      }

      if (!isDeleting && currentText === fullText) {
        setTypingSpeed(2000);
        setIsDeleting(true);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setMessageIndex((prev) => prev + 1);
        setTypingSpeed(300);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, messageIndex, typingSpeed]);

  return (
    <div className="h-[60px] md:h-[40px] flex items-center justify-center mb-10">
      <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        {currentText}
        <span className="animate-pulse ml-1 text-primary">|</span>
      </p>
    </div>
  );
};

// --- TYPEWRITER TITLE COMPONENT ---
const TypewriterTitle = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setKey(prev => prev + 1);
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    setIsFinished(false);
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.substring(0, i));
        i++;
      } else {
        setIsFinished(true);
        clearInterval(interval);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [text, key]);

  return (
    <span className="inline-block relative">
      {displayText}
      {!isFinished && <span className="animate-pulse ml-0.5 text-green-500">|</span>}
    </span>
  );
};

interface LandingPageProps {
  onHostelJoined: () => void;
}

export const LandingPage = ({ onHostelJoined }: LandingPageProps) => {
  const [session, setSession] = useState<any>(null);
  const [mode, setMode] = useState<'landing' | 'create' | 'join'>('landing');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  // --- SCROLL LOCK ---
  useEffect(() => {
    if (mode === 'create' || mode === 'join') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mode]);

  const [hostelName, setHostelName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [yourName, setYourName] = useState('');
  const [budget, setBudget] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isRoommate, setIsRoommate] = useState(true);

  const createHostel = useCreateHostel();
  const joinHostel = useJoinHostel();
  const { data: foundHostel, isLoading: searchingHostel } = useHostelByCode(joinCode);

  // --- ANIMATION OBSERVERS ---
  const [isVisible, setIsVisible] = useState(false);
  const [pieChartInView, setPieChartInView] = useState(false);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [useCasesVisible, setUseCasesVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 });
    const element = document.getElementById('features-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setHowItWorksVisible(entry.isIntersecting), { threshold: 0.1 });
    const element = document.getElementById('how-it-works-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setUseCasesVisible(entry.isIntersecting), { threshold: 0.1 });
    const element = document.getElementById('use-cases-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Pie Chart Visibility
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setPieChartInView(entry.isIntersecting);
    }, { threshold: 0.3 });
    const element = document.getElementById('preview-card-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // --- PIE CHART LOGIC (SMOOTH SEQUENTIAL) ---
  const chartProgress = useSmoothProgress(pieChartInView ? 100 : 0, 1500);

  const CIRCUMFERENCE = 97.389;
  const TOTAL_VALUE = 85;

  const currentTotal = (chartProgress / 100) * TOTAL_VALUE;

  const val1 = Math.min(currentTotal, 40);
  const val2 = Math.min(Math.max(currentTotal - 40, 0), 25);
  const val3 = Math.min(Math.max(currentTotal - 65, 0), 20);

  const dash1 = (val1 / 100) * CIRCUMFERENCE;
  const dash2 = (val2 / 100) * CIRCUMFERENCE;
  const dash3 = (val3 / 100) * CIRCUMFERENCE;

  const offset1 = 0;
  const offset2 = -(40 / 100) * CIRCUMFERENCE;
  const offset3 = -((40 + 25) / 100) * CIRCUMFERENCE;

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelName.trim() || !roomNo.trim() || !yourName.trim()) {
      toast.error("Please fill in all mandatory fields! 📝");
      return;
    }
    try {
      await createHostel.mutateAsync({
        name: hostelName.trim(),
        room_no: roomNo.trim(),
        creatorName: yourName.trim(),
        budget: parseFloat(budget) || 0,
        includeCreatorAsMember: isRoommate,
      });
      toast.success("🎉 Hostel created! Welcome aboard!");
      onHostelJoined();
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

  const features = [
    { icon: Users, title: "Add Roommates", desc: "Simple name-based tracking", color: "bg-primary/10 text-primary" },
    { icon: Receipt, title: "Track Expenses", desc: "Split bills fairly", color: "bg-accent/10 text-accent" },
    { icon: PieChart, title: "Visual Insights", desc: "See where money goes", color: "bg-warning/10 text-warning" },
    { icon: Sparkles, title: "Auto-Split", desc: "Know who owes whom", color: "bg-success/10 text-success" },
  ];

  const useCases = [
    { icon: Coffee, title: "Morning chai runs", emoji: "☕" },
    { icon: Utensils, title: "Maggi & groceries", emoji: "🍜" },
    { icon: Wifi, title: "WiFi & subscriptions", emoji: "📶" },
    { icon: Zap, title: "Electricity bills", emoji: "⚡" },
    { icon: Car, title: "Late night cabs", emoji: "🚕" },
    { icon: Cake, title: "Birthday treats", emoji: "🎂" },
    { icon: Film, title: "Movie nights", emoji: "🍿" },
  ];

  const testimonials = [
    { name: "Rahul", hostel: "IIT Delhi", quote: "Finally stopped fighting about who paid for what!", avatar: "👨‍🎓" },
    { name: "Priya", hostel: "BITS Pilani", quote: "Our room's finances are finally in order 🙌", avatar: "👩‍🎓" },
    { name: "Amit", hostel: "NIT Trichy", quote: "The auto-split feature is a lifesaver", avatar: "🧑‍💻" },
    { name: "Sneha", hostel: "NSUT Delhi", quote: "Best app for hostel expense tracking! 💖", avatar: "👩‍💻" },
    { name: "Rohan", hostel: "DTU", quote: "Simple, fast, and actually works. 🚀", avatar: "👨‍💻" },
    { name: "Ananya", hostel: "IGDTUW", quote: "No more awkward money convos! 😎", avatar: "👩‍🎓" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">

      {/* 1. LIQUID BACKGROUND (STATIC) */}
      <LiquidBackground />

      {/* 2. GRAIN TEXTURE OVERLAY */}
      <GrainOverlay />

      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode('landing')}>
            <img
              src="/ChatGPT Image Jan 15, 2026, 09_03_32 PM.png"
              alt="RoomMate Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="font-bold text-xl">RoomMate</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/lobby")} variant="outline" className="hidden sm:flex">Lobby</Button>
                <UserMenu />
              </div>
            ) : (
              <>
                <Button onClick={() => navigate("/auth")} variant="ghost">Login</Button>
                <Button onClick={() => navigate("/auth")}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container pt-20 md:pt-24 pb-12 relative z-10">

        {/* WAVE ANIMATION STYLE (FOR TRUST INDICATORS ONLY) */}
        <style>{`
          @keyframes wave-shine {
            0%, 100% { color: inherit; opacity: 0.7; }
            50% { color: #22c55e; opacity: 1; text-shadow: 0 0 10px rgba(34, 197, 94, 0.5); }
          }
          .animate-wave-shine {
            animation: wave-shine 4s ease-in-out infinite;
          }
        `}</style>

        <div className="text-center max-w-5xl mx-auto mb-24 animate-fade-in">

          {/* BIG LOGO & TITLE */}
          <div className="flex items-center justify-center gap-1 mb-8 -ml-4 md:-ml-8 transition-all">
            <img
              src="/ChatGPT Image Jan 15, 2026, 09_03_32 PM.png"
              alt="RoomMate Logo"
              className="md:w-30 md:h-40 object-contain"
            />
            <span className="font-extrabold text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none">
              <TypewriterTitle text="Room Mate" />
            </span>
          </div>

          {/* INSTANT SETUP BADGE */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 text-primary text-base font-medium mb-8">
            <Sparkles className="h-5 w-5" />
            Instant Setup • 100% free
          </div>

          {/* PUNCHLINE WITH STATIC GRADIENT (TEAL -> BLUE -> PURPLE) */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight">
            Split expenses,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 pb-2">
              not friendships
            </span>
          </h1>

          {/* TYPEWRITER TEXT */}
          <Typewriter />

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => session ? setMode('create') : navigate("/auth")}
              className="text-xl h-14 px-10 group"
            >
              <Building2 className="h-6 w-6 mr-2" />
              Create Hostel
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => session ? setMode('join') : navigate("/auth")}
              className="text-xl h-14 px-8"
            >
              <Users className="h-6 w-6 mr-2" />
              Join with Code
            </Button>
          </div>

          {/* TRUST INDICATORS + BRANDING */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-10 text-base text-muted-foreground">

            {/* 1. Instant Setup */}
            <div className="flex items-center gap-2 animate-wave-shine" style={{ animationDelay: '0s' }}>
              <CheckCircle2 className="h-5 w-5" />
              <span>Instant Setup</span>
            </div>

            {/* 2. Easy to use */}
            <div className="flex items-center gap-2 animate-wave-shine" style={{ animationDelay: '0.3s' }}>
              <CheckCircle2 className="h-5 w-5" />
              <span>Easy to use</span>
            </div>

            {/* 3. No app download */}
            <div className="flex items-center gap-2 hidden sm:flex animate-wave-shine" style={{ animationDelay: '0.6s' }}>
              <CheckCircle2 className="h-5 w-5" />
              <span>No app download</span>
            </div>

            {/* SEPARATOR */}
            <div className="hidden sm:block text-border text-2xl font-light">|</div>

            {/* 4. Data Remains Safe */}
            <div className="flex items-center gap-2 hidden sm:flex animate-wave-shine" style={{ animationDelay: '0.6s' }}>
              <CheckCircle2 className="h-5 w-5" />
              <span>Data Remains Safe</span>
            </div>

            {/* 5. No Spam Notification */}
            <div className="flex items-center gap-2 hidden sm:flex animate-wave-shine" style={{ animationDelay: '0.6s' }}>
              <CheckCircle2 className="h-5 w-5" />
              <span>No Spam</span>
            </div>

            {/* 6. No Ads */}
            <div className="flex items-center gap-2 hidden sm:flex animate-wave-shine" style={{ animationDelay: '0.6s' }}>
              <CheckCircle2 className="h-5 w-5" />
              <span>No Ads</span>
            </div>

          </div>

          {/* Hero Carousel - How it Works */}
          <div className="mt-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
            <HowItWorksCarousel />
          </div>
        </div>


        {/* Floating Preview Card - CENTERED CONTENT */}
        <div className="max-w-6xl mx-auto mb-32" id="preview-card-section">
          <Card variant="elevated" className="p-8 md:p-12 bg-gradient-to-br from-card via-card to-primary/5 border-2 shadow-2xl backdrop-blur-sm bg-white/50 dark:bg-card/50">
            <div className="grid md:grid-cols-3 gap-10">

              {/* Card 1: Quick Balance (Centered Vertically) */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 text-base font-medium text-muted-foreground mb-6">
                  <Wallet className="h-5 w-5" />
                  Quick Balance
                </div>
                {/* Centered Content */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-success/10">
                    <span className="text-base">You get back</span>
                    <span className="font-bold text-lg text-success">₹450</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10">
                    <span className="text-base">You owe</span>
                    <span className="font-bold text-lg text-destructive">₹120</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Recent Expenses (Centered Vertically) */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 text-base font-medium text-muted-foreground mb-6">
                  <Receipt className="h-5 w-5" />
                  Recent Expenses
                </div>
                {/* Centered Content */}
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  {[
                    { name: "Groceries", amount: "₹560", by: "Rahul" },
                    { name: "WiFi Bill", amount: "₹400", by: "Priya" },
                    { name: "Dinner", amount: "₹280", by: "You" },
                  ].map((expense, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-base">{expense.name}</span>
                      </div>
                      <span className="text-base font-medium">{expense.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Spending Split (Centered Vertically) */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 text-base font-medium text-muted-foreground mb-6">
                  <PieChart className="h-5 w-5" />
                  Spending Split
                </div>
                {/* Centered Content */}
                <div className="flex-1 flex flex-col justify-center items-center">
                  <div className="relative w-36 h-36 mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-primary/20" strokeWidth="3" />

                      {/* Seg 1: Primary (0-40) */}
                      <circle
                        cx="18" cy="18" r="15.5" fill="none"
                        className="stroke-primary"
                        strokeWidth="3"
                        strokeDasharray={`${dash1} ${CIRCUMFERENCE}`}
                        strokeDashoffset={-offset1}
                        strokeLinecap="round"
                        style={{ opacity: val1 > 0 ? 1 : 0 }}
                      />

                      {/* Seg 2: Accent (40-65) */}
                      <circle
                        cx="18" cy="18" r="15.5" fill="none"
                        className="stroke-accent"
                        strokeWidth="3"
                        strokeDasharray={`${dash2} ${CIRCUMFERENCE}`}
                        strokeDashoffset={offset2}
                        strokeLinecap="round"
                        style={{ opacity: val2 > 0 ? 1 : 0 }}
                      />

                      {/* Seg 3: Warning (65-85) */}
                      <circle
                        cx="18" cy="18" r="15.5" fill="none"
                        className="stroke-warning"
                        strokeWidth="3"
                        strokeDasharray={`${dash3} ${CIRCUMFERENCE}`}
                        strokeDashoffset={offset3}
                        strokeLinecap="round"
                        style={{ opacity: val3 > 0 ? 1 : 0 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">This month</span>
                    </div>
                  </div>

                  {/* LEGEND */}
                  <div className="flex gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span>Rahul</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      <span>Amit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                      <span>Rohan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div id="features-section" className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Everything you need 💡</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Simple tools to manage shared living expenses without the headaches
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto overflow-hidden p-4">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                variant="interactive"
                className={`text-center group transition-all duration-1000 ease-out ${isVisible
                  ? "opacity-100 translate-x-0"
                  : i < 2
                    ? "opacity-0 -translate-x-12"
                    : "opacity-0 translate-x-12"
                  }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <CardContent className="pt-8 pb-6">
                  <div className={`w-16 h-16 ${feature.color.split(' ')[0]} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-9 w-9 ${feature.color.split(' ')[1]}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-base text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-32" id="use-cases-section">
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 transition-all duration-500 ${useCasesVisible ? 'animate-fade-in opacity-100' : 'opacity-0'}`}>Perfect for hostel life 🏠</h2>
          <p className={`text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto transition-all duration-500 ${useCasesVisible ? 'animate-fade-in opacity-100' : 'opacity-0'}`} style={{ transitionDelay: useCasesVisible ? '100ms' : '0ms' }}>
            Track everything from daily snacks to monthly bills
          </p>
          <div className="flex flex-wrap justify-center gap-5 max-w-5xl mx-auto">
            {useCases.map((useCase, i) => (
              <div
                key={useCase.title}
                className={`flex items-center gap-4 px-6 py-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted hover:to-muted/50 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out group cursor-pointer border border-border/40 hover:border-primary/40 ${useCasesVisible ? 'animate-fade-in opacity-100' : 'opacity-0'}`}
                style={{ animationDelay: useCasesVisible ? `${i * 80}ms` : '0ms' }}
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300 inline-block group-hover:-rotate-12">{useCase.emoji}</span>
                <span className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">{useCase.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div id="how-it-works-section" className="mb-32 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How it works ✨</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Get started in under 30 seconds
          </p>
          <div className="grid md:grid-cols-4 gap-10">
            {[
              { step: "1", title: "Create hostel", desc: "Get a unique 6-digit code", icon: Building2 },
              { step: "2", title: "Share code", desc: "Send it to your roommates", icon: Users },
              { step: "3", title: "Add expenses", desc: "Track who paid for what", icon: Receipt },
              { step: "4", title: "See balances", desc: "Know who owes whom", icon: Calculator },
            ].map((item, i) => (
              <div
                key={i}
                className={`text-center opacity-0 ${howItWorksVisible ? "animate-bounce-in opacity-100" : ""}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-6 relative z-10">
                  {item.step}
                  <div className="absolute -inset-1 blur-lg bg-primary/30 -z-10 rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-base text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-32" id="testimonials-section">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Loved by students 💜</h2>
          <p className="text-xl text-muted-foreground text-center mb-16">
            Join thousands of happy hostelites
          </p>
          <div className="relative overflow-hidden w-full py-6 mask-linear-fade">
            <div className="flex animate-marquee gap-8 w-max hover:pause-animation">
              {[...testimonials, ...testimonials].map((testimonial, i) => (
                <Card
                  key={`${testimonial.name}-${i}`}
                  variant="elevated"
                  className="w-[400px] shrink-0 hover:scale-105 transition-transform duration-300"
                >
                  <CardContent className="pt-8">
                    <div className="flex items-center gap-1.5 mb-5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-5 w-5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-lg text-muted-foreground mb-6 line-clamp-2">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{testimonial.name}</p>
                        <p className="text-base text-muted-foreground">{testimonial.hostel}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section - DANCING LIGHTS (STATIC) */}
        <div className="relative overflow-hidden py-20 px-8 rounded-[3rem] bg-gradient-to-br from-card via-accent/5 to-primary/5 border border-border/50 shadow-xl mb-12 group">

          {/* Dancing Lights Background */}
          <DancingLights />

          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to simplify your hostel finances? 🚀</h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Create your hostel in seconds and start tracking expenses today. It's free forever!
            </p>
            <div className="flex justify-center mt-8">
              <Button
                variant="hero"
                size="xl"
                onClick={() => session ? setMode('create') : navigate("/auth")}
                className="text-xl h-14 px-10 group"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* OVERLAYS */}
      {(mode === 'create' || mode === 'join') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <style>{`
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}</style>
          <div
            className="w-full max-w-lg relative rounded-3xl bg-background shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <HostelDialog
              isOpen={true}
              open={true}
              onHostelJoined={onHostelJoined}
              onClose={() => setMode('landing')}
              initialMode={mode as 'create' | 'join'}
            />
          </div>
          <div className="absolute inset-0 -z-10" onClick={() => setMode('landing')} />
        </div>
      )}
    </div>
  );
};