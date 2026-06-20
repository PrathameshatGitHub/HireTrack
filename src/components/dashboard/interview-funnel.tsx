"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const stages = [
  { id: "funnel-applied",    label: "Applied",    value: 342, pct: 100, color: "bg-blue-500",    textColor: "text-blue-500" },
  { id: "funnel-responses",  label: "Responses",  value: 86,  pct: 25,  color: "bg-violet-500",  textColor: "text-violet-500" },
  { id: "funnel-phone",      label: "Phone Screen",value: 48,  pct: 14,  color: "bg-purple-500",  textColor: "text-purple-500" },
  { id: "funnel-onsite",     label: "On-site",    value: 24,  pct: 7,   color: "bg-indigo-500",  textColor: "text-indigo-500" },
  { id: "funnel-offer",      label: "Offer",      value: 3,   pct: 0.8, color: "bg-emerald-500", textColor: "text-emerald-500" },
];

export function InterviewFunnel() {
  return (
    <Card id="interview-funnel" className="shadow-card border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Interview Success Funnel</CardTitle>
        <p className="text-xs text-muted-foreground">Conversion rates across your pipeline</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-2.5">
        {stages.map((stage, idx) => (
          <div key={stage.id} id={stage.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`font-medium text-foreground`}>{stage.label}</span>
                {idx < stages.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${stage.textColor}`}>{stage.value}</span>
                <span className="text-muted-foreground text-[10px]">({stage.pct}%)</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${stage.color}`}
                style={{ width: `${stage.pct}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
