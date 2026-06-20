"use client";

import { AppLayout } from "@/components/app-layout";
import { KpiCards, KpiStats } from "@/components/dashboard/kpi-cards";
import { WeeklyTrendChart } from "@/components/dashboard/weekly-trend-chart";
import { StatusPieChart } from "@/components/dashboard/status-pie-chart";
import { MiniKanban } from "@/components/dashboard/mini-kanban";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { AchievementBadges } from "@/components/dashboard/achievement-badges";
import { UpcomingFollowups } from "@/components/dashboard/upcoming-followups";
import { InterviewFunnel } from "@/components/dashboard/interview-funnel";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-provider";
import { getApplications, getInterviews } from "@/app/actions";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<KpiStats | undefined>(undefined);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const apps = await getApplications(user.id);
        const ints = await getInterviews(user.id);

        const totalApps = apps.length;
        const rejections = apps.filter((a) => a.column === "rejected").length;
        const offers = apps.filter((a) => a.column === "offer").length;
        const responses = apps.filter((a) => a.column !== "applied" && a.column !== "rejected").length;
        
        const responseRate = totalApps > 0 ? Math.round(((responses + offers) / totalApps) * 100) : 0;
        
        // Count interviews
        let interviewRounds = 0;
        ints.forEach((i) => {
          interviewRounds += i.rounds.length;
        });

        setStats({
          totalApps,
          responses: responses + offers,
          interviews: interviewRounds,
          offers,
          rejections,
          responseRate,
        });
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Welcome back 👋 — Here's your career snapshot"
    >
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* KPI Row */}
        <KpiCards stats={stats} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <WeeklyTrendChart />
          </div>
          <StatusPieChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <MiniKanban />
            <InterviewFunnel />
          </div>
          <div className="space-y-5">
            <AiAssistant />
            <UpcomingFollowups />
            <AchievementBadges />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
