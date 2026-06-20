"use client";

import { AppLayout } from "@/components/app-layout";
import { AppModal } from "@/components/app-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronRight, Plus, FileText, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-provider";
import { getInterviews, addInterview, updateRoundChecklist } from "@/app/actions";

const ADD_INTERVIEW_FIELDS = [
  { id: "company",   label: "Company",        placeholder: "e.g. Amazon",           required: true,  half: true },
  { id: "role",      label: "Job Title",      placeholder: "e.g. SDE-II",           required: true,  half: true },
  { id: "salary",    label: "Salary Range",   placeholder: "e.g. $175k–$210k",                       half: true },
  { id: "roundName", label: "First Round Name",placeholder: "e.g. Technical Screen",  required: true,  half: true },
  { id: "roundType", label: "Round Type",     placeholder: "e.g. DSA / Live Coding",required: true,  half: true,
    type: "select" as const,
    options: [
      { value: "DSA / LeetCode",   label: "DSA / LeetCode" },
      { value: "System Design",    label: "System Design" },
      { value: "Live Coding",      label: "Live Coding" },
      { value: "Recruiter Call",   label: "Recruiter Call" },
      { value: "Behavioral",       label: "Behavioral / Leadership" },
    ],
  },
  { id: "roundStatus", label: "Round Status", type: "select" as const, placeholder: "Pipeline Stage", half: true,
    options: [
      { value: "upcoming",  label: "Upcoming" },
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
    ],
  },
  { id: "roundDate",   label: "Round Date",   type: "date" as const, required: true },
  { id: "roundNotes",  label: "Round Notes",  type: "textarea" as const, placeholder: "Topics to cover, consistent hashing, leadership principles..." },
];

type Round = {
  id: string; name: string; type: string; date: string;
  status: "completed" | "upcoming" | "scheduled";
  notes?: string; feedback?: string;
  checklist?: { id: string; label: string; done: boolean }[];
};

type Interview = {
  id: string; company: string; role: string; salary: string;
  logo: string; logoColor: string; rounds: Round[];
};



const STATUS_STYLE = {
  completed: { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Completed" },
  upcoming:  { dot: "bg-amber-500",   badge: "bg-amber-500/10  text-amber-600  dark:text-amber-400",  label: "Upcoming" },
  scheduled: { dot: "bg-blue-500",    badge: "bg-blue-500/10   text-blue-600   dark:text-blue-400",   label: "Scheduled" },
};

function RoundCard({ round, userId }: { round: any; userId: string }) {
  const [open, setOpen] = useState(round.status === "upcoming");
  const [checklist, setChecklist] = useState<any[]>(() => {
    if (typeof round.checklist === "string") {
      try {
        return JSON.parse(round.checklist);
      } catch {
        return [];
      }
    }
    return (round.checklist as any[]) ?? [];
  });
  const cfg = STATUS_STYLE[round.status as keyof typeof STATUS_STYLE] || STATUS_STYLE.scheduled;

  const toggleCheck = async (id: string) => {
    const updated = checklist.map((c) => c.id === id ? { ...c, done: !c.done } : c);
    setChecklist(updated);
    try {
      await updateRoundChecklist(userId, round.id, updated);
    } catch (err) {
      console.error("Error updating round checklist:", err);
    }
  };

  return (
    <div id={round.id} className={cn("border rounded-2xl overflow-hidden transition-all duration-200", round.status === "upcoming" ? "border-amber-500/30 shadow-elevated" : "border-border/60 shadow-card")}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${round.status === "upcoming" ? "animate-pulse-ring" : ""}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{round.name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-foreground">{round.type}</span>
            <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 ml-auto", cfg.badge)}>{cfg.label}</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{round.date}</p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/60 pt-4 bg-muted/10">
          {round.notes && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Notes</p>
              <p className="text-xs text-foreground leading-relaxed bg-card border border-border/60 rounded-xl p-3">{round.notes}</p>
            </div>
          )}
          {round.feedback && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5"><Mic className="w-3 h-3" /> Feedback</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">{round.feedback}</p>
            </div>
          )}
          {checklist.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Prep Checklist</p>
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <button key={item.id} id={item.id} onClick={() => toggleCheck(item.id)} className="flex items-center gap-2.5 w-full text-left group">
                    {item.done
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      : <Circle className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                    }
                    <span className={cn("text-xs", item.done ? "line-through text-muted-foreground" : "text-foreground")}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInterviews = async () => {
    if (!user) return;
    try {
      const data = await getInterviews(user.id);
      setInterviews(data);
    } catch (err) {
      console.error("Error fetching interviews:", err);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  const handleAddInterview = async (data: Record<string, string>) => {
    if (!user) return;
    const logoColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-indigo-600"];
    const randColor = logoColors[Math.floor(Math.random() * logoColors.length)];
    const logoLetter = (data.company || "I")[0].toUpperCase();

    // Setup initial prep checklist items based on round type
    const initialChecklist = [
      { id: "c-initial-1", label: `Review ${data.roundType} preparation guide`, done: false },
      { id: "c-initial-2", label: "Prepare questions for interviewer", done: false },
    ];

    try {
      await addInterview(user.id, {
        company: data.company || "Unknown Company",
        role: data.role || "Role",
        salary: data.salary || "—",
        logo: logoLetter,
        logoColor: randColor,
        rounds: [
          {
            name: data.roundName || "Round 1",
            type: data.roundType || "General",
            date: data.roundDate ? new Date(data.roundDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Scheduled",
            status: data.roundStatus || "scheduled",
            notes: data.roundNotes || undefined,
            checklist: initialChecklist,
          }
        ]
      });
      fetchInterviews();
    } catch (err) {
      console.error("Error adding interview:", err);
    }
  };

  return (
    <AppLayout title="Interview Tracker" subtitle="Timeline of all your interviews with notes and prep checklists">
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Scheduled Interview"
        fields={ADD_INTERVIEW_FIELDS}
        submitLabel="Add Interview"
        onSubmit={handleAddInterview}
      />
      <div className="flex justify-end mb-5">
        <Button
          id="add-interview-btn"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="h-9 gap-2 gradient-brand text-white border-none rounded-xl text-xs hover:opacity-90 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Interview
        </Button>
      </div>
      <div className="space-y-8">
        {interviews.map((interview) => (
          <div key={interview.id} id={interview.id}>
            {/* Company header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl ${interview.logoColor} flex items-center justify-center text-white font-bold text-lg shadow-md`}>{interview.logo}</div>
              <div>
                <h2 className="text-base font-bold text-foreground">{interview.company}</h2>
                <p className="text-xs text-muted-foreground">{interview.role} · <span className="text-primary font-semibold">{interview.salary}</span></p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {interview.rounds.filter((r: any) => r.status === "completed").length}/{interview.rounds.length} rounds done
              </div>
            </div>
            {/* Timeline */}
            <div className="relative pl-5">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-border/60" />
              <div className="space-y-3">
                {interview.rounds.map((round: any) => (
                  <div key={round.id} className="relative">
                    <div className={cn("absolute -left-[13px] top-5 w-2.5 h-2.5 rounded-full border-2 border-background", STATUS_STYLE[round.status as keyof typeof STATUS_STYLE].dot)} />
                    <RoundCard round={round} userId={user?.id ?? ""} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
