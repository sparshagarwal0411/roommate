import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Member, useAddExpense, useAddNotification } from "@/hooks/useHostel";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EchoVoiceAssistantProps {
    members: Member[];
    hostelId: string;
}

export const EchoVoiceAssistant = ({ members, hostelId }: EchoVoiceAssistantProps) => {
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
        if (!isListening && transcript && !isProcessing) {
            handleProcessVoice();
        }
    }, [isListening]);

    return (
        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 h-full">
            <div className="absolute top-0 right-0 p-2">
                <Sparkles className="h-4 w-4 text-primary/40 animate-pulse" />
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    Echo
                </CardTitle>
                <CardDescription className="text-xs">
                    Speak to register expenses instantly
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4 pb-6">
                <div className="relative">
                    {isListening && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    )}
                    <Button
                        size="icon"
                        variant={isListening ? "destructive" : "hero"}
                        className={cn(
                            "h-20 w-20 rounded-full shadow-lg transition-all duration-300",
                            isListening ? "scale-110" : "hover:scale-105"
                        )}
                        onClick={isListening ? stopListening : startListening}
                        disabled={isProcessing}
                    >
                        {isListening ? (
                            <MicOff className="h-8 w-8" />
                        ) : isProcessing ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                            <Mic className="h-8 w-8" />
                        )}
                    </Button>
                </div>

                <div className="text-center min-h-[40px] px-2 w-full">
                    {isListening ? (
                        <p className="text-sm font-medium animate-pulse text-primary italic">
                            Listening: "{transcript || "..."}"
                        </p>
                    ) : isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <p className="text-xs text-muted-foreground">Echoing to Gemini...</p>
                        </div>
                    ) : (
                        <p className="text-[10px] text-muted-foreground italic">
                            "Paid 500 for pizza" or "Spent 200 on petrol"
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
