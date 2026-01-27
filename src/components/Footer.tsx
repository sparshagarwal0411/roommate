import { Building2, Heart, ArrowRight, X, Shield, FileText } from "lucide-react";
import { Twitter, Github, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export const Footer = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    
    // State for managing the legal popups
    const [legalMode, setLegalMode] = useState<'none' | 'privacy' | 'terms'>('none');
    const [canAgree, setCanAgree] = useState(false);
    
    // Ref for the scrollable container
    const contentRef = useRef<HTMLDivElement>(null);

    // Scroll lock effect
    useEffect(() => {
        if (legalMode !== 'none') {
            document.body.style.overflow = 'hidden';
            // Reset agreement state when opening
            setCanAgree(false);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [legalMode]);

    // Check if content is scrollable on mount/resize to auto-enable if no scroll needed
    useEffect(() => {
        if (legalMode !== 'none' && contentRef.current) {
            const { scrollHeight, clientHeight } = contentRef.current;
            if (scrollHeight <= clientHeight) {
                setCanAgree(true);
            }
        }
    }, [legalMode]);

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

    const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Check if user is near the bottom (within 10px buffer)
        if (scrollHeight - scrollTop - clientHeight < 10) {
            setCanAgree(true);
        }
    };

    const closeModal = () => setLegalMode('none');

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
                        <span 
                            onClick={() => setLegalMode('privacy')} 
                            className="hover:text-foreground cursor-pointer transition-colors"
                        >
                            Privacy Policy
                        </span>
                        <span 
                            onClick={() => setLegalMode('terms')} 
                            className="hover:text-foreground cursor-pointer transition-colors"
                        >
                            Terms of Service
                        </span>
                        <span className="flex items-center gap-1 whitespace-nowrap">
                            Made with<Heart className="h-3 w-3 text-destructive fill-destructive animate-pulse" /> for Hostellers.
                        </span>
                    </div>
                </div>
            </div>

            {/* LEGAL POPUPS OVERLAY */}
            {legalMode !== 'none' && (
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
                        className="w-full max-w-2xl relative rounded-3xl bg-background shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    {legalMode === 'privacy' ? <Shield className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-primary" />}
                                </div>
                                <h2 className="text-xl font-bold">
                                    {legalMode === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                                </h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-full hover:bg-muted">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Scrollable Content */}
                        <div 
                            ref={contentRef}
                            onScroll={handleContentScroll}
                            className="p-6 overflow-y-auto scrollbar-hide space-y-6"
                        >
                            {legalMode === 'privacy' ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-4">Last updated: January 2026</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Welcome to RoomMate. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">1. Information We Collect</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                                            We collect information that you provide directly to us when you register for an account, create or join a hostel, and log expenses. This includes:
                                        </p>
                                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                            <li><strong>Personal Identification:</strong> Name, email address, and profile pictures.</li>
                                            <li><strong>Financial Data:</strong> Transaction history, expense details, and settlement records within the app. Note: We do not store credit card numbers or banking passwords.</li>
                                            <li><strong>Usage Data:</strong> Information about how you navigate the app, features you use, and time spent.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">2. How We Use Your Data</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                                            Your data is used exclusively to provide the core functionality of RoomMate:
                                        </p>
                                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                            <li>To facilitate accurate expense splitting and balance calculation between roommates.</li>
                                            <li>To manage your account and authentication via Supabase.</li>
                                            <li>To send you technical notices, updates, security alerts, and support messages.</li>
                                            <li>To monitor and analyze trends, usage, and activities in connection with our services.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">3. Data Sharing and Disclosure</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information. This does not include trusted third parties who assist us in operating our application (such as Supabase for database hosting), conducting our business, or servicing you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">4. Data Retention</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">5. Data Security</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, accidental loss, destruction, or damage. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">6. Your Data Rights</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Depending on your location, you may have the right to request access to, correction of, or deletion of your personal data. You can usually manage your own data directly within the application settings. If you wish to delete your account entirely, please contact support or use the delete account feature in the settings menu.
                                        </p>
                                    </div>

                                    <div className="pb-4">
                                        <h3 className="font-semibold text-foreground mb-2">7. Contact Us</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            If you have any questions about this Privacy Policy, please contact us at: support@roommate-app.com or via our Github repository.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-4">Last updated: January 2026</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the RoomMate application operated by Finivesta ("us", "we", or "our"). Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service. The Service is intended for use by students and individuals living in shared accommodation to manage shared expenses.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">2. Accounts and Registration</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">3. User Conduct</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                                            You agree not to use the Service to:
                                        </p>
                                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                            <li>Violate any local, state, national, or international law.</li>
                                            <li>Harass, abuse, or harm another person.</li>
                                            <li>Upload or transmit viruses or malicious code.</li>
                                            <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
                                            <li>Enter false expense data to intentionally mislead roommates or commit fraud.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">4. Intellectual Property</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            The Service and its original content, features, and functionality are and will remain the exclusive property of RoomMate and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of RoomMate.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">5. Links To Other Web Sites</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Our Service may contain links to third-party web sites or services that are not owned or controlled by RoomMate. RoomMate has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that RoomMate shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">6. Termination</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-foreground mb-2">7. Limitation of Liability</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            In no event shall RoomMate, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory.
                                        </p>
                                    </div>

                                    <div className="pb-4">
                                        <h3 className="font-semibold text-foreground mb-2">8. Changes</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-6 border-t bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-3 justify-end">
                            <Button 
                                variant="destructive" 
                                className="sm:w-auto w-full"
                                onClick={closeModal}
                            >
                                Decline
                            </Button>
                            
                            <Button 
                                disabled={!canAgree}
                                onClick={closeModal}
                                className="sm:w-auto w-full transition-all duration-300"
                            >
                                {canAgree ? "Agree" : "Scroll to Agree"}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Background Click Close */}
                    <div className="absolute inset-0 -z-10" onClick={closeModal} />
                </div>
            )}
        </footer>
    );
};