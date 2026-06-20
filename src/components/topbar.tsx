"use client";

import { Bell, Search, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header
      id="topbar"
      className="h-16 border-b border-border bg-background/80 glass sticky top-0 z-20 flex items-center gap-4 px-6"
    >
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center w-56">
        <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          id="topbar-search"
          placeholder="Search anything..."
          className="h-8 pl-8 text-sm bg-muted/50 border-transparent focus:bg-background rounded-xl text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          id="quick-add-btn"
          size="sm"
          className="h-8 gap-1.5 gradient-brand text-white border-none shadow-md hover:opacity-90 rounded-xl text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick Add</span>
        </Button>

        <button
          id="notifications-btn"
          className="relative p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <Badge
            variant="destructive"
            className="absolute -top-0.5 -right-0.5 text-[9px] h-4 w-4 p-0 flex items-center justify-center"
          >
            3
          </Badge>
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
