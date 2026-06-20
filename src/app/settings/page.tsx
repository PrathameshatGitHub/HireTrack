"use client";

import { AppLayout } from "@/components/app-layout";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  User, Bell, Shield, Palette, Link2, Download, Trash2,
  ChevronRight, Check, Globe, Mail, Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "privacy",       label: "Privacy",         icon: Shield },
  { id: "appearance",   label: "Appearance",      icon: Palette },
  { id: "integrations", label: "Integrations",    icon: Link2 },
  { id: "data",         label: "Data & Export",   icon: Download },
];

function Toggle({ id, defaultOn = false }: { id: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      id={id}
      onClick={() => setOn(!on)}
      className={cn(
        "relative w-10 rounded-full transition-all duration-200 shrink-0",
        on ? "gradient-brand" : "bg-muted border border-border"
      )}
      style={{ height: "22px" }}
      aria-pressed={on}
    >
      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200", on ? "left-5" : "left-0.5")} />
    </button>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <AppLayout title="Settings" subtitle="Manage your account and application preferences">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 max-w-5xl">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border/60 rounded-2xl shadow-card p-2 space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                id={`settings-nav-${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left",
                  activeSection === s.id
                    ? "gradient-brand text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <s.icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeSection === "profile" && (
            <>
              <div className="bg-card border border-border/60 rounded-2xl shadow-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Personal Information</h3>
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border/60">
                  <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-white text-xl font-bold shadow-md">AJ</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Alex Johnson</p>
                    <p className="text-xs text-muted-foreground">alex@email.com</p>
                    <Button id="change-avatar-btn" variant="outline" size="sm" className="mt-2 h-7 text-xs rounded-xl">Change Avatar</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "set-fname", label: "First Name",   value: "Alex",               placeholder: "First name" },
                    { id: "set-lname", label: "Last Name",    value: "Johnson",             placeholder: "Last name" },
                    { id: "set-email", label: "Email",        value: "alex@email.com",      placeholder: "Email address" },
                    { id: "set-phone", label: "Phone",        value: "+1 (555) 012-3456",   placeholder: "Phone number" },
                    { id: "set-title", label: "Job Title",    value: "Senior Software Engineer", placeholder: "Your job title" },
                    { id: "set-loc",   label: "Location",     value: "San Francisco, CA",   placeholder: "City, State" },
                  ].map((f) => (
                    <div key={f.id}>
                      <label htmlFor={f.id} className="block text-xs font-medium text-muted-foreground mb-1.5">{f.label}</label>
                      <Input id={f.id} defaultValue={f.value} placeholder={f.placeholder} className="h-9 rounded-xl text-sm bg-muted border-transparent focus:bg-background" />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio</label>
                  <textarea
                    id="set-bio"
                    defaultValue="Senior Software Engineer with 6 years of experience in full-stack development. Currently exploring opportunities at top-tier tech companies."
                    className="w-full h-20 rounded-xl text-sm bg-muted border-transparent focus:bg-background resize-none p-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button id="save-profile-btn" size="sm" className="h-9 gap-2 gradient-brand text-white border-none rounded-xl text-xs">
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </Button>
                </div>
              </div>

              {/* Job preferences */}
              <div className="bg-card border border-border/60 rounded-2xl shadow-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Job Search Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "set-target-role",    label: "Target Role",       value: "Senior Software Engineer" },
                    { id: "set-target-salary",  label: "Target Salary",     value: "$180k – $220k" },
                    { id: "set-work-type",      label: "Work Type",         value: "Remote / Hybrid" },
                    { id: "set-exp",            label: "Experience Level",  value: "Senior (5-8 years)" },
                  ].map((f) => (
                    <div key={f.id}>
                      <label htmlFor={f.id} className="block text-xs font-medium text-muted-foreground mb-1.5">{f.label}</label>
                      <Input id={f.id} defaultValue={f.value} className="h-9 rounded-xl text-sm bg-muted border-transparent focus:bg-background" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <div className="bg-card border border-border/60 rounded-2xl shadow-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { id: "notif-email",     icon: Mail,        label: "Email Notifications",            desc: "Get alerts via email",              on: true },
                  { id: "notif-push",      icon: Bell,        label: "Push Notifications",             desc: "Browser push notifications",        on: true },
                  { id: "notif-sms",       icon: Smartphone,  label: "SMS Alerts",                     desc: "Text messages for urgent reminders", on: false },
                  { id: "notif-followups", icon: Bell,        label: "Follow-Up Reminders",            desc: "Remind me before scheduled follow-ups", on: true },
                  { id: "notif-interview", icon: Bell,        label: "Interview Reminders",            desc: "Alert 24h and 1h before interviews", on: true },
                  { id: "notif-ai",        icon: Globe,       label: "AI Career Insights",             desc: "Weekly AI-powered career suggestions", on: true },
                  { id: "notif-weekly",    icon: Globe,       label: "Weekly Progress Report",         desc: "Summary of your weekly activity",   on: false },
                ].map((n) => (
                  <div key={n.id} className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-xl bg-muted shrink-0">
                        <n.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{n.label}</p>
                        <p className="text-xs text-muted-foreground">{n.desc}</p>
                      </div>
                    </div>
                    <Toggle id={n.id} defaultOn={n.on} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="bg-card border border-border/60 rounded-2xl shadow-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Appearance</h3>
              <div className="flex items-center justify-between py-3 border-b border-border/40">
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
                </div>
                <ThemeToggle />
              </div>
              <div className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {[
                    { id: "color-blue",   label: "Blue",   cls: "bg-blue-500" },
                    { id: "color-violet", label: "Violet", cls: "bg-violet-500" },
                    { id: "color-emerald",label: "Emerald",cls: "bg-emerald-500" },
                    { id: "color-rose",   label: "Rose",   cls: "bg-rose-500" },
                    { id: "color-amber",  label: "Amber",  cls: "bg-amber-500" },
                  ].map((c) => (
                    <button key={c.id} id={c.id} title={c.label} className={`w-8 h-8 rounded-full ${c.cls} ring-2 ring-offset-2 ring-offset-background ${c.id === "color-blue" ? "ring-blue-500" : "ring-transparent"} hover:scale-110 transition-transform`} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {(activeSection === "privacy" || activeSection === "integrations" || activeSection === "data") && (
            <div className="bg-card border border-border/60 rounded-2xl shadow-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 capitalize">{activeSection}</h3>
              <div className="space-y-3">
                {activeSection === "data" && (
                  <>
                    <div className="flex items-center justify-between p-3.5 bg-muted/50 rounded-2xl border border-border/60">
                      <div>
                        <p className="text-sm font-medium text-foreground">Export All Data</p>
                        <p className="text-xs text-muted-foreground">Download all your data as JSON/CSV</p>
                      </div>
                      <Button id="export-data-btn" variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl text-xs">
                        <Download className="w-3.5 h-3.5" /> Export
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-red-500/5 rounded-2xl border border-red-500/20">
                      <div>
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Delete Account</p>
                        <p className="text-xs text-muted-foreground">Permanently delete all data. Cannot be undone.</p>
                      </div>
                      <Button id="delete-account-btn" variant="destructive" size="sm" className="h-8 gap-1.5 rounded-xl text-xs">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </>
                )}
                {activeSection === "integrations" && (
                  <div className="space-y-3">
                    {[
                      { id: "int-linkedin", name: "LinkedIn",     status: "Connected",     color: "text-blue-600",    statusColor: "text-emerald-500" },
                      { id: "int-google",   name: "Google Jobs",  status: "Not Connected", color: "text-red-500",     statusColor: "text-muted-foreground" },
                      { id: "int-gcal",     name: "Google Calendar", status: "Connected",  color: "text-blue-500",    statusColor: "text-emerald-500" },
                      { id: "int-notion",   name: "Notion",       status: "Not Connected", color: "text-foreground",  statusColor: "text-muted-foreground" },
                    ].map((i) => (
                      <div key={i.id} id={i.id} className="flex items-center justify-between p-3.5 bg-muted/50 rounded-2xl border border-border/60">
                        <div>
                          <p className={`text-sm font-semibold ${i.color}`}>{i.name}</p>
                          <p className={`text-xs font-medium ${i.statusColor}`}>{i.status}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs">
                          {i.status === "Connected" ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {activeSection === "privacy" && (
                  <div className="space-y-3">
                    {[
                      { id: "priv-analytics", label: "Usage Analytics",    desc: "Help improve Career OS with anonymous data", on: true },
                      { id: "priv-ai",        label: "AI Data Training",   desc: "Allow AI to learn from your interactions",   on: false },
                      { id: "priv-public",    label: "Public Profile",     desc: "Make your profile visible to recruiters",    on: false },
                    ].map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.desc}</p>
                        </div>
                        <Toggle id={p.id} defaultOn={p.on} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
