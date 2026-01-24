import { useState, useEffect } from "react";
import { Building2, Users, Receipt, PieChart, Sparkles, Wallet, Calculator, Bell, Heart, Star, ArrowRight, CheckCircle2, Coffee, Utensils, Wifi, Zap, Car, Cake, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateHostel, useHostelByCode, useJoinHostel } from "@/hooks/useHostel";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserMenu } from "@/components/UserMenu";
import { Footer } from "@/components/Footer";
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
  const [hostelName, setHostelName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [yourName, setYourName] = useState('');
  const [budget, setBudget] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isRoommate, setIsRoommate] = useState(true);

  const createHostel = useCreateHostel();
  const joinHostel = useJoinHostel();
  const { data: foundHostel, isLoading: searchingHostel } = useHostelByCode(joinCode);

  // Scroll animation logic
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById('features-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Scroll animation logic for How It Works
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHowItWorksVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById('how-it-works-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Scroll animation logic for Use Cases
  const [useCasesVisible, setUseCasesVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setUseCasesVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    const element = document.getElementById('use-cases-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

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

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card variant="elevated" className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create Your Hostel</CardTitle>
            <CardDescription>Set up your shared living space in seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateHostel} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hostelName">Hostel Name *</Label>
                <Input
                  id="hostelName"
                  placeholder="e.g., Grand Residency, PG House..."
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNo">Number of Rooms *</Label>
                <Input
                  id="roomNo"
                  placeholder="e.g., Room 302, B-Block 101..."
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yourName">Your Name *</Label>
                <Input
                  id="yourName"
                  placeholder="What do your roommates call you?"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Max. Budget Target (optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="₹10000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isRoommate"
                  checked={isRoommate}
                  onChange={(e) => setIsRoommate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isRoommate" className="text-sm font-normal">
                  Join as a roommate (I'll share expenses)
                </Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('landing')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={createHostel.isPending}
                >
                  {createHostel.isPending ? "Creating..." : "Create Hostel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card variant="elevated" className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Join a Hostel</CardTitle>
            <CardDescription>Enter the 6-digit code from your roommate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinHostel} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode">Hostel Code *</Label>
                <Input
                  id="joinCode"
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  className="h-14 text-center text-2xl font-bold tracking-[0.3em] uppercase"
                  maxLength={6}
                  required
                />
                {joinCode.length === 6 && (
                  <p className="text-sm text-center">
                    {searchingHostel ? (
                      <span className="text-muted-foreground">Searching... 🔍</span>
                    ) : foundHostel ? (
                      <span className="text-success">Found: {foundHostel.name} ✓</span>
                    ) : (
                      <span className="text-destructive">No hostel found ✗</span>
                    )}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="yourNameJoin">Your Name *</Label>
                <Input
                  id="yourNameJoin"
                  placeholder="What do your roommates call you?"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNoJoin">Room Number *</Label>
                <Input
                  id="roomNoJoin"
                  placeholder="e.g., Room 302, B-Block 101..."
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode('landing')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={!foundHostel || joinHostel.isPending}
                >
                  {joinHostel.isPending ? "Joining..." : "Join Hostel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }



  // Landing page
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMode('landing')}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
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

      {/* Hero Section */}
      <main className="container pt-32 pb-12">
        <div className="text-center max-w-5xl mx-auto mb-24 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 text-primary text-base font-medium mb-8">
            <Sparkles className="h-5 w-5" />
            Instant Setup • 100% free
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight">
            Split expenses,
            <br />
            <span className="text-gradient">not friendships</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            The easiest way for hostel roommates to track shared expenses,
            split bills fairly, and know exactly who owes whom. 🎉
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => session ? setMode('create') : navigate("/auth")}
              className="text-xl h-14 px-8 group"
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

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-10 text-base text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span>No app download</span>
            </div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span>Works on any device</span>
            </div>
          </div>
        </div>

        {/* Floating Preview Card */}
        <div className="max-w-6xl mx-auto mb-32">
          <Card variant="elevated" className="p-8 md:p-12 bg-gradient-to-br from-card via-card to-primary/5 border-2 shadow-2xl">
            <div className="grid md:grid-cols-3 gap-10">
              {/* Mini balance preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-base font-medium text-muted-foreground">
                  <Wallet className="h-5 w-5" />
                  Quick Balance
                </div>
                <div className="space-y-4">
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

              {/* Mini expense list */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-base font-medium text-muted-foreground">
                  <Receipt className="h-5 w-5" />
                  Recent Expenses
                </div>
                <div className="space-y-3">
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

              {/* Mini chart preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-base font-medium text-muted-foreground">
                  <PieChart className="h-5 w-5" />
                  Spending Split
                </div>
                <div className="flex items-center justify-center h-40">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-primary/20" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="40 60" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-accent" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-40" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-warning" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-65" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">This month</span>
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

        {/* CTA Section */}
        <div className="text-center py-20 px-8 rounded-[3rem] bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to simplify your hostel finances? 🚀</h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create your hostel in seconds and start tracking expenses today. It's free forever!
          </p>
          <Button
            variant="hero"
            size="xl"
            onClick={() => setMode('create')}
            className="text-xl h-14 px-10 group"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
