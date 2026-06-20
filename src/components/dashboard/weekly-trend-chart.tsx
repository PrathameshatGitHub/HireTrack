"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { day: "Mon", applied: 12, responses: 3, interviews: 1 },
  { day: "Tue", applied: 18, responses: 5, interviews: 2 },
  { day: "Wed", applied: 9,  responses: 2, interviews: 0 },
  { day: "Thu", applied: 22, responses: 7, interviews: 3 },
  { day: "Fri", applied: 15, responses: 4, interviews: 2 },
  { day: "Sat", applied: 6,  responses: 1, interviews: 1 },
  { day: "Sun", applied: 4,  responses: 1, interviews: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-elevated text-xs">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function WeeklyTrendChart() {
  return (
    <Card id="weekly-trend-chart" className="shadow-card border-border/60 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Weekly Application Trend</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days activity</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted rounded-lg px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            This Week
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="applied-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="oklch(0.65 0.22 265)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="oklch(0.65 0.22 265)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="responses-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="oklch(0.65 0.2 290)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="oklch(0.65 0.2 290)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="interviews-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="oklch(0.65 0.18 160)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="oklch(0.65 0.18 160)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.7 0 0 / 0.1)" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.55 0 0)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                iconType="circle"
                iconSize={7}
              />
              <Area
                type="monotone"
                dataKey="applied"
                stroke="oklch(0.65 0.22 265)"
                strokeWidth={2}
                fill="url(#applied-grad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="responses"
                stroke="oklch(0.65 0.2 290)"
                strokeWidth={2}
                fill="url(#responses-grad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="interviews"
                stroke="oklch(0.65 0.18 160)"
                strokeWidth={2}
                fill="url(#interviews-grad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
