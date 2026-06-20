"use client";

import { AppLayout } from "@/components/app-layout";
import { AppModal } from "@/components/app-modal";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Plus, Flame, Target, Trophy, Zap, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { getTasks, addTask, toggleTask, deleteTask, getGoals, addGoal } from "@/app/actions";

const ADD_TASK_FIELDS = [
  { id: "label",     label: "Task Description", placeholder: "e.g. Apply to 5 new jobs on LinkedIn", required: true },
  { id: "priority",  label: "Priority",         type: "select" as const, placeholder: "Select Priority", required: true, half: true,
    options: [
      { value: "high",   label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low",    label: "Low" },
    ],
  },
  { id: "category",  label: "Category",         placeholder: "e.g. Interview Prep", required: true, half: true },
];

type Task = { id: string; label: string; done: boolean; priority: "high" | "medium" | "low"; category: string };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTasksAndGoals = async () => {
    if (!user) return;
    try {
      const tData = await getTasks(user.id);
      setTasks(tData);
      const gData = await getGoals(user.id);
      setGoals(gData);
    } catch (err) {
      console.error("Error fetching tasks/goals:", err);
    }
  };

  useEffect(() => {
    fetchTasksAndGoals();
  }, [user]);

  const handleToggleTask = async (id: string, currentDone: boolean) => {
    if (!user) return;
    const nextDone = !currentDone;
    
    // Optimistic UI update
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: nextDone } : t));

    try {
      await toggleTask(user.id, id, nextDone);
    } catch (err) {
      console.error("Error toggling task:", err);
      fetchTasksAndGoals(); // Rollback
    }
  };

  const handleAddTask = async (data: Record<string, string>) => {
    if (!user) return;
    try {
      await addTask(user.id, {
        label: data.label || "New Task",
        done: false,
        priority: data.priority || "medium",
        category: data.category || "General",
      });
      fetchTasksAndGoals();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteTask(user.id, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const PRIORITY_STYLE: Record<string, string> = {
    high:   "bg-red-500/10 text-red-600 dark:text-red-400",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    low:    "bg-slate-500/10 text-slate-500",
  };

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <AppLayout title="Daily Tasks" subtitle="Track your daily productivity and weekly goals">
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Task"
        fields={ADD_TASK_FIELDS}
        submitLabel="Add Task"
        onSubmit={handleAddTask}
      />
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { id: "stat-tasks",   label: "Tasks Done",    value: `${done}/${total}`, icon: CheckCircle2, color: "text-emerald-500",  bg: "bg-emerald-500/10" },
          { id: "stat-streak",  label: "Day Streak",    value: "7 🔥",             icon: Flame,        color: "text-orange-500",  bg: "bg-orange-500/10" },
          { id: "stat-applied", label: "Applied Today", value: "3",                icon: Target,       color: "text-blue-500",    bg: "bg-blue-500/10" },
          { id: "stat-score",   label: "Momentum Score",value: "82",               icon: Zap,          color: "text-violet-500",  bg: "bg-violet-500/10" },
        ].map((s) => (
          <div key={s.id} id={s.id} className="bg-card border border-border/60 rounded-2xl p-4 shadow-card flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl", s.bg)}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl shadow-card overflow-hidden">
            {/* Progress header */}
            <div className="p-5 border-b border-border/60">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Today's Tasks</h2>
                  <p className="text-xs text-muted-foreground">{done} of {total} completed</p>
                </div>
                <Button
                  id="add-task-btn"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="h-8 gap-1.5 gradient-brand text-white border-none rounded-xl text-xs hover:opacity-90 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <Progress value={pct} className="h-2 rounded-full" />
              <p className="text-[10px] text-muted-foreground mt-1">{pct}% complete</p>
            </div>

            {/* Tasks list */}
            <div className="divide-y divide-border/40">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  id={task.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group",
                    task.done && "opacity-60"
                  )}
                  onClick={() => handleToggleTask(task.id, task.done)}
                >
                  {task.done
                    ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 w-5 h-5" />
                    : <Circle className="w-5 h-5 text-muted-foreground shrink-0 hover:text-foreground transition-colors" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm text-foreground", task.done && "line-through text-muted-foreground")}>{task.label}</p>
                    <p className="text-[10px] text-muted-foreground">{task.category}</p>
                  </div>
                  <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5 border-0 shrink-0 capitalize", PRIORITY_STYLE[task.priority as keyof typeof PRIORITY_STYLE])}>
                    {task.priority}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors shrink-0 opacity-0 group-hover:opacity-100 ml-2 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Goals + Streak */}
        <div className="space-y-4">
          {/* Weekly goals */}
          <div className="bg-card border border-border/60 rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">Weekly Goals</h2>
            </div>
            <div className="space-y-4">
              {goals.map((g) => {
                const p = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
                return (
                  <div key={g.id} id={g.id}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-foreground font-medium">{g.label}</span>
                      <span className="text-muted-foreground">{g.current}/{g.target}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${g.color}`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak card */}
          <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl shadow-card p-5 text-center">
            <p className="text-4xl mb-2">🔥</p>
            <p className="text-3xl font-bold text-foreground">7</p>
            <p className="text-sm font-semibold text-foreground">Day Streak!</p>
            <p className="text-xs text-muted-foreground mt-1">Keep applying daily to extend it</p>
            <div className="flex justify-center gap-1.5 mt-3">
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold", i < 7 ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground")}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
