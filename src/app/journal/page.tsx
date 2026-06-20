"use client";

import { AppLayout } from "@/components/app-layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, Star, TrendingUp, Smile, Frown, Meh, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AppModal } from "@/components/app-modal";
import { useAuth } from "@/lib/auth-provider";
import { getJournalEntries, addJournalEntry, toggleJournalEntryStar, deleteJournalEntry } from "@/app/actions";

type Entry = {
  id: string; date: string; title: string; preview: string; mood: string;
  tags: string[]; starred: boolean; createdAt: Date;
};

const MOOD_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  great: { icon: Smile,  label: "Great",  color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  okay:  { icon: Meh,    label: "Okay",   color: "text-amber-500",   bg: "bg-amber-500/10 border-amber-500/20" },
  tough: { icon: Frown,  label: "Tough",  color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20" },
};

const ADD_JOURNAL_FIELDS = [
  { id: "title",   label: "Title",           placeholder: "e.g. Amazon Round 2 Prep — System Design Deep Dive", required: true,  half: false },
  { id: "preview", label: "Entry Content",   placeholder: "Write your entry here...", required: true, half: false },
  { id: "mood",    label: "Mood",            type: "select" as const, placeholder: "How was your day?", required: true, half: true,
    options: [
      { value: "great", label: "Great" },
      { value: "okay",  label: "Okay" },
      { value: "tough", label: "Tough" },
    ]
  },
  { id: "tags",    label: "Tags (comma-separated)", placeholder: "e.g. interview-prep, amazon", half: true },
];

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchEntries = async (shouldSelectFirst = false) => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getJournalEntries(user.id);
      const formatted = data.map(e => ({
        ...e,
        tags: e.tags || [],
      })) as Entry[];
      setEntries(formatted);
      if (formatted.length > 0) {
        if (shouldSelectFirst || !selected) {
          setSelected(formatted[0]);
        } else {
          const stillExists = formatted.find(e => e.id === selected.id);
          setSelected(stillExists || formatted[0]);
        }
      } else {
        setSelected(null);
      }
    } catch (err) {
      console.error("Error fetching journal entries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(true);
  }, [user]);

  const handleAddEntry = async (data: Record<string, string>) => {
    if (!user) return;

    const tagsArray = data.tags ? data.tags.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t) : [];
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    try {
      await addJournalEntry(user.id, {
        date: dateStr,
        title: data.title,
        preview: data.preview,
        mood: data.mood || "great",
        tags: tagsArray,
        starred: false,
      });
      setModalOpen(false);
      fetchEntries(true);
    } catch (err) {
      console.error("Error adding journal entry:", err);
    }
  };

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    if (!user) return;
    try {
      await toggleJournalEntryStar(user.id, id, !currentStarred);
      setEntries(prev => prev.map(e => e.id === id ? { ...e, starred: !currentStarred } : e));
      if (selected && selected.id === id) {
        setSelected(prev => prev ? { ...prev, starred: !currentStarred } : null);
      }
    } catch (err) {
      console.error("Error toggling star:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteJournalEntry(user.id, id);
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      if (selected && selected.id === id) {
        setSelected(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error("Error deleting journal entry:", err);
    }
  };

  const filtered = entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.preview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Career Journal" subtitle="Document your job search journey, reflections and wins">
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Journal Entry"
        fields={ADD_JOURNAL_FIELDS}
        submitLabel="Create Entry"
        onSubmit={handleAddEntry}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[calc(100vh-180px)]">
          {/* Entry List */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            {/* Search + New */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="journal-search"
                  placeholder="Search entries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 rounded-xl bg-muted border-transparent text-sm"
                />
              </div>
              <Button
                id="new-entry-btn"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="h-9 w-9 p-0 gradient-brand text-white border-none rounded-xl shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Entry list scrollable */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filtered.map((entry) => {
                const mood = MOOD_CONFIG[entry.mood] || MOOD_CONFIG.great;
                const MoodIcon = mood.icon;
                const isSelected = selected && selected.id === entry.id;
                return (
                  <div
                    key={entry.id}
                    id={entry.id}
                    onClick={() => setSelected(entry)}
                    className={cn(
                      "bg-card border rounded-2xl p-3.5 cursor-pointer transition-all duration-150 hover:shadow-card group",
                      isSelected
                        ? "border-primary/40 shadow-card ring-1 ring-primary/20"
                        : "border-border/60 hover:border-border"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-xs font-semibold text-foreground leading-tight line-clamp-1 flex-1">{entry.title}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {entry.starred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        <MoodIcon className={cn("w-3.5 h-3.5", mood.color)} />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mb-2">{entry.preview}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {entry.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1.5 border-0 bg-primary/10 text-primary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-10 bg-card border border-dashed border-border/60 rounded-2xl">
                  <BookOpen className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No journal entries found</p>
                </div>
              )}
            </div>
          </div>

          {/* Entry Detail */}
          <div className="lg:col-span-2 bg-card border border-border/60 rounded-2xl shadow-card flex flex-col overflow-hidden">
            {selected ? (
              <>
                {/* Header */}
                <div className="p-5 border-b border-border/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={cn("flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg border", (MOOD_CONFIG[selected.mood] || MOOD_CONFIG.great).bg, (MOOD_CONFIG[selected.mood] || MOOD_CONFIG.great).color)}>
                          {(() => { const I = (MOOD_CONFIG[selected.mood] || MOOD_CONFIG.great).icon; return <I className="w-3 h-3" />; })()}
                          {(MOOD_CONFIG[selected.mood] || MOOD_CONFIG.great).label} day
                        </span>
                        <span className="text-xs text-muted-foreground">{selected.date}</span>
                        <button
                          onClick={() => handleToggleStar(selected.id, selected.starred)}
                          className="p-1 hover:bg-muted rounded-lg transition-colors ml-1"
                          title={selected.starred ? "Unstar" : "Star"}
                        >
                          <Star className={cn("w-3.5 h-3.5", selected.starred ? "text-amber-500 fill-amber-500" : "text-muted-foreground")} />
                        </button>
                      </div>
                      <h2 className="text-lg font-bold text-foreground leading-tight">{selected.title}</h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selected.id)}
                      className="h-8 rounded-xl text-xs shrink-0 text-red-500 hover:bg-red-500/10 border-red-500/20"
                    >
                      Delete
                    </Button>
                  </div>
                  {selected.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selected.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-2 border-0 bg-primary/10 text-primary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 overflow-y-auto whitespace-pre-line">
                  <p className="text-sm text-foreground leading-relaxed">{selected.preview}</p>
                  
                  {/* Smart Insight based on mood */}
                  <div className="mt-6 p-4 bg-muted/40 rounded-2xl border border-border/60">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">AI Insight</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selected.mood === "great" && "Fantastic progress! Celebrate these small wins—they build momentum. Write down what exactly worked well so you can replicate it in future rounds."}
                      {selected.mood === "okay" && "A steady day. Focus on identifying one key takeaway from today's tasks or assessments. Consistent, incremental improvements lead to big results."}
                      {selected.mood === "tough" && "Job hunting is a marathon, and setbacks are a normal part of the process. Take a short break, reflect on the learnings, and remember that every 'no' gets you closer to the right 'yes'."}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
                <BookOpen className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select an entry to read it, or create a new one!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
