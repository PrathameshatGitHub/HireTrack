"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const followups = [
  {
    id: "fu-1",
    company: "Google",
    contact: "Sarah Chen, HR Manager",
    type: "Follow-up email",
    time: "Today, 2:00 PM",
    status: "today",
    logo: "G",
    logoColor: "bg-blue-500",
  },
  {
    id: "fu-2",
    company: "Stripe",
    contact: "Mike Ross, Recruiter",
    type: "LinkedIn connect",
    time: "Tomorrow, 10:00 AM",
    status: "upcoming",
    logo: "S",
    logoColor: "bg-purple-500",
  },
  {
    id: "fu-3",
    company: "Notion",
    contact: "Amy Park, Tech Lead",
    type: "Thank-you note",
    time: "Jun 15 — Missed",
    status: "missed",
    logo: "N",
    logoColor: "bg-gray-600",
  },
];

const statusConfig = {
  today:    { icon: Clock,         color: "text-amber-500",   bg: "bg-amber-500/10",  label: "Today" },
  upcoming: { icon: Calendar,      color: "text-blue-500",    bg: "bg-blue-500/10",   label: "Soon" },
  missed:   { icon: AlertCircle,   color: "text-red-500",     bg: "bg-red-500/10",    label: "Missed" },
};

export function UpcomingFollowups() {
  return (
    <Card id="upcoming-followups" className="shadow-card border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Follow-Ups</CardTitle>
        <p className="text-xs text-muted-foreground">Scheduled reminders</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {followups.map((fu) => {
          const cfg = statusConfig[fu.status as keyof typeof statusConfig];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={fu.id}
              id={fu.id}
              className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer border border-border/40 hover:border-border"
            >
              <div className={`w-7 h-7 rounded-lg ${fu.logoColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {fu.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-foreground truncate">{fu.company}</p>
                  <span className={cn("flex items-center gap-0.5 text-[10px] font-medium shrink-0", cfg.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{fu.contact}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{fu.type} · {fu.time}</p>
              </div>
            </div>
          );
        })}
        <button
          id="mark-done-btn"
          className="w-full flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors py-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark all today's as done
        </button>
      </CardContent>
    </Card>
  );
}
