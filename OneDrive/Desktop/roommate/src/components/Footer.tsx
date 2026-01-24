import { Building2, Heart, ArrowRight } from "lucide-react";
import { Twitter, Github, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const Footer = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const handleScroll = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate("/");
            setTimeout(() => {
                const target = document.getElementById(sectionId);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const handleEmailSubmit = () => {
        if (email.trim()) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 4000);
        }
    };
    return (
        <footer className="border-t bg-muted/30 pt-8 md:pt-16 pb-6 md:pb-8 mt-auto">
            <div className="container px-4 md:px-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                                <Building2 className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg md:text-xl">RoomMate</span>
                        </div>
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                            Making hostel life easier, one split bill at a time.
                            Join the revolution of financial harmony.
                        </p>
                        <div className="flex gap-4 pt-2">
                        {[
                            { name: "twitter", icon: Twitter, href: "https://x.com/finivesta" },
                            { name: "github", icon: Github, href: "https://github.com/sparshagarwal0411/roommate" },
                            { name: "linkedin", icon: Linkedin, href: "https://in.linkedin.com/company/finivesta-igdtuw" },
                            { name: "instagram", icon: Instagram, href: "https://www.instagram.com/finivesta_igdtuw/?hl=en" },
                        ].map((social) => (
                            <a
                            key={social.name}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-background border flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
                            >
                            <span className="sr-only">{social.name}</span>
                            <social.icon className="w-4 h-4" />
                            </a>
                        ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm md:text-base mb-4">Product</h3>
                        <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                            <li onClick={() => handleScroll('features-section')} className="hover:text-primary cursor-pointer transition-colors">Features</li>
                            <li onClick={() => handleScroll('how-it-works-section')} className="hover:text-primary cursor-pointer transition-colors">Demo</li>
                            <li onClick={() => handleScroll('use-cases-section')} className="hover:text-primary cursor-pointer transition-colors">Release Notes</li>
                            <li onClick={() => handleScroll('testimonials-section')} className="hover:text-primary cursor-pointer transition-colors">Community Forum</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm md:text-base mb-4">Company</h3>
                        <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                            <li onClick={() => navigate("/")} className="hover:text-primary cursor-pointer transition-colors">About Us</li>
                            <li onClick={() => navigate("/")} className="hover:text-primary cursor-pointer transition-colors">Careers</li>
                            <li onClick={() => navigate("/")} className="hover:text-primary cursor-pointer transition-colors">Blog</li>
                            <li onClick={() => navigate("/")} className="hover:text-primary cursor-pointer transition-colors">Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm md:text-base mb-4">Stay Updated</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-4">
                            Get the latest tips on hostel living and finance.
                        </p>
                        {subscribed ? (
                            <div className="text-xs md:text-sm text-green-600 dark:text-green-400 font-medium">
                                We'll get back to you via provided email soon
                            </div>
                        ) : (
                            <div className="flex gap-2 flex-col sm:flex-row">
                                <Input 
                                    placeholder="Enter your email" 
                                    className="h-9 bg-background text-xs md:text-sm" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit()}
                                />
                                <Button 
                                    size="sm" 
                                    className="h-9 px-3 w-full sm:w-auto"
                                    onClick={handleEmailSubmit}
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 md:pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground text-center sm:text-left">
                    <p>© 2026 RoomMate-Broken Table. All rights reserved.</p>
                    <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6">
                        <span onClick={() => navigate("/")} className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
                        <span onClick={() => navigate("/")} className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                            Made with<Heart className="h-3 w-3 text-destructive fill-destructive animate-pulse" /> for Hostellers.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
