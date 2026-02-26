import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PenLine, Trash2, Plus, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useJournalEntries,
  useCreateJournalEntry,
  useDeleteJournalEntry,
} from "../hooks/useBackend";
import { type JournalEntry } from "../backend.d";

function formatDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function JournalCard({
  entry,
  onDelete,
  onView,
}: {
  entry: JournalEntry;
  onDelete: () => void;
  onView: () => void;
}) {
  const excerpt =
    entry.content.length > 120
      ? entry.content.slice(0, 120) + "…"
      : entry.content;

  return (
    <Card className="card-glass border-border/60 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up group cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onView}
            className="flex-1 min-w-0 text-left"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <PenLine size={13} className="text-primary shrink-0" />
              <h4 className="font-display text-base text-foreground truncate group-hover:text-primary transition-colors">
                {entry.title}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {excerpt}
            </p>
            <div className="flex items-center gap-1.5 mt-2.5">
              <span className="text-xs text-muted-foreground/70 font-body">
                {formatDate(entry.timestamp)}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground/70 font-body">
                {formatTime(entry.timestamp)}
              </span>
            </div>
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <Trash2 size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-border/60">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display text-xl font-normal">
                  Delete journal entry?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-body text-muted-foreground">
                  This will permanently delete &quot;{entry.title}&quot;. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl font-body">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="rounded-xl font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Journal() {
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: entries, isLoading } = useJournalEntries();
  const { mutateAsync: createEntry, isPending: isCreating } =
    useCreateJournalEntry();
  const { mutateAsync: deleteEntry } = useDeleteJournalEntry();

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and content.");
      return;
    }
    try {
      await createEntry({ title: title.trim(), content: content.trim() });
      toast.success("Journal entry saved!");
      setIsNewEntryOpen(false);
      setTitle("");
      setContent("");
    } catch {
      toast.error("Failed to save entry. Please try again.");
    }
  };

  const handleDelete = async (ts: bigint) => {
    try {
      await deleteEntry(ts);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Failed to delete entry.");
    }
  };

  const sortedEntries = entries
    ? [...entries].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="font-display text-3xl text-foreground">Journal</h2>
          <p className="text-muted-foreground font-body mt-1 text-sm">
            Your private space to reflect and explore your thoughts.
          </p>
        </div>
        <Button
          onClick={() => setIsNewEntryOpen(true)}
          className="shrink-0 rounded-xl font-body font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Entry</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Entries List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : sortedEntries.length === 0 ? (
        <div className="animate-slide-up flex flex-col items-center justify-center py-16 text-muted-foreground gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
            <BookOpen size={28} className="opacity-40" />
          </div>
          <div className="text-center">
            <p className="font-body font-medium text-foreground/60">
              No journal entries yet
            </p>
            <p className="text-sm font-body mt-1">
              Start writing — your thoughts deserve a space.
            </p>
          </div>
          <Button
            onClick={() => setIsNewEntryOpen(true)}
            variant="outline"
            className="rounded-xl font-body border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground gap-2"
          >
            <PenLine size={15} />
            Write your first entry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEntries.map((entry, i) => (
            <div
              key={String(entry.timestamp)}
              className={cn("animate-slide-up", `stagger-${Math.min(i + 1, 5)}`)}
            >
              <JournalCard
                entry={entry}
                onDelete={() => void handleDelete(entry.timestamp)}
                onView={() => setViewEntry(entry)}
              />
            </div>
          ))}
        </div>
      )}

      {/* New Entry Dialog */}
      <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
        <DialogContent className="max-w-lg rounded-2xl border-border/60 mx-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal">
              New Journal Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <Input
                placeholder="Entry title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-body rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <Textarea
              placeholder="What's on your mind today? Write freely…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="font-body resize-none rounded-xl border-border/60 focus:border-primary/50 focus:ring-primary/20 text-sm leading-relaxed"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsNewEntryOpen(false);
                setTitle("");
                setContent("");
              }}
              className="rounded-xl font-body"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !title.trim() || !content.trim()}
              className="rounded-xl font-body bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
        <DialogContent className="max-w-lg rounded-2xl border-border/60 mx-4 max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-normal">
              {viewEntry?.title}
            </DialogTitle>
            {viewEntry && (
              <p className="text-xs text-muted-foreground font-body">
                {formatDate(viewEntry.timestamp)} · {formatTime(viewEntry.timestamp)}
              </p>
            )}
          </DialogHeader>
          <div className="overflow-y-auto flex-1 py-2">
            <p className="text-sm font-body text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {viewEntry?.content}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewEntry(null)}
              className="rounded-xl font-body"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
