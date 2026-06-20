"use client";

import { AppLayout } from "@/components/app-layout";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/app-modal";
import { Bell, Plus, Clock, CheckCircle2, Trash2, AlertCircle, Calendar, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { getReminders, addReminder, toggleReminder, deleteReminder } from "@/app/actions";

type Reminder = {
  id: string; title: string; desc: string; time: string; date: string;
  type: "followup" | "interview" | "deadline" | "task";
  priority: "high" | "medium" | "low"; done: boolean;
};

const TYPE_CONFIG = {
  followup:  { icon: Bell,          label: "Follow-Up",  color: "text-blue-500",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  interview: { icon: Calendar,      label: "Interview",  color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  deadline:  { icon: AlertCircle,   label: "Deadline",   color: "text-red-500",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  task:      { icon: Zap,           label: "Task",       color: "text-amber-500",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
};

const PRIORITY_BADGE: Record<string, string> = {
  high:   "bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low:    "bg-slate-500/10 text-slate-500",
};

const ADD_REMINDER_FIELDS = [
  { id: "title",    label: "Title",           placeholder: "e.g. Follow up with Sarah Chen", required: true,  half: false },
  { id: "desc",     label: "Description",     placeholder: "e.g. Send post-interview thank you email", required: true, half: false },
  { id: "date",     label: "Date",            type: "date" as const,               required: true,  half: true },
  { id: "time",     label: "Time",            placeholder: "e.g. 2:00 PM",         required: true,  half: true },
  { id: "type",     label: "Reminder Type",   type: "select" as const,             placeholder: "Select Type", half: true,
    options: [
      { value: "followup",  label: "Follow-Up" },
      { value: "interview", label: "Interview" },
      { value: "deadline",  label: "Deadline" },
      { value: "task",      label: "Task" },
    ]
  },
  { id: "priority",  label: "Priority",        type: "select" as const,             placeholder: "Select Priority", half: true,
    options: [
      { value: "high",   label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low",    label: "Low" },
    ],
  },
];

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReminders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getReminders(user.id);
      setReminders(data as Reminder[]);
    } catch (err) {
      console.error("Error fetching reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const handleAddReminder = async (data: Record<string, string>) => {
    if (!user) return;

    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    let dateStr = selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (selectedDate.getTime() === today.getTime()) {
      dateStr = "Today";
    } else if (selectedDate.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      dateStr = "Tomorrow";
    }

    try {
      await addReminder(user.id, {
        title: data.title,
        desc: data.desc,
        time: data.time,
        date: dateStr,
        type: data.type || "task",
        priority: data.priority || "medium",
      });
      setModalOpen(false);
      fetchReminders();
    } catch (err) {
      console.error("Error adding reminder:", err);
    }
  };

  const toggle = async (id: string, currentDone: boolean) => {
    if (!user) return;
    try {
      await toggleReminder(user.id, id, !currentDone);
      setReminders((prev) => prev.map((r) => r.id === id ? { ...r, done: !r.done } : r));
    } catch (err) {
      console.error("Error toggling reminder:", err);
    }
  };

  const remove = async (id: string) => {
    if (!user) return;
    try {
      await deleteReminder(user.id, id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  const pending = reminders.filter((r) => !r.done);
  const completed = reminders.filter((r) => r.done);

  return (
    <AppLayout title="Reminders" subtitle="Smart reminders to keep your job search on track">
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Reminder"
        fields={ADD_REMINDER_FIELDS}
        submitLabel="Add Reminder"
        onSubmit={handleAddReminder}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {(["followup", "interview", "deadline", "task"] as const).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const count = pending.filter((r) => r.type === type).length;
              return (
                <div key={type} id={`rem-stat-${type}`} className="bg-card border border-border/60 rounded-2xl p-4 shadow-card flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", cfg.bg)}>
                    <cfg.icon className={cn("w-4 h-4", cfg.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{cfg.label}s</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add button */}
          <div className="flex justify-end mb-4">
            <Button
              id="add-reminder-btn"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="h-9 gap-2 gradient-brand text-white border-none rounded-xl text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Reminder
            </Button>
          </div>

          {/* Pending */}
          {pending.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Pending
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 border-0 bg-primary/10 text-primary">{pending.length}</Badge>
              </h2>
              <div className="space-y-2.5">
                {pending.map((r) => {
                  const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.task;
                  return (
                    <div
                      key={r.id}
                      id={r.id}
                      className={cn("bg-card border rounded-2xl p-4 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4", cfg.border)}
                    >
                      <div className={cn("p-2.5 rounded-xl shrink-0", cfg.bg)}>
                        <cfg.icon className={cn("w-4 h-4", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-sm font-semibold text-foreground">{r.title}</p>
                          <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 capitalize", PRIORITY_BADGE[r.priority] || "bg-slate-500/10")}>
                            {r.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <div className={cn("flex items-center gap-1 text-xs font-semibold justify-end", cfg.color)}>
                          <Clock className="w-3 h-3" />
                          {r.date}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{r.time}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          id={`done-rem-${r.id}`}
                          onClick={() => toggle(r.id, r.done)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          id={`del-rem-${r.id}`}
                          onClick={() => remove(r.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Completed
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 border-0 bg-emerald-500/10 text-emerald-600">{completed.length}</Badge>
              </h2>
              <div className="space-y-2">
                {completed.map((r) => {
                  return (
                    <div key={r.id} id={`done-${r.id}`} className="bg-muted/40 border border-border/40 rounded-2xl p-3.5 flex items-center gap-3 opacity-60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-sm text-muted-foreground line-through flex-1">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground">{r.date}</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggle(r.id, r.done)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                          title="Undo"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reminders.length === 0 && (
            <div className="text-center py-20 bg-card border border-dashed border-border/60 rounded-3xl">
              <Bell className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No reminders set</p>
              <p className="text-xs text-muted-foreground mt-1">Add reminders for interviews, preparation tasks, or application deadlines.</p>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
