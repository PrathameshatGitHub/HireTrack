"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const badges = [
  { id: "badge-100-jobs", icon: "🚀", title: "Applied to 100 Jobs", desc: "You're on a roll!", earned: true, color: "from-blue-500/20 to-purple-500/20 border-blue-500/30" },
  { id: "badge-streak", icon: "🔥", title: "7-Day Streak", desc: "Consistency is key", earned: true, color: "from-orange-500/20 to-red-500/20 border-orange-500/30" },
  { id: "badge-first-interview", icon: "🎯", title: "First Interview", desc: "Great milestone!", earned: true, color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30" },
  { id: "badge-offer", icon: "🏆", title: "Offer Received", desc: "You did it!", earned: false, color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30" },
  { id: "badge-network", icon: "👥", title: "Networker Pro", desc: "50 contacts added", earned: false, color: "from-violet-500/20 to-pink-500/20 border-violet-500/30" },
];

export function AchievementBadges() {
  return (
    <Card id="achievement-badges" className="shadow-card border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Achievements</CardTitle>
        <p className="text-xs text-muted-foreground">3 of 5 earned</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              id={b.id}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border bg-gradient-to-br text-center transition-all duration-200 ${b.color} ${
                b.earned
                  ? "opacity-100 hover:scale-105 cursor-pointer"
                  : "opacity-35 grayscale"
              }`}
            >
              <span className="text-xl">{b.icon}</span>
              <p className="text-[9px] font-semibold text-foreground leading-tight">{b.title}</p>
              {!b.earned && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-muted border border-border rounded-full px-1 py-0.5 text-muted-foreground">
                  Locked
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
