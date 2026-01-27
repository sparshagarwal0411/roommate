import React from "react";
import {
    Building2,
    Users,
    Receipt,
    PieChart,
    Sparkles,
    Calculator,
    Handshake,
    ArrowRight,
    CheckCircle2,
    Lock,
    Bell,
    Wallet
} from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const slides = [
    {
        title: "Create Your Space",
        step: "01",
        description: "Launch your hostel in seconds. Get a unique 6-digit code for your room.",
        icon: Building2,
        color: "from-emerald-500/20 to-teal-500/20",
        iconColor: "text-emerald-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6">
                <div className="glass p-6 rounded-2xl border-2 border-emerald-500/20 shadow-xl animate-float">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">Hostel Code</div>
                            <div className="text-2xl font-bold tracking-widest text-emerald-600 dark:text-emerald-400">I4Y 6I9</div>
                        </div>
                    </div>
                    <div className="space-y-2 opacity-60">
                        <div className="h-2 w-32 bg-muted rounded-full" />
                        <div className="h-2 w-24 bg-muted rounded-full" />
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Track Together",
        step: "02",
        description: "Log expenses instantly. No more forgetting who paid for the weekend chai or movie snacks.",
        icon: Receipt,
        color: "from-blue-500/20 to-indigo-500/20",
        iconColor: "text-blue-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6">
                <div className="glass p-5 rounded-2xl border-2 border-blue-500/20 shadow-xl w-full max-w-[240px] animate-float" style={{ animationDelay: "200ms" }}>
                    <div className="text-sm font-bold mb-3 flex items-center justify-between">
                        <span>New Expense</span>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/10 border-none text-[10px]">Recent</Badge>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">☕</div>
                                <div className="text-xs font-medium">Morning Chai</div>
                            </div>
                            <div className="text-xs font-bold text-blue-600">₹120</div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">🍜</div>
                                <div className="text-xs font-medium">Maggi</div>
                            </div>
                            <div className="text-xs font-bold">₹80</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Auto-Balance",
        step: "03",
        description: "Real-time balance summaries. Know exactly what you're owed and what you owe.",
        icon: PieChart,
        color: "from-purple-500/20 to-pink-500/20",
        iconColor: "text-purple-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6">
                <div className="glass p-5 rounded-2xl border-2 border-purple-500/20 shadow-xl w-full max-w-[240px] animate-float" style={{ animationDelay: "400ms" }}>
                    <div className="text-sm font-bold mb-4">Balance Summary</div>
                    <div className="space-y-3">
                        <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase">You get back</div>
                            <div className="text-xl font-bold text-emerald-600">₹450</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                            <div className="text-[10px] text-destructive font-medium uppercase">You owe</div>
                            <div className="text-xl font-bold text-destructive">₹120</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Instant Settlement",
        step: "04",
        description: "Settle debts with a click. Clear the air and keep friendships stress-free.",
        icon: Handshake,
        color: "from-amber-500/20 to-orange-500/20",
        iconColor: "text-amber-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6">
                <div className="glass p-5 rounded-2xl border-2 border-amber-500/20 shadow-xl w-full max-w-[240px] animate-float" style={{ animationDelay: "600ms" }}>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center relative">
                            <Handshake className="w-8 h-8 text-amber-500 animate-pulse" />
                            <div className="absolute -top-1 -right-1">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-background" />
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-bold">Settled Up!</div>
                            <div className="text-xs text-muted-foreground mt-1">Transaction confirmed</div>
                        </div>
                        <div className="w-full h-px bg-border my-1" />
                        <div className="text-[10px] font-mono opacity-50">#SETTLE-992-BX</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Smart Alerts",
        step: "05",
        description: "Never miss a beat. Get instant notifications when someone adds an expense or settles up.",
        icon: Bell,
        color: "from-rose-500/20 to-red-500/20",
        iconColor: "text-rose-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6">
                <div className="glass p-4 rounded-2xl border-2 border-rose-500/20 shadow-xl w-full max-w-[240px] animate-float" style={{ animationDelay: "800ms" }}>
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-rose-500/5 mb-2 border border-rose-500/10">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[10px] font-bold">Priya added an expense</div>
                            <div className="text-[8px] text-muted-foreground">WiFi Bill • ₹400</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[10px] font-bold">Amit settled up</div>
                            <div className="text-[8px] text-muted-foreground">Successfully cleared</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Budget Mastery",
        step: "06",
        description: "Stay within limits. Track your monthly spending goals and avoid end-of-month surprises.",
        icon: Wallet,
        color: "from-cyan-500/20 to-blue-500/20",
        iconColor: "text-cyan-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6">
                <div className="glass p-5 rounded-2xl border-2 border-cyan-500/20 shadow-xl w-full max-w-[240px] animate-float" style={{ animationDelay: "1000ms" }}>
                    <div className="text-sm font-bold mb-4 flex items-center justify-between">
                        <span>Monthly Budget</span>
                        <span className="text-[10px] text-cyan-500">75% Used</span>
                    </div>
                    <div className="space-y-4">
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[75%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] text-muted-foreground">Spent</div>
                                <div className="text-sm font-bold">₹3,750</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-muted-foreground">Total</div>
                                <div className="text-sm font-bold opacity-60">₹5,000</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
];

export const HowItWorksCarousel = () => {
    const [api, setApi] = React.useState<any>();

    React.useEffect(() => {
        if (!api) return;

        const autoplay = () => {
            api.scrollNext();
        };

        const intervalId = setInterval(autoplay, 4000);

        // Stop autoplay on interaction
        api.on("pointerDown", () => {
            clearInterval(intervalId);
        });

        return () => clearInterval(intervalId);
    }, [api]);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12">
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                    dragFree: false, // Ensure it snaps to slides
                }}
                className="w-full relative group"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {slides.map((slide, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                            <Card className="h-full border-none bg-gradient-to-br from-card to-muted/20 relative overflow-hidden group/card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                                {/* Background Accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${slide.color} blur-3xl opacity-50 group-hover/card:opacity-100 transition-opacity`} />

                                <CardContent className="p-6 md:p-8 flex flex-col h-full relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-2xl bg-background border border-border/50 shadow-sm ${slide.iconColor}`}>
                                            <slide.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-4xl font-black opacity-5 pointer-events-none select-none">
                                            {slide.step}
                                        </span>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover/card:text-primary transition-colors">
                                            {slide.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
                                            {slide.description}
                                        </p>
                                    </div>

                                    {/* Interactive Visual Area */}
                                    <div className="bg-muted/30 rounded-3xl aspect-[4/3] relative overflow-hidden group-hover/card:bg-muted/50 transition-colors">
                                        {slide.visual}
                                    </div>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12 h-12 w-12 border-2 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all shadow-xl" />
                <CarouselNext className="hidden md:flex -right-4 lg:-right-12 h-12 w-12 border-2 bg-background/50 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all shadow-xl" />

                {/* Mobile Swipe Indicator */}
                <div className="flex md:hidden justify-center items-center gap-2 mt-8 text-xs font-medium text-muted-foreground animate-pulse">
                    <ArrowRight className="w-3 h-3 rotate-180" />
                    <span>Swipe to explore</span>
                    <ArrowRight className="w-3 h-3" />
                </div>
            </Carousel>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .glass {
          background: rgba(var(--background), 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .dark .glass {
          background: rgba(var(--card), 0.6);
        }
      `}</style>
        </div>
    );
};
