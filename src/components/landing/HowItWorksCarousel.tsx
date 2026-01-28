import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
    Building2,
    Receipt,
    PieChart,
    Handshake,
    ArrowRight,
    CheckCircle2,
    Bell,
    Wallet,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const slides = [
    {
        title: "Create Your Space",
        step: "01",
        description: "Launch your hostel in seconds. Get a unique 6-digit code for your room.",
        icon: Building2,
        color: "from-emerald-500 to-teal-600",
        lightColor: "bg-emerald-500/10",
        iconColor: "text-emerald-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="glass p-6 rounded-2xl border-2 border-emerald-500/20 shadow-2xl animate-float bg-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Share this Code</div>
                            <div className="text-3xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">I4Y 6I9</div>
                        </div>
                    </div>
                    <div className="space-y-2 opacity-30">
                        <div className="h-2 w-32 bg-emerald-500 rounded-full" />
                        <div className="h-2 w-24 bg-emerald-500 rounded-full" />
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
        color: "from-blue-500 to-indigo-600",
        lightColor: "bg-blue-500/10",
        iconColor: "text-blue-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="glass p-5 rounded-2xl border-2 border-blue-500/20 shadow-2xl w-full max-w-[240px] animate-float-delayed bg-white/10 backdrop-blur-md">
                    <div className="text-sm font-black mb-4 flex items-center justify-between">
                        <span className="text-blue-500">Add Bill</span>
                        <Badge className="bg-blue-500 text-white border-none text-[10px] px-2 py-0">New</Badge>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 text-lg">☕</div>
                                <div className="text-xs font-bold text-blue-700/80 dark:text-blue-300">Chai Break</div>
                            </div>
                            <div className="text-sm font-black text-blue-600">₹120</div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-lg">🍜</div>
                                <div className="text-xs font-bold opacity-60">Maggi Party</div>
                            </div>
                            <div className="text-sm font-black">₹85</div>
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
        color: "from-purple-500 to-fuchsia-600",
        lightColor: "bg-purple-500/10",
        iconColor: "text-purple-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="glass p-6 rounded-3xl border-2 border-purple-500/20 shadow-2xl w-full max-w-[250px] animate-float bg-white/10 backdrop-blur-md">
                    <div className="text-sm font-black mb-4 text-purple-500 uppercase tracking-wider">Settlements</div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group">
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-1">To Receive</div>
                            <div className="text-2xl font-black text-emerald-600 tracking-tighter">₹450</div>
                            <div className="absolute right-[-10px] bottom-[-10px] w-12 h-12 bg-emerald-500/10 rounded-full blur-xl" />
                        </div>
                        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 relative overflow-hidden">
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest mb-1">To Pay</div>
                            <div className="text-2xl font-black text-rose-600 tracking-tighter">₹120</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Instant Settle",
        step: "04",
        description: "Settle debts with a click. Clear the air and keep friendships stress-free.",
        icon: Handshake,
        color: "from-amber-400 to-orange-600",
        lightColor: "bg-amber-500/10",
        iconColor: "text-amber-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="glass p-6 rounded-[2rem] border-2 border-amber-500/20 shadow-2xl w-full max-w-[240px] animate-float bg-white/10 backdrop-blur-md">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/30 to-orange-500/30 flex items-center justify-center relative shadow-inner">
                            <Handshake className="w-10 h-10 text-amber-500 animate-pulse" />
                            <div className="absolute top-0 right-0">
                                <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg border-2 border-white dark:border-card">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-amber-600">All Cleared!</div>
                            <div className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-widest">Transaction #992-BX</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-2">
                            <div className="h-1 bg-amber-500/20 rounded-full" />
                            <div className="h-1 bg-amber-500/20 rounded-full" />
                        </div>
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
        color: "from-rose-500 to-pink-600",
        lightColor: "bg-rose-500/10",
        iconColor: "text-rose-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="glass p-5 rounded-3xl border-2 border-rose-500/20 shadow-2xl w-full max-w-[240px] animate-float-delayed bg-white/10 backdrop-blur-md">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 shadow-lg border border-white/20 transform rotate-1">
                            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/40">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-rose-500">NEW EXPENSE</div>
                                <div className="text-xs font-bold truncate">Priya: WiFi Bill</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 opacity-50 transform -rotate-1 translate-y-2">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-bold">SETTLEMENT</div>
                                <div className="text-xs font-medium">Amit settled bill</div>
                            </div>
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
        color: "from-cyan-500 to-blue-600",
        lightColor: "bg-cyan-500/10",
        iconColor: "text-cyan-500",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="glass p-6 rounded-[2.5rem] border-2 border-cyan-500/20 shadow-2xl w-full max-w-[250px] animate-float bg-white/10 backdrop-blur-md">
                    <div className="text-sm font-black mb-6 flex items-center justify-between uppercase tracking-widest text-cyan-600">
                        <span>Budget</span>
                        <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded-full">75%</span>
                    </div>
                    <div className="space-y-6">
                        <div className="relative h-4 w-full bg-cyan-500/10 rounded-full overflow-hidden border border-cyan-500/10">
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-cyan-600 w-[75%] rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
                            <div className="absolute inset-0 bg-white/30 skew-x-[-20deg] animate-shine" />
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                            <div>
                                <div className="text-[9px] font-black opacity-40 uppercase">Spent</div>
                                <div className="text-lg font-black text-cyan-500">₹3,750</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-black opacity-40 uppercase">Goal</div>
                                <div className="text-lg font-black opacity-20">₹5,000</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
];

export const HowItWorksCarousel = () => {
    const [api, setApi] = useState<CarouselApi>();
    const [isVisible, setIsVisible] = useState(false);
    const TWEEN_FACTOR = 0.8;

    const onScroll = useCallback((api: CarouselApi) => {
        if (!api) return;
        const engine = api.internalEngine();
        const scrollProgress = api.scrollProgress();
        const slidesInView = api.slidesInView();

        api.scrollSnapList().forEach((scrollSnap, index) => {
            let diffToTarget = scrollSnap - scrollProgress;
            const slides = api.slideNodes();

            if (engine.options.loop) {
                engine.slideLooper.loopPoints.forEach((loopPoint) => {
                    const target = loopPoint.target();
                    if (index === loopPoint.index && target !== 0) {
                        const sign = Math.sign(target);
                        if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
                        if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
                    }
                });
            }

            const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR);
            const scale = Math.max(0.85, Math.min(1.1, tweenValue * 1.05));
            const opacity = Math.max(0.4, Math.min(1, tweenValue * 1.2));
            const rotate = diffToTarget * 15;
            const translateY = Math.abs(diffToTarget * 40);

            const slide = slides[index];
            slide.style.setProperty("--slide-scale", `${scale}`);
            slide.style.setProperty("--slide-opacity", `${opacity}`);
            slide.style.setProperty("--slide-rotate", `${rotate}deg`);
            slide.style.setProperty("--slide-translate-y", `${translateY}px`);
        });
    }, []);

    useEffect(() => {
        if (!api) return;
        api.on("scroll", () => onScroll(api));
        api.on("reInit", () => onScroll(api));
        onScroll(api);

        // Initial POP animation
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.2 });

        const element = document.getElementById("how-it-works-3d");
        if (element) observer.observe(element);

        // Autoplay
        const timer = setInterval(() => {
            api.scrollNext();
        }, 4500);

        return () => {
            clearInterval(timer);
            observer.disconnect();
        };
    }, [api, onScroll]);

    return (
        <div className="w-full relative py-20 overflow-hidden" id="how-it-works-3d">
            <div className="container relative z-10 px-4 mb-12">
                <h2 className="text-4xl md:text-6xl font-black text-center mb-6 tracking-tighter">
                    Seamless <span className="text-primary italic">Experience.</span>
                </h2>
                <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                    Swipe through the 6 simple steps to master your hostel expenses.
                </p>
            </div>

            <div className={cn(
                "transition-all duration-1000 ease-out perspective-2000",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20 scale-95"
            )}>
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "center",
                        loop: true,
                        dragFree: false,
                    }}
                    className="w-full relative group"
                >
                    <CarouselContent className="-ml-4 py-20">
                        {slides.map((slide, index) => (
                            <CarouselItem
                                key={index}
                                className="pl-4 basis-full md:basis-[45%] lg:basis-[35%] flex justify-center items-center"
                                style={{
                                    perspective: "1000px",
                                }}
                            >
                                <div
                                    className="w-full max-w-[350px] aspect-[4/5] relative group transition-all duration-300 ease-out"
                                    style={{
                                        transform: `
                      scale(var(--slide-scale, 0.9))
                      rotateY(var(--slide-rotate, 0deg))
                      translateY(var(--slide-translate-y, 0px))
                    `,
                                        opacity: "var(--slide-opacity, 0.5)",
                                    }}
                                >
                                    {/* Shadow Layer */}
                                    <div className={cn(
                                        "absolute -inset-4 rounded-[3rem] blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-40",
                                        slide.color.split(' ')[0].replace('from-', 'bg-')
                                    )} />

                                    <Card className="h-full w-full rounded-[2.5rem] border-none bg-gradient-to-br from-card to-muted/40 overflow-hidden shadow-2xl relative">
                                        {/* Top Gradient Bar */}
                                        <div className={cn("h-2 w-full bg-gradient-to-r", slide.color)} />

                                        <CardContent className="p-0 flex flex-col h-full">
                                            {/* Visual Header */}
                                            <div className={cn("h-[60%] w-full relative overflow-hidden flex items-center justify-center p-8", slide.lightColor)}>
                                                <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(white,transparent_85%)]" />
                                                {slide.visual}
                                            </div>

                                            {/* Content Footer */}
                                            <div className="flex-1 p-8 flex flex-col justify-between bg-card/80 backdrop-blur-sm border-t border-border/50">
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <Badge variant="outline" className="font-black border-2 px-3 py-1 text-xs uppercase tracking-tighter shadow-sm">
                                                            Step {slide.step}
                                                        </Badge>
                                                        <div className={cn("p-2 rounded-xl bg-background border border-border/50 shadow-inner rotate-3", slide.iconColor)}>
                                                            <slide.icon className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                    <h3 className="text-2xl font-black mb-2 tracking-tight">
                                                        {slide.title}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm font-medium leading-tight">
                                                        {slide.description}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 opacity-40">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Explore details</span>
                                                    <ArrowRight className="w-3 h-3 text-primary" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Nav Buttons - FLOATING OVER SIDES */}
                    <CarouselPrevious className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-14 md:w-14 border-2 bg-background/40 hover:bg-primary/80 hover:text-white transition-all shadow-xl backdrop-blur-md opacity-40 hover:opacity-100" />
                    <CarouselNext className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 h-10 w-10 md:h-14 md:w-14 border-2 bg-background/40 hover:bg-primary/80 hover:text-white transition-all shadow-xl backdrop-blur-md opacity-40 hover:opacity-100" />

                    {/* Swipe text for mobile */}
                    <div className="flex md:hidden justify-center items-center gap-2 mt-[-10px] pb-10 opacity-50 font-black text-[10px] uppercase tracking-widest animate-pulse">
                        <ArrowRight className="w-3 h-3 rotate-180" />
                        <span>Swipe for Next Step</span>
                        <ArrowRight className="w-3 h-3" />
                    </div>
                </Carousel>
            </div>

            <style>{`
        .perspective-2000 {
            perspective: 2000px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50% { transform: translateY(-15px) rotate(-1deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(-5px) rotate(-1deg); }
          50% { transform: translateY(10px) rotate(1deg); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
        }
        .glass {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }
        .dark .glass {
          background: rgba(0, 0, 0, 0.2);
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
        .animate-shine {
          animation: shine 3s infinite linear;
        }
      `}</style>
        </div>
    );
};
