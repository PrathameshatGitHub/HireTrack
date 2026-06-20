"use client";

import { AppLayout } from "@/components/app-layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Award, Loader2, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-provider";
import { getApplications, getInterviews } from "@/app/actions";

type Application = {
  id: string; company: string; role: string; salary: string;
  location: string; date: string; source: string; logo: string;
  logoColor: string; column: string; notes?: string | null;
  createdAt: Date;
};

const COLORS = [
  "oklch(0.55 0.22 265)", // blue
  "oklch(0.6 0.2 290)",   // purple
  "oklch(0.65 0.18 160)",  // green
  "oklch(0.65 0.15 45)",   // orange/red
  "oklch(0.7 0.12 80)",    // yellow
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-elevated text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-muted-foreground capitalize">{p.name}:</span>
            <span className="font-semibold text-foreground">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Dynamic stats
  const [kpis, setKpis] = useState({ response: "0%", interview: "0%", offer: "0%", rejection: "0%" });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [hasData, setHasData] = useState(false);

  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const apps = (await getApplications(user.id)) as Application[];
      
      if (apps.length === 0) {
        setHasData(false);
        setLoading(false);
        return;
      }
      
      setHasData(true);

      const total = apps.length;

      // 1. Calculate KPIs
      const appliedCount = apps.filter(a => a.column === "applied").length;
      const responseCount = total - appliedCount; // Anything not in 'applied' stage means response
      const interviewCount = apps.filter(a => a.column === "interview" || a.column === "offer").length;
      const offerCount = apps.filter(a => a.column === "offer").length;
      const rejectionCount = apps.filter(a => a.column === "rejected").length;

      const responseRate = ((responseCount / total) * 100).toFixed(1) + "%";
      const interviewRate = ((interviewCount / total) * 100).toFixed(1) + "%";
      const offerRate = ((offerCount / total) * 100).toFixed(1) + "%";
      const rejectionRate = ((rejectionCount / total) * 100).toFixed(1) + "%";

      setKpis({ response: responseRate, interview: interviewRate, offer: offerRate, rejection: rejectionRate });

      // 2. Monthly Data (Last 6 Months)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyMap: Record<string, { applied: number; responses: number; interviews: number }> = {};
      
      // Initialize last 6 months
      const d = new Date();
      for (let i = 5; i >= 0; i--) {
        const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
        const label = monthNames[m.getMonth()];
        monthlyMap[label] = { applied: 0, responses: 0, interviews: 0 };
      }

      apps.forEach(a => {
        const createdDate = new Date(a.createdAt);
        const label = monthNames[createdDate.getMonth()];
        if (monthlyMap[label]) {
          monthlyMap[label].applied += 1;
          if (a.column !== "applied") {
            monthlyMap[label].responses += 1;
          }
          if (a.column === "interview" || a.column === "offer") {
            monthlyMap[label].interviews += 1;
          }
        }
      });

      const formattedMonthly = Object.keys(monthlyMap).map(month => ({
        month,
        applied: monthlyMap[month].applied,
        responses: monthlyMap[month].responses,
        interviews: monthlyMap[month].interviews,
      }));
      setMonthlyData(formattedMonthly);

      // 3. Source Breakdown
      const sourceMap: Record<string, number> = {};
      apps.forEach(a => {
        const src = a.source ? a.source.trim() : "Other";
        const normalized = src.charAt(0).toUpperCase() + src.slice(1).toLowerCase();
        sourceMap[normalized] = (sourceMap[normalized] || 0) + 1;
      });

      const formattedSource = Object.keys(sourceMap).map((name, index) => ({
        name,
        value: sourceMap[name],
        color: COLORS[index % COLORS.length],
      }));
      setSourceData(formattedSource);

      // 4. Conversion Funnel
      // Applied (100%) -> Screened/Responded -> Interviewed -> Offered
      const conversion = [
        { stage: "Applied", value: 100 },
        { stage: "Responded", value: total > 0 ? Math.round((responseCount / total) * 100) : 0 },
        { stage: "Interviewed", value: total > 0 ? Math.round((interviewCount / total) * 100) : 0 },
        { stage: "Offered", value: total > 0 ? Math.round((offerCount / total) * 100) : 0 },
      ];
      setConversionData(conversion);

      // 5. Top Companies response rate
      const companyMap: Record<string, { apps: number; responses: number; logo: string; color: string }> = {};
      apps.forEach(a => {
        if (!companyMap[a.company]) {
          companyMap[a.company] = {
            apps: 0,
            responses: 0,
            logo: a.logo || a.company[0].toUpperCase(),
            color: a.logoColor || "bg-primary",
          };
        }
        companyMap[a.company].apps += 1;
        if (a.column !== "applied") {
          companyMap[a.company].responses += 1;
        }
      });

      const formattedCompanies = Object.keys(companyMap)
        .map(company => {
          const info = companyMap[company];
          const rate = Math.round((info.responses / info.apps) * 100);
          return {
            company,
            apps: info.apps,
            responses: info.responses,
            rate,
            logo: info.logo,
            color: info.color,
          };
        })
        .sort((a, b) => b.apps - a.apps)
        .slice(0, 6); // Top 6 companies
      setTopCompanies(formattedCompanies);

    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return (
    <AppLayout title="Analytics" subtitle="Deep insights into your job search performance">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !hasData ? (
        <div className="text-center py-20 bg-card border border-dashed border-border/60 rounded-3xl">
          <BarChart2 className="w-12 h-12 text-muted-foreground/60 mx-auto mb-3 animate-pulse" />
          <p className="text-base font-semibold text-foreground">No applications tracked yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-5">Add job applications to populate your analytics charts dynamically.</p>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { id: "ana-rate",      label: "Response Rate",      value: kpis.response,  icon: TrendingUp,   color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { id: "ana-interview", label: "Interview Rate",     value: kpis.interview, icon: Target,       color: "text-blue-500",    bg: "bg-blue-500/10" },
              { id: "ana-offer",     label: "Offer Rate",         value: kpis.offer,     icon: Award,        color: "text-amber-500",   bg: "bg-amber-500/10" },
              { id: "ana-rejection", label: "Rejection Rate",     value: kpis.rejection, icon: TrendingDown, color: "text-red-500",     bg: "bg-red-500/10" },
            ].map((s) => (
              <div key={s.id} id={s.id} className="bg-card border border-border/60 rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-xl", s.bg)}>
                    <s.icon className={cn("w-4 h-4", s.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Monthly Applications */}
            <Card id="monthly-chart" className="shadow-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Applications Per Month</CardTitle>
                <p className="text-xs text-muted-foreground">6-month overview</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0 0 / 0.1)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="applied" fill="oklch(0.65 0.22 265)" radius={[4, 4, 0, 0]} name="applied" />
                      <Bar dataKey="responses" fill="oklch(0.65 0.2 290)" radius={[4, 4, 0, 0]} name="responses" />
                      <Bar dataKey="interviews" fill="oklch(0.65 0.18 160)" radius={[4, 4, 0, 0]} name="interviews" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Source Breakdown */}
            <Card id="source-chart" className="shadow-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Application Sources</CardTitle>
                <p className="text-xs text-muted-foreground">Where your applications come from</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sourceData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {sourceData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any, name?: any) => [`${v} apps`, name || ""]} contentStyle={{ fontSize: "11px", borderRadius: "12px", border: "1px solid var(--border)" }} />
                      <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel Line */}
            <Card id="conversion-chart" className="shadow-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Interview Conversion</CardTitle>
                <p className="text-xs text-muted-foreground">Stage-by-stage success rate (%)</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={conversionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="conv-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="oklch(0.65 0.22 265)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.65 0.22 265)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0 0 / 0.1)" />
                      <XAxis dataKey="stage" tick={{ fontSize: 9, fill: "oklch(0.55 0 0)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip formatter={(v: any) => [`${v}%`, "Rate"]} contentStyle={{ fontSize: "11px", borderRadius: "12px", border: "1px solid var(--border)" }} />
                      <Area type="monotone" dataKey="value" stroke="oklch(0.65 0.22 265)" strokeWidth={2.5} fill="url(#conv-grad)" dot={{ r: 4, fill: "oklch(0.65 0.22 265)", strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Companies */}
            <Card id="top-companies-chart" className="shadow-card border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Top Companies Applied</CardTitle>
                <p className="text-xs text-muted-foreground">Response rate by company</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {topCompanies.map((co) => (
                    <div key={co.company} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg ${co.color} text-white text-xs font-bold flex items-center justify-center shrink-0`}>{co.logo}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">{co.company}</span>
                          <span className={cn("font-semibold", co.rate === 100 ? "text-emerald-500" : co.rate >= 50 ? "text-amber-500" : "text-red-400")}>{co.rate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", co.rate === 100 ? "bg-emerald-500" : co.rate >= 50 ? "bg-amber-500" : "bg-red-400")}
                            style={{ width: `${co.rate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AppLayout>
  );
}
