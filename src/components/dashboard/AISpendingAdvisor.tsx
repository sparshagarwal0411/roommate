import { useState, useRef, useEffect } from "react";
import { Sparkles, Brain, MessageSquare, X, Send, Loader2, Bot, User, Minimize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hostel, Expense, Member } from "@/hooks/useHostel";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AISpendingAdvisorProps {
    hostel: Hostel;
    expenses: Expense[];
    members: Member[];
    currentMemberId?: string;
    totalSpent: number;
}

interface Message {
    role: "user" | "bot";
    content: string;
}

export const AISpendingAdvisor = ({
    hostel,
    expenses,
    members,
    currentMemberId,
    totalSpent
}: AISpendingAdvisorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const budget = hostel.monthly_budget || 0;
    const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

    const me = members.find(m => m.id === currentMemberId);
    const mySpending = expenses
        .filter(e => e.paid_by_member_id === currentMemberId)
        .reduce((sum, e) => sum + Number(e.amount), 0);

    const categoryTotals = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
        return acc;
    }, {} as Record<string, number>);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            toast.error("Gemini API key is missing in .env! 🔑");
            return;
        }

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const categoryInfo = Object.entries(categoryTotals)
                .map(([cat, amt]) => `${cat}: ₹${amt}`)
                .join(", ");

            const contextPrompt = `
        You are "Roomie AI", a smart hostel budget advisor. 
        Hostel: ${hostel.name}
        Budget: ₹${budget}
        Spent: ₹${totalSpent} (${percentage.toFixed(1)}%)
        Categories: ${categoryInfo}
        User: ${me?.name || 'Roommate'} (Paid: ₹${mySpending})
        
        Logic:
        - < 30% spend: "Healthy Hand" 🟢
        - > 75% spend: "High Control" 🔴
        - Be friendly, use emojis, and keep responses under 3 sentences.
      `;

            // Simplified chat logic for better reliability
            const history = messages.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n");
            const fullPrompt = `${contextPrompt}\n\nChat History:\n${history}\nUser: ${userMessage}\nAssistant:`;

            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: "bot", content: text }]);
        } catch (error) {
            console.error("Gemini Error:", error);
            toast.error("AI is sleepy right now. Try again later! 😴");
        } finally {
            setLoading(false);
        }
    };

    const startInitialChat = () => {
        if (messages.length === 0) {
            let status = "Healthy Hand 🟢";
            if (percentage > 75) status = "High Control! 🔴";
            else if (percentage > 50) status = "Watch Out! 🟡";

            setMessages([
                {
                    role: "bot",
                    content: `Hey ${me?.name || 'there'}! I'm Roomie AI. Your hostel is currently at ${percentage.toFixed(1)}% spending (${status}). How can I help you save today? 💸`
                }
            ]);
        }
        setIsOpen(true);
    };

    return (
        <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start translate-z-0">
            {/* Chat Window */}
            {isOpen && (
                <Card className="mb-4 w-[320px] sm:w-[380px] h-[500px] shadow-2xl border border-primary/20 overflow-hidden flex flex-col bg-background/95 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300">
                    <CardHeader className="p-4 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Brain className="h-5 w-5 animate-pulse" />
                            Roomie AI Advisor
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <Minimize2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden relative">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm flex gap-2 ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'bg-muted text-foreground rounded-tl-none border border-border/50'
                                            }`}>
                                            {msg.role === 'bot' && <Bot className="h-4 w-4 mt-0.5 shrink-0 text-primary" />}
                                            <span className="leading-relaxed">{msg.content}</span>
                                            {msg.role === 'user' && <User className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted p-3 rounded-2xl rounded-tl-none flex items-center gap-2 border border-border/50 shadow-sm">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span className="text-xs text-muted-foreground animate-pulse">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-muted/30">
                        <div className="flex w-full items-center gap-2">
                            <Input
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="bg-background border-border/50 focus-visible:ring-primary rounded-xl px-4 text-xs h-10"
                            />
                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="rounded-xl bg-primary hover:bg-primary/90 shrink-0 h-10 w-10 shadow-glow shadow-primary/20"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <Button
                    onClick={startInitialChat}
                    className="h-14 px-6 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-glow shadow-primary/30 hover:shadow-glow hover:shadow-primary/50 hover:scale-105 transition-all duration-300 group overflow-hidden border-2 border-white/20 uppercase tracking-tight"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <MessageSquare className="h-6 w-6 mr-2 group-hover:rotate-12 transition-transform" />
                    <div className="text-left">
                        <p className="text-[10px] font-bold opacity-80 leading-none">AI Advisor</p>
                        <p className="text-sm font-black">Roomie</p>
                    </div>
                    <Sparkles className="ml-2 h-4 w-4 text-yellow-300 animate-bounce" />
                </Button>
            )}
        </div>
    );
};
