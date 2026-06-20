"use client";

import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/app-modal";
import { AlertCircle, Clock, Calendar, CheckCircle2, Plus, Bell, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-provider";
import { getFollowUps, addFollowUp, toggleFollowUp, deleteFollowUp } from "@/app/actions";

type FollowUp = {
  id: string; company: string; contact: string; type: string;
  date: string; time: string; status: string;
  logo: string; logoColor: string; priority: string;
  completed: boolean;
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; bg: string; border: string; text: string; dot: string }> = {
  today:    { label: "Today",    icon: Clock,        bg: "bg-amber-500/10",   border: "border-amber-500/20",  text: "text-amber-600 dark:text-amber-400",  dot: "bg-amber-500" },
  missed:   { label: "Missed",   icon: AlertCircle,  bg: "bg-red-500/10",     border: "border-red-500/20",    text: "text-red-600 dark:text-red-400",     dot: "bg-red-500" },
  upcoming: { label: "Upcoming", icon: Calendar,     bg: "bg-blue-500/10",    border: "border-blue-500/20",   text: "text-blue-600 dark:text-blue-400",   dot: "bg-blue-500" },
};

const PRIORITY_BADGE: Record<string, string> = {
  high:   "bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low:    "bg-slate-500/10 text-slate-500",
};

const ADD_FOLLOWUP_FIELDS = [
  { id: "company",   label: "Company",         placeholder: "e.g. Google",          required: true,  half: true },
  { id: "contact",   label: "Contact Person",  placeholder: "e.g. Sarah Chen",      required: true,  half: true },
  { id: "type",      label: "Follow-Up Type",  placeholder: "e.g. Follow-up email after interview", required: true, half: false },
  { id: "date",      label: "Date",            type: "date" as const,               required: true,  half: true },
  { id: "time",      label: "Time",            placeholder: "e.g. 2:00 PM",         required: true,  half: true },
  { id: "priority",  label: "Priority",        type: "select" as const,             placeholder: "Select Priority", half: false,
    options: [
      { value: "high",   label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low",    label: "Low" },
    ],
  },
];

export default function FollowUpsPage() {
  const { user } = useAuth();
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchFollowups = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getFollowUps(user.id);
      setFollowups(data as FollowUp[]);
    } catch (err) {
      console.error("Error fetching followups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [user]);

  const handleAddFollowup = async (data: Record<string, string>) => {
    if (!user) return;

    // Determine status (missed, today, upcoming) based on date
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    let status = "upcoming";
    if (selectedDate.getTime() === today.getTime()) {
      status = "today";
    } else if (selectedDate.getTime() < today.getTime()) {
      status = "missed";
    }

    // Format date string nicely for display
    const formattedDate = selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const logoColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-indigo-600"];
    const logoColor = logoColors[Math.floor(Math.random() * logoColors.length)];
    const logo = data.company ? data.company[0].toUpperCase() : "C";

    try {
      await addFollowUp(user.id, {
        company: data.company,
        contact: data.contact,
        type: data.type,
        date: formattedDate,
        time: data.time,
        status,
        logo,
        logoColor,
        priority: data.priority || "medium",
      });
      setModalOpen(false);
      fetchFollowups();
    } catch (err) {
      console.error("Error adding followup:", err);
    }
  };

  const handleToggle = async (id: string, currentCompleted: boolean) => {
    if (!user) return;
    try {
      await toggleFollowUp(user.id, id, !currentCompleted);
      setFollowups(prev => prev.map(f => f.id === id ? { ...f, completed: !currentCompleted } : f));
    } catch (err) {
      console.error("Error toggling followup completed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteFollowUp(user.id, id);
      setFollowups(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error("Error deleting followup:", err);
    }
  };

  const groups = ["today", "missed", "upcoming"] as const;

  // Active items
  const activeFollowups = followups.filter(f => !f.completed);

  return (
    <AppLayout title="Follow-Ups" subtitle="Stay on top of every touchpoint in your job search">
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Follow-Up"
        fields={ADD_FOLLOWUP_FIELDS}
        submitLabel="Schedule"
        onSubmit={handleAddFollowup}
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Today",    count: activeFollowups.filter((f) => f.status === "today").length,    icon: Clock,       color: "text-amber-500",  bg: "bg-amber-500/10" },
          { label: "Missed",   count: activeFollowups.filter((f) => f.status === "missed").length,   icon: AlertCircle, color: "text-red-500",    bg: "bg-red-500/10" },
          { label: "Upcoming", count: activeFollowups.filter((f) => f.status === "upcoming").length, icon: Calendar,    color: "text-blue-500",   bg: "bg-blue-500/10" },
        ].map((s) => (
          <div key={s.label} className={cn("bg-card border border-border/60 rounded-2xl p-4 shadow-card flex items-center gap-3")}>
            <div className={cn("p-2.5 rounded-xl", s.bg)}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label} follow-ups</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="flex justify-end mb-4">
        <Button
          id="add-followup-btn"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="h-9 gap-2 gradient-brand text-white border-none rounded-xl text-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Schedule Follow-Up
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        /* Grouped sections */
        <div className="space-y-6">
          {groups.map((group) => {
            const items = followups.filter((f) => f.status === group);
            const cfg = STATUS_CONFIG[group] || STATUS_CONFIG.upcoming;
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <h2 className="text-sm font-semibold text-foreground capitalize">{cfg.label}</h2>
                  <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0", cfg.bg, cfg.text)}>{items.length}</Badge>
                </div>
                <div className="space-y-2.5">
                  {items.map((fu) => {
                    const isDone = fu.completed;
                    return (
                      <div
                        key={fu.id}
                        id={fu.id}
                        className={cn(
                          "bg-card border rounded-2xl p-4 shadow-card flex items-center gap-4 transition-all duration-200",
                          isDone ? "opacity-50 scale-[0.99]" : "hover:shadow-elevated hover:-translate-y-0.5",
                          cfg.border
                        )}
                      >
                        {/* Logo */}
                        <div className={`w-10 h-10 rounded-xl ${fu.logoColor} flex items-center justify-center text-white font-bold shrink-0`}>
                          {fu.logo}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">{fu.company}</p>
                            <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 capitalize", PRIORITY_BADGE[fu.priority] || "bg-slate-500/10")}>
                              {fu.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{fu.contact}</p>
                          <p className="text-xs text-foreground mt-0.5">{fu.type}</p>
                        </div>
                        {/* Time */}
                        <div className="text-right shrink-0 space-y-1">
                          <div className={cn("flex items-center gap-1 text-xs font-medium", cfg.text)}>
                            <Bell className="w-3 h-3" />
                            {fu.date}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{fu.time}</p>
                        </div>
                        {/* Action */}
                        <div className="flex items-center gap-1">
                          <button
                            id={`done-${fu.id}`}
                            onClick={() => handleToggle(fu.id, fu.completed)}
                            className={cn("p-2 rounded-xl transition-all", isDone ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:bg-muted")}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-${fu.id}`}
                            onClick={() => handleDelete(fu.id)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {followups.length === 0 && (
            <div className="text-center py-20 bg-card border border-dashed border-border/60 rounded-3xl">
              <Clock className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No follow-ups scheduled</p>
              <p className="text-xs text-muted-foreground mt-1">Schedule a follow-up after an interview or application submission.</p>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
