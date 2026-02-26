import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, CheckCircle2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Mood, useLogMood, useMoodHistory } from "../hooks/useBackend";
import { type MoodLog } from "../backend.d";

const moods: Array<{
  value: Mood;
  emoji: string;
  label: string;
  description: string;
  colors: string;
  selectedColors: string;
}> = [
  {
    value: Mood.great,
    emoji: "😄",
    label: "Great",
    description: "Feeling amazing",
    colors: "border-green-200 hover:border-green-400 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20",
    selectedColors: "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/30 ring-2 ring-green-400/40",
  },
  {
    value: Mood.good,
    emoji: "😊",
    label: "Good",
    description: "Feeling positive",
    colors: "border-teal-200 hover:border-teal-400 hover:bg-teal-50 dark:border-teal-800 dark:hover:bg-teal-900/20",
    selectedColors: "border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-900/30 ring-2 ring-teal-400/40",
  },
  {
    value: Mood.okay,
    emoji: "😐",
    label: "Okay",
    description: "Feeling neutral",
    colors: "border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20",
    selectedColors: "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30 ring-2 ring-blue-400/40",
  },
  {
    value: Mood.bad,
    emoji: "😔",
    label: "Bad",
    description: "Feeling down",
    colors: "border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20",
    selectedColors: "border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-900/30 ring-2 ring-orange-400/40",
  },
  {
    value: Mood.awful,
    emoji: "😢",
    label: "Awful",
    description: "Feeling terrible",
    colors: "border-red-200 hover:border-red-400 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20",
    selectedColors: "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/30 ring-2 ring-red-400/40",
  },
];

const moodConfig: Record<Mood, { emoji: string; label: string; color: string }> = {
  [Mood.great]: { emoji: "😄", label: "Great", color: "text-green-600 dark:text-green-400" },
  [Mood.good]: { emoji: "😊", label: "Good", color: "text-teal-600 dark:text-teal-400" },
  [Mood.okay]: { emoji: "😐", label: "Okay", color: "text-blue-600 dark:text-blue-400" },
  [Mood.bad]: { emoji: "😔", label: "Bad", color: "text-orange-600 dark:text-orange-400" },
  [Mood.awful]: { emoji: "😢", label: "Awful", color: "text-red-600 dark:text-red-400" },
};

function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MoodHistoryItem({ log }: { log: MoodLog }) {
  const config = moodConfig[log.mood];
  return (
    <div className="flex items-start gap-3.5 py-3.5 border-b border-border/60 last:border-b-0 animate-fade-in">
      <span className="text-2xl leading-none mt-0.5">{config.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("font-semibold text-sm font-body", config.color)}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground font-body">
            {formatDate(log.timestamp)}
          </span>
        </div>
        {log.note && (
          <p className="text-sm text-foreground/70 mt-0.5 font-body leading-relaxed truncate">
            {log.note}
          </p>
        )}
      </div>
    </div>
  );
}

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutateAsync: logMood, isPending } = useLogMood();
  const { data: history, isLoading: historyLoading } = useMoodHistory();

  const handleSubmit = async () => {
    if (!selectedMood) return;
    try {
      await logMood({ mood: selectedMood, note: note.trim() || undefined });
      toast.success("Mood logged successfully!");
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedMood(null);
        setNote("");
      }, 2000);
    } catch {
      toast.error("Failed to log mood. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-7">
      {/* Header */}
      <div className="animate-fade-in">
        <h2 className="font-display text-3xl text-foreground">Mood Tracker</h2>
        <p className="text-muted-foreground font-body mt-1 text-sm">
          How are you feeling right now? Your feelings are valid.
        </p>
      </div>

      {/* Mood Picker */}
      <Card className="animate-slide-up card-glass border-border/60 shadow-card">
        <CardContent className="p-6">
          <h3 className="font-display text-lg text-foreground mb-5">
            Select your mood
          </h3>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-green-600 dark:text-green-400">
              <CheckCircle2 size={44} className="animate-breathe" />
              <p className="font-body text-base font-medium">Mood logged!</p>
              <p className="text-sm text-muted-foreground font-body">
                Thank you for checking in with yourself.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setSelectedMood(m.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2.5 sm:p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer group",
                      selectedMood === m.value ? m.selectedColors : m.colors
                    )}
                  >
                    <span
                      className={cn(
                        "text-3xl sm:text-4xl transition-transform duration-200",
                        selectedMood === m.value
                          ? "scale-110"
                          : "group-hover:scale-105"
                      )}
                    >
                      {m.emoji}
                    </span>
                    <span className="text-xs font-medium font-body text-foreground/70 hidden sm:block">
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="animate-slide-up space-y-4">
                  <p className="text-sm font-body text-muted-foreground text-center">
                    You selected:{" "}
                    <span className="font-semibold text-foreground">
                      {moodConfig[selectedMood].emoji} {moodConfig[selectedMood].label}
                    </span>
                  </p>
                  <Textarea
                    placeholder="Add a note (optional) — what's on your mind?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="font-body resize-none text-sm border-border/60 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full rounded-xl font-body font-medium py-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Logging mood…
                      </>
                    ) : (
                      "Log My Mood"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <section className="animate-slide-up stagger-2">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={17} className="text-primary" />
          <h3 className="font-display text-xl text-foreground">Mood History</h3>
        </div>

        <Card className="card-glass border-border/60 shadow-card">
          <CardContent className="p-5">
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : !history || history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                <span className="text-4xl opacity-40">📊</span>
                <p className="text-sm font-body text-center">
                  No mood entries yet. Start tracking above!
                </p>
              </div>
            ) : (
              <div>
                {[...history]
                  .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
                  .map((log) => (
                    <MoodHistoryItem key={String(log.timestamp)} log={log} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
