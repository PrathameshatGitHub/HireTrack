"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, ExternalLink } from "lucide-react";

const columns = [
  {
    id: "applied",
    label: "Applied",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    cards: [
      { id: "job-1", company: "Google", role: "Senior SWE", salary: "$180k", location: "Remote", date: "Jun 15", logo: "G" , logoColor: "bg-blue-500" },
      { id: "job-2", company: "Stripe",  role: "Staff Engineer", salary: "$200k", location: "SF, CA", date: "Jun 14", logo: "S", logoColor: "bg-purple-500" },
    ],
  },
  {
    id: "assessment",
    label: "Assessment",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    cards: [
      { id: "job-3", company: "Airbnb", role: "Frontend Eng", salary: "$160k", location: "Hybrid", date: "Jun 12", logo: "A", logoColor: "bg-rose-500" },
    ],
  },
  {
    id: "interview",
    label: "Interview",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
    cards: [
      { id: "job-4", company: "Amazon",    role: "SDE-II",       salary: "$175k", location: "Seattle", date: "Jun 10", logo: "A", logoColor: "bg-orange-500" },
      { id: "job-5", company: "Microsoft", role: "SWE II",       salary: "$165k", location: "Remote",  date: "Jun 9",  logo: "M", logoColor: "bg-blue-600" },
    ],
  },
  {
    id: "offer",
    label: "Offer",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    cards: [
      { id: "job-6", company: "Figma", role: "Product Eng", salary: "$190k", location: "NYC", date: "Jun 8", logo: "F", logoColor: "bg-emerald-500" },
    ],
  },
  {
    id: "rejected",
    label: "Rejected",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    cards: [
      { id: "job-7", company: "Meta", role: "SWE III", salary: "$210k", location: "Menlo Park", date: "Jun 5", logo: "M", logoColor: "bg-blue-700" },
    ],
  },
];

export function MiniKanban() {
  return (
    <Card id="mini-kanban" className="shadow-card border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Job Applications Pipeline</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Drag cards to update status</p>
          </div>
          <a href="/applications" className="flex items-center gap-1 text-xs text-primary hover:underline">
            View all <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="pt-0 overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-[700px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 min-w-[130px]">
              {/* Column header */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <Badge variant="secondary" className={`text-[10px] h-5 px-2 ${col.color} border-0`}>
                  {col.label}
                </Badge>
                <span className="text-[10px] text-muted-foreground ml-auto">{col.cards.length}</span>
              </div>
              {/* Cards */}
              <div className="space-y-2">
                {col.cards.map((card) => (
                  <div
                    key={card.id}
                    id={card.id}
                    className="bg-muted/50 border border-border/60 rounded-xl p-2.5 hover:shadow-card hover:bg-card transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-lg ${card.logoColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                        {card.logo}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground truncate">{card.company}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{card.role}</p>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-primary mb-1">{card.salary}</p>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" />
                      <span className="truncate">{card.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{card.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
