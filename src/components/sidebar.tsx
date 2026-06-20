"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarClock,
  Target,
  FolderOpen,
  CheckSquare,
  BookOpen,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-provider";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    id: "nav-dashboard",
  },
  {
    label: "Job Applications",
    href: "/applications",
    icon: Briefcase,
    id: "nav-applications",
    badge: "342",
  },
  {
    label: "HR Contacts",
    href: "/contacts",
    icon: Users,
    id: "nav-contacts",
  },
  {
    label: "Follow Ups",
    href: "/followups",
    icon: CalendarClock,
    id: "nav-followups",
    badge: "5",
    badgeVariant: "destructive" as const,
  },
  {
    label: "Interview Tracker",
    href: "/interviews",
    icon: Target,
    id: "nav-interviews",
    badge: "2",
  },
  {
    label: "Resume & Docs",
    href: "/documents",
    icon: FolderOpen,
    id: "nav-documents",
  },
  {
    label: "Daily Tasks",
    href: "/tasks",
    icon: CheckSquare,
    id: "nav-tasks",
    badge: "8",
  },
  {
    label: "Career Journal",
    href: "/journal",
    icon: BookOpen,
    id: "nav-journal",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    id: "nav-analytics",
  },
  {
    label: "Reminders",
    href: "/reminders",
    icon: Bell,
    id: "nav-reminders",
    badge: "3",
    badgeVariant: "destructive" as const,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    id: "nav-settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsedRef = useRef(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => {
    collapsedRef.current = !collapsedRef.current;
    setCollapsed(collapsedRef.current);
  };

  const { user, signOut } = useAuth();
  const email = user?.email || "guest@email.com";
  const displayName = email.split("@")[0];
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <aside
      id="sidebar"
      className={cn(
        "relative flex flex-col h-screen border-r border-border bg-sidebar transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-brand shrink-0 shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground tracking-tight truncate">
              Career OS
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              AI Job CRM
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              id={item.id}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                className={cn("w-4 h-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")}
              />
              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <Badge
                  variant={item.badgeVariant || "secondary"}
                  className="text-[10px] h-4 px-1.5 ml-auto shrink-0"
                >
                  {item.badge}
                </Badge>
              )}
              {collapsed && item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {parseInt(item.badge) > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate capitalize">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={signOut}
              className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        id="sidebar-collapse-btn"
        onClick={toggle}
        className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center shadow-sm hover:bg-accent transition-all duration-200"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>
    </aside>
  );
}
