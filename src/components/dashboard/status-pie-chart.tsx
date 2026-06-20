"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { name: "Applied",    value: 342, color: "oklch(0.65 0.22 265)" },
  { name: "Assessment", value: 48,  color: "oklch(0.65 0.2 290)" },
  { name: "Interview",  value: 24,  color: "oklch(0.65 0.18 200)" },
  { name: "Offer",      value: 3,   color: "oklch(0.65 0.18 160)" },
  { name: "Rejected",   value: 75,  color: "oklch(0.58 0.18 25)" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div className="bg-popover border border-border rounded-xl p-3 shadow-elevated text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: d.payload.color }} />
          <span className="font-semibold text-foreground">{d.name}</span>
        </div>
        <p className="mt-1 text-muted-foreground">{d.value} applications</p>
      </div>
    );
  }
  return null;
};

export function StatusPieChart() {
  return (
    <Card id="status-pie-chart" className="shadow-card border-border/60 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Application Status</CardTitle>
        <p className="text-xs text-muted-foreground">Current pipeline breakdown</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
