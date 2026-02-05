import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, Sparkles, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Member, useAddExpense, useAddNotification } from "@/hooks/useHostel";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface EchoVoiceAssistantProps {
    members: Member[];
    hostelId: string;
}

export const EchoVoiceAssistant = ({ members, hostelId }: EchoVoiceAssistantProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [recognition, setRecognition] = useState<any>(null);

    const addExpense = useAddExpense();
    const addNotification = useAddNotification();

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = false;
            recog.interimResults = true;
            recog.lang = "en-IN";

            recog.onstart = () => {
                setIsListening(true);
                setTranscript("");
            };

            recog.onresult = (event: any) => {
                const current = event.resultIndex;
                const resultTranscript = event.results[current][0].transcript;
                setTranscript(resultTranscript);
            };

            recog.onend = () => {
                setIsListening(false);
            };

            recog.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                toast.error("Speech recognition error. Please try again.");
            };

            setRecognition(recog);
        }
    }, []);

    const startListening = () => {
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Start error", e);
            }
        } else {
            toast.error("Speech recognition not supported in this browser.");
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
        }
    };

    const handleProcessVoice = async () => {
        if (!transcript) return;

        setIsProcessing(true);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            toast.error("Gemini API key is missing!");
            setIsProcessing(false);
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `
        You are "Echo", a voice-powered expense assistant for a roommate app. 
        Analyze the following voice transcript and extract expense details.
        
        Transcript: "${transcript}"
        
        Available Categories: "food", "groceries", "utilities", "entertainment", "transport", "shopping", "other"
        Available Members: ${JSON.stringify(members.map(m => ({ id: m.id, name: m.name })))}
        
        Requirements:
        1. Extract the amount (number).
        2. Guess the category from the list.
        3. Create a short description.
        4. Identify who paid. If not mentioned, assume the first member in the list (who is usually the current user).
        5. Identify participants to split with. If not mentioned, return null (meaning split with everyone).
        
        JSON Structure:
        {
          "amount": number,
          "category": string,
          "description": string,
          "paid_by_id": string,
          "participants": string[] | null
        }
        
        Reply ONLY with the JSON.
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const cleanedJson = text.replace(/```json|```/g, "").trim();
            const data = JSON.parse(cleanedJson);

            if (data.amount && data.category && data.paid_by_id) {
                await addExpense.mutateAsync({
                    hostel_id: hostelId,
                    paid_by_member_id: data.paid_by_id,
                    amount: data.amount,
                    category: data.category as any,
                    description: data.description || transcript,
                    split_equally: !data.participants || data.participants.length === 0 || data.participants.length === members.length,
                    participants: data.participants,
                    image_url: null,
                });

                // Send notifications
                const payer = members.find(m => m.id === data.paid_by_id);
                const targets = data.participants || members.map(m => m.id);
                const splitAmount = data.amount / targets.length;

                const notificationsPromises = targets
                    .filter((targetId: string) => targetId !== data.paid_by_id)
                    .map((targetId: string) => {
                        return addNotification.mutateAsync({
                            hostel_id: hostelId,
                            recipient_id: targetId,
                            sender_id: data.paid_by_id,
                            actor_name: payer?.name || "A Roommate",
                            type: 'bill',
                            content: `Echo registered an expense: ${payer?.name || "Someone"} paid ₹${data.amount.toLocaleString()} for ${data.description}... Split: ₹${Math.round(splitAmount).toLocaleString()}`
                        });
                    });

                await Promise.all(notificationsPromises);

                toast.success(`Echo registered: ₹${data.amount} for ${data.category}! 🎉`, {
                    icon: <Sparkles className="h-4 w-4 text-primary" />
                });
                setTranscript("");
                setIsOpen(false);
            } else {
                throw new Error("Missing details in AI response");
            }
        } catch (error) {
            console.error("Echo Error:", error);
            toast.error("Echo couldn't understand that perfectly. Try again or add manually. 🎙️");
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (!isListening && transcript && !isProcessing && isOpen) {
            handleProcessVoice();
        }
    }, [isListening]);

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4 pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="w-72 bg-background/95 backdrop-blur-md border-2 border-primary/20 rounded-2xl shadow-2xl p-4 pointer-events-auto overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Volume2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Echo Assistant</h3>
                                <p className="text-[10px] text-muted-foreground">Voice Powered Expense</p>
                            </div>
                            <Sparkles className="h-3 w-3 text-primary/40 ml-auto animate-pulse" />
                        </div>

                        <div className="flex flex-col items-center justify-center py-4 space-y-4">
                            <div className="relative">
                                {isListening && (
                                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                )}
                                <Button
                                    size="icon"
                                    variant={isListening ? "destructive" : "hero"}
                                    className={cn(
                                        "h-16 w-16 rounded-full shadow-lg transition-all duration-300",
                                        isListening ? "scale-110" : "hover:scale-105"
                                    )}
                                    onClick={isListening ? stopListening : startListening}
                                    disabled={isProcessing}
                                >
                                    {isListening ? (
                                        <MicOff className="h-6 w-6" />
                                    ) : isProcessing ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <Mic className="h-6 w-6" />
                                    )}
                                </Button>
                            </div>

                            <div className="text-center min-h-[40px] w-full">
                                {isListening ? (
                                    <p className="text-xs font-medium animate-pulse text-primary italic">
                                        "{transcript || "Listening..."}"
                                    </p>
                                ) : isProcessing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <p className="text-[10px] text-muted-foreground">Echoing to Gemini...</p>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-muted-foreground italic px-2">
                                        "Spent 500 on dinner" or "Paid 200 for petrol"
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                variant="hero"
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl pointer-events-auto transition-transform active:scale-95",
                    isOpen && "rotate-90 scale-0"
                )}
                onClick={() => setIsOpen(true)}
            >
                <Mic className="h-6 w-6" />
            </Button>
        </div>
    );
};
