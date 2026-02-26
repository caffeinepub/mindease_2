import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Send, Trash2, Loader2, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useChatHistory,
  useAddChatMessage,
  useClearChatHistory,
  Variant_user_assistant,
} from "../hooks/useBackend";
import { type ChatMessage } from "../backend.d";

// ---- AI Response Engine ----
function generateAIResponse(message: string): string {
  const lower = message.toLowerCase();

  if (/stress(ed)?/.test(lower)) {
    return "I hear that you're feeling stressed. Let's try a quick breathing exercise: breathe in for 4 counts, hold for 4, out for 4. Repeat 3 times. 🌿 You've got this.";
  }
  if (/anxi(ous|ety)/.test(lower)) {
    return "Anxiety can feel overwhelming. Grounding yourself can help — name 5 things you can see around you right now. This simple exercise can bring you back to the present moment. 💙";
  }
  if (/sad|depress(ed)?|unhappy/.test(lower)) {
    return "I'm sorry you're feeling that way. It's okay to feel sad sometimes — your feelings are valid. Would you like to try journaling your thoughts? Writing can be a gentle way to process emotions. 💛";
  }
  if (/happy|great|good/.test(lower)) {
    return "That's wonderful! 🌟 Positive emotions are worth celebrating. Keep nurturing what makes you feel good — those moments matter more than you know.";
  }
  if (/sleep|tired|exhausted|fatigue/.test(lower)) {
    return "Sleep is vital for mental health. Try establishing a bedtime routine: no screens 30 min before bed, a calming activity like reading or gentle stretching, and aim for 7–9 hours. 🌙";
  }
  return "Thank you for sharing with me. I'm here to listen. Can you tell me more about how you're feeling? 💚";
}

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ChatBubbleProps {
  message: ChatMessage;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === Variant_user_assistant.user;

  return (
    <div
      className={cn(
        "flex items-end gap-2.5 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-7 h-7 rounded-full shrink-0 flex items-center justify-center mb-0.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[78%] sm:max-w-[72%] px-4 py-3 rounded-2xl text-sm font-body leading-relaxed shadow-xs",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border/60 text-foreground rounded-bl-md"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1.5 text-right leading-none",
            isUser ? "text-primary-foreground/60" : "text-muted-foreground/70"
          )}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  visible: boolean;
}

function TypingIndicator({ visible }: TypingIndicatorProps) {
  if (!visible) return null;
  return (
    <div className="flex items-end gap-2.5 animate-fade-in">
      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-secondary text-secondary-foreground">
        <Bot size={13} />
      </div>
      <div className="bg-card border border-border/60 px-4 py-3 rounded-2xl rounded-bl-md shadow-xs">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: history, isLoading } = useChatHistory();
  const { mutateAsync: addMessage, isPending: isSending } = useAddChatMessage();
  const { mutateAsync: clearHistory, isPending: isClearing } =
    useClearChatHistory();

  // Sort messages by timestamp
  const sortedMessages = history
    ? [...history].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput("");

    try {
      // Save user message
      await addMessage({ role: Variant_user_assistant.user, content: text });

      // Show typing indicator
      setIsTyping(true);

      // Simulate AI thinking delay
      await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 600));

      const aiResponse = generateAIResponse(text);
      setIsTyping(false);

      // Save AI response
      await addMessage({
        role: Variant_user_assistant.assistant,
        content: aiResponse,
      });
    } catch {
      setIsTyping(false);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleClear = async () => {
    try {
      await clearHistory();
      toast.success("Chat history cleared.");
    } catch {
      toast.error("Failed to clear chat history.");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/60 shrink-0 bg-background/80 backdrop-blur-sm">
        <div>
          <h2 className="font-display text-2xl text-foreground">AI Support</h2>
          <p className="text-xs text-muted-foreground font-body">
            Here to listen — always available
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isClearing || sortedMessages.length === 0}
          className="rounded-xl font-body text-xs border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 gap-1.5"
        >
          {isClearing ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Trash2 size={12} />
          )}
          Clear
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="mx-4 mt-3 shrink-0">
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-400">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <p className="text-xs font-body leading-relaxed">
            <strong>Important:</strong> This app does not replace professional
            therapy. If you&apos;re in crisis, please{" "}
            <a
              href="/emergency"
              className="underline underline-offset-2 font-medium"
            >
              seek help immediately
            </a>
            .
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn("flex gap-2.5", i % 2 === 0 && "flex-row-reverse")}
              >
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="h-14 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : sortedMessages.length === 0 && !isTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-breathe">
              <Bot size={28} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="font-body font-medium text-foreground/60">
                Your wellness companion
              </p>
              <p className="text-sm font-body mt-1 max-w-xs text-center">
                Share how you're feeling. I'm here to listen and offer support.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "I'm feeling stressed",
                "I've been anxious",
                "I feel sad today",
                "I had a great day",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="text-xs font-body px-3 py-1.5 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {sortedMessages.map((msg) => (
              <ChatBubble key={String(msg.timestamp)} message={msg} />
            ))}
            <TypingIndicator visible={isTyping} />
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 py-3 border-t border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="flex items-end gap-2.5">
          <Textarea
            ref={textareaRef}
            placeholder="Share how you're feeling… (Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="font-body text-sm resize-none rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 min-h-[44px] max-h-32"
          />
          <Button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending || !input.trim() || isTyping}
            className="shrink-0 rounded-xl w-11 h-11 p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 font-body mt-1.5 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
