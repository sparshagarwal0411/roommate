import { useState } from "react";
import { Building2, Users, Receipt, PieChart, Sparkles, Wallet, Calculator, Bell, Heart, Star, ArrowRight, CheckCircle2, Coffee, Utensils, Wifi, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateHostel, useHostelByCode, useJoinHostel } from "@/hooks/useHostel";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LandingPageProps {
  onHostelJoined: () => void;
}

export const LandingPage = ({ onHostelJoined }: LandingPageProps) => {
  const [mode, setMode] = useState<'landing' | 'create' | 'join'>('landing');
  const [hostelName, setHostelName] = useState('');
  const [yourName, setYourName] = useState('');
  const [budget, setBudget] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const createHostel = useCreateHostel();
  const joinHostel = useJoinHostel();
  const { data: foundHostel, isLoading: searchingHostel } = useHostelByCode(joinCode);

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelName.trim() || !yourName.trim()) {
      toast.error("Please fill in all fields! 📝");
      return;
    }

    try {
      await createHostel.mutateAsync({
        name: hostelName.trim(),
        creatorName: yourName.trim(),
        budget: parseFloat(budget) || 0,
      });
      toast.success("🎉 Hostel created! Welcome aboard!");
      onHostelJoined();
    } catch (error) {
      toast.error("Oops! Something went wrong. Try again?");
    }
  };

  const handleJoinHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundHostel) {
      toast.error("Hostel not found. Check the code! 🔍");
      return;
    }
    if (!yourName.trim()) {
      toast.error("What's your name? 👋");
      return;
    }

    try {
      await joinHostel.mutateAsync({
        hostelId: foundHostel.id,
        name: yourName.trim(),
      });
      toast.success(`🎉 Welcome to ${foundHostel.name}!`);
      onHostelJoined();
    } catch (error) {
      toast.error("Couldn't join. Try again?");
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
  ];

  const testimonials = [
    { name: "Rahul", hostel: "IIT Delhi", quote: "Finally stopped fighting about who paid for what!", avatar: "👨‍🎓" },
    { name: "Priya", hostel: "BITS Pilani", quote: "Our room's finances are finally in order 🙌", avatar: "👩‍🎓" },
    { name: "Amit", hostel: "NIT Trichy", quote: "The auto-split feature is a lifesaver", avatar: "🧑‍💻" },
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
                <Label htmlFor="hostelName">Hostel Name</Label>
                <Input
                  id="hostelName"
                  placeholder="e.g., Room 404, Block A..."
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yourName">Your Name</Label>
                <Input
                  id="yourName"
                  placeholder="What do your roommates call you?"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly Budget (optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="₹10000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-12"
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
                <Label htmlFor="joinCode">Hostel Code</Label>
                <Input
                  id="joinCode"
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  className="h-14 text-center text-2xl font-bold tracking-[0.3em] uppercase"
                  maxLength={6}
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
                <Label htmlFor="yourNameJoin">Your Name</Label>
                <Input
                  id="yourNameJoin"
                  placeholder="What do your roommates call you?"
                  value={yourName}
                  onChange={(e) => setYourName(e.target.value)}
                  className="h-12"
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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">RoomMate</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container pt-24 pb-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            No sign-up required • 100% free
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Split expenses,
            <br />
            <span className="text-gradient">not friendships</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The easiest way for hostel roommates to track shared expenses, 
            split bills fairly, and know exactly who owes whom. 🎉
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => setMode('create')}
              className="text-lg group"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Create Hostel
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => setMode('join')}
              className="text-lg"
            >
              <Users className="h-5 w-5 mr-2" />
              Join with Code
            </Button>
          </div>
          
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>No app download</span>
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Works on any device</span>
            </div>
          </div>
        </div>

        {/* Floating Preview Card */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card variant="elevated" className="p-6 md:p-8 bg-gradient-to-br from-card via-card to-primary/5 border-2">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Mini balance preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  Quick Balance
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                    <span className="text-sm">You get back</span>
                    <span className="font-bold text-success">₹450</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                    <span className="text-sm">You owe</span>
                    <span className="font-bold text-destructive">₹120</span>
                  </div>
                </div>
              </div>
              
              {/* Mini expense list */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  Recent Expenses
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Groceries", amount: "₹560", by: "Rahul" },
                    { name: "WiFi Bill", amount: "₹400", by: "Priya" },
                    { name: "Dinner", amount: "₹280", by: "You" },
                  ].map((expense, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm">{expense.name}</span>
                      </div>
                      <span className="text-sm font-medium">{expense.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mini chart preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <PieChart className="h-4 w-4" />
                  Spending Split
                </div>
                <div className="flex items-center justify-center h-32">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-primary/20" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray="40 60" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-accent" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="-40" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-warning" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-65" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">This month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Everything you need 💡</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Simple tools to manage shared living expenses without the headaches
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {features.map((feature, i) => (
              <Card
                key={feature.title}
                variant="interactive"
                className="text-center animate-fade-in group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="pt-6 pb-4">
                  <div className={`w-14 h-14 ${feature.color.split(' ')[0]} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-7 w-7 ${feature.color.split(' ')[1]}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Perfect for hostel life 🏠</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Track everything from daily snacks to monthly bills
          </p>
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {useCases.map((useCase, i) => (
              <div
                key={useCase.title}
                className="flex items-center gap-3 px-5 py-3 rounded-full bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-xl">{useCase.emoji}</span>
                <span className="font-medium">{useCase.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-20 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">How it works ✨</h2>
          <p className="text-muted-foreground text-center mb-10">
            Get started in under 30 seconds
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Create hostel", desc: "Get a unique 6-digit code", icon: Building2 },
              { step: "2", title: "Share code", desc: "Send it to your roommates", icon: Users },
              { step: "3", title: "Add expenses", desc: "Track who paid for what", icon: Receipt },
              { step: "4", title: "See balances", desc: "Know who owes whom", icon: Calculator },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">Loved by students 💜</h2>
          <p className="text-muted-foreground text-center mb-10">
            Join thousands of happy hostelites
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <Card
                key={testimonial.name}
                variant="elevated"
                className="animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.hostel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 px-6 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to simplify your hostel finances? 🚀</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Create your hostel in seconds and start tracking expenses today. It's free forever!
          </p>
          <Button
            variant="hero"
            size="xl"
            onClick={() => setMode('create')}
            className="text-lg group"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">RoomMate</span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for hostel life
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 RoomMate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
