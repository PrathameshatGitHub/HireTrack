"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase, Mail, CalendarCheck, Trophy, XCircle, TrendingUp, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const kpis = [
  {
    id: "kpi-total-applications",
    label: "Total Applications",
    value: 342,
    change: "+28 this week",
    trend: "up",
    icon: Briefcase,
    gradient: "from-blue-500/10 to-purple-500/10",
    iconBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
    delay: 0,
  },
  {
    id: "kpi-responses",
    label: "Responses Received",
    value: 86,
    change: "+6 this week",
    trend: "up",
    icon: Mail,
    gradient: "from-violet-500/10 to-pink-500/10",
    iconBg: "bg-violet-500/10 text-violet-500 dark:text-violet-400",
    delay: 80,
  },
  {
    id: "kpi-interviews",
    label: "Interviews Scheduled",
    value: 24,
    change: "+3 this week",
    trend: "up",
    icon: CalendarCheck,
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    delay: 160,
  },
  {
    id: "kpi-offers",
    label: "Offers Received",
    value: 3,
    change: "+1 this week",
    trend: "up",
    icon: Trophy,
    gradient: "from-amber-500/10 to-orange-500/10",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    delay: 240,
  },
  {
    id: "kpi-rejections",
    label: "Rejections",
    value: 75,
    change: "+5 this week",
    trend: "down",
    icon: XCircle,
    gradient: "from-red-500/10 to-rose-500/10",
    iconBg: "bg-red-500/10 text-red-500 dark:text-red-400",
    delay: 320,
  },
  {
    id: "kpi-response-rate",
    label: "Response Rate",
    value: 25,
    suffix: "%",
    change: "+2% this month",
    trend: "up",
    icon: TrendingUp,
    gradient: "from-cyan-500/10 to-sky-500/10",
    iconBg: "bg-cyan-500/10 text-cyan-500 dark:text-cyan-400",
    delay: 400,
  },
];

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  // useRef: store interval ID without re-render
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / 40);
    intervalRef.current = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(intervalRef.current!);
      }
      setDisplay(current);
    }, 30);
    return () => clearInterval(intervalRef.current!);
  }, [target]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export interface KpiStats {
  totalApps: number;
  responses: number;
  interviews: number;
  offers: number;
  rejections: number;
  responseRate: number;
}

export function KpiCards({ stats }: { stats?: KpiStats }) {
  const values = stats ?? {
    totalApps: 342,
    responses: 86,
    interviews: 24,
    offers: 3,
    rejections: 75,
    responseRate: 25,
  };

  const dynamicKpis = [
    { ...kpis[0], value: values.totalApps, change: values.totalApps > 0 ? `Active pipeline` : "No apps yet" },
    { ...kpis[1], value: values.responses, change: values.responses > 0 ? `${values.responses} callback(s)` : "Pending" },
    { ...kpis[2], value: values.interviews, change: values.interviews > 0 ? `${values.interviews} round(s)` : "None scheduled" },
    { ...kpis[3], value: values.offers, change: values.offers > 0 ? `Congratulations!` : "Keep pushing!" },
    { ...kpis[4], value: values.rejections, change: values.rejections > 0 ? `Part of the process` : "0 rejections" },
    { ...kpis[5], value: values.responseRate, change: values.responseRate > 0 ? `${values.responseRate}% rate` : "0% rate" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {dynamicKpis.map((kpi) => (
        <Card
          key={kpi.id}
          id={kpi.id}
          className={cn(
            "shadow-card border-border/60 bg-gradient-to-br overflow-hidden animate-fade-in-up hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5 cursor-default",
            kpi.gradient
          )}
          style={{ animationDelay: `${kpi.delay}ms` }}
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-xl", kpi.iconBg)}>
                <kpi.icon className="w-4 h-4" />
              </div>
              {kpi.trend === "up" ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none animate-count-up">
                <AnimatedNumber target={kpi.value} suffix={kpi.suffix} />
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-1 leading-tight">
                {kpi.label}
              </p>
            </div>
            <p
              className={cn(
                "text-[10px] font-medium",
                kpi.trend === "up" ? "text-emerald-500" : "text-red-400"
              )}
            >
              {kpi.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
