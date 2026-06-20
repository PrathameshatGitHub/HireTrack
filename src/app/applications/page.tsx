"use client";

import { AppLayout } from "@/components/app-layout";
import { AppModal } from "@/components/app-modal";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Link2, Globe, Users, StickyNote, Plus, Search, Filter, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { getApplications, addApplication, updateApplicationColumn, deleteApplication } from "@/app/actions";

const COLUMNS = [
  { id: "applied",    label: "Applied",    color: "border-t-blue-500",   dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  { id: "assessment", label: "Assessment", color: "border-t-amber-500",  dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
  { id: "interview",  label: "Interview",  color: "border-t-violet-500", dot: "bg-violet-500",  badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400" },
  { id: "offer",      label: "Offer",      color: "border-t-emerald-500",dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" },
  { id: "rejected",   label: "Rejected",   color: "border-t-red-500",    dot: "bg-red-500",     badge: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
];

const SOURCE_ICONS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  linkedin: { label: "LinkedIn",  icon: <Link2 className="w-3 h-3" />, color: "text-blue-600 dark:text-blue-400" },
  website:  { label: "Website",   icon: <Globe className="w-3 h-3" />, color: "text-emerald-600 dark:text-emerald-400" },
  referral: { label: "Referral",  icon: <Users className="w-3 h-3" />, color: "text-violet-600 dark:text-violet-400" },
};

type Job = {
  id: string; company: string; role: string; salary: string;
  location: string; date: string; source: string; logo: string;
  logoColor: string; column: string; notes?: string;
};



const ADD_JOB_FIELDS = [
  { id: "company",  label: "Company",        placeholder: "e.g. Google",          required: true,  half: true },
  { id: "role",     label: "Job Title",      placeholder: "e.g. Senior Engineer", required: true,  half: true },
  { id: "salary",   label: "Salary Range",   placeholder: "e.g. $150k–$180k",                      half: true },
  { id: "location", label: "Location",       placeholder: "e.g. Remote",                            half: true },
  { id: "source",   label: "Source",         type: "select" as const, placeholder: "How did you find it?", half: true,
    options: [
      { value: "linkedin", label: "LinkedIn" },
      { value: "website",  label: "Company Website" },
      { value: "referral", label: "Referral" },
    ],
  },
  { id: "status",   label: "Status",         type: "select" as const, placeholder: "Pipeline stage", half: true,
    options: COLUMNS.map((c) => ({ value: c.id, label: c.label })),
  },
  { id: "notes",    label: "Notes",          type: "textarea" as const, placeholder: "Any notes about this application…" },
];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const dragJobRef = useRef<string | null>(null);

  const fetchJobs = async () => {
    if (!user) return;
    try {
      const data = await getApplications(user.id);
      setJobs(data as any);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const filtered = jobs.filter(
    (j) =>
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragStart = (id: string) => { dragJobRef.current = id; };
  const handleDrop = async (colId: string) => {
    if (!dragJobRef.current || !user) return;
    const jobId = dragJobRef.current;
    
    // Optimistic UI update
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, column: colId } : j));
    dragJobRef.current = null;

    try {
      await updateApplicationColumn(user.id, jobId, colId);
    } catch (err) {
      console.error("Error dragging application:", err);
      fetchJobs(); // Rollback
    }
  };

  const handleAddJob = async (data: Record<string, string>) => {
    if (!user) return;
    const logoColors = ["bg-blue-500","bg-violet-500","bg-emerald-500","bg-rose-500","bg-amber-500","bg-indigo-600"];
    const randColor = logoColors[Math.floor(Math.random() * logoColors.length)];
    
    try {
      await addApplication(user.id, {
        company: data.company || "Unknown",
        role: data.role || "Role",
        salary: data.salary || "—",
        location: data.location || "—",
        source: data.source || "linkedin",
        column: data.status || "applied",
        notes: data.notes || undefined,
        logo: (data.company || "?")[0].toUpperCase(),
        logoColor: randColor,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
      fetchJobs();
    } catch (err) {
      console.error("Error adding application:", err);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!user) return;
    try {
      await deleteApplication(user.id, id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  return (
    <AppLayout title="Job Applications" subtitle="Manage your entire pipeline in one place">
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Job Application"
        fields={ADD_JOB_FIELDS}
        submitLabel="Add Application"
        onSubmit={handleAddJob}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            id="app-search"
            placeholder="Search company or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-muted border-transparent text-sm focus:bg-background"
          />
        </div>
        <Button variant="outline" size="sm" id="app-filter-btn" className="h-9 gap-2 rounded-xl text-xs">
          <Filter className="w-3.5 h-3.5" /> Filter
        </Button>
        <Button
          size="sm"
          id="add-job-btn"
          onClick={() => setModalOpen(true)}
          className="h-9 gap-2 bg-primary text-white border-none rounded-xl text-xs hover:bg-primary/90"
        >
          <Plus className="w-3.5 h-3.5" /> Add Job
        </Button>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {COLUMNS.map((col) => {
          const colJobs = filtered.filter((j) => j.column === col.id);
          return (
            <div
              key={col.id}
              id={`kanban-col-${col.id}`}
              className="flex-1 min-w-[220px] max-w-[270px] flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className={cn("bg-card border border-border rounded-xl p-3 mb-3 border-t-2 shadow-sm", col.color)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-sm font-semibold text-foreground">{col.label}</span>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md", col.badge)}>{colJobs.length}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5">
                {colJobs.map((job) => {
                  const src = SOURCE_ICONS[job.source] || SOURCE_ICONS.linkedin;
                  return (
                    <div
                      key={job.id}
                      id={job.id}
                      draggable
                      onDragStart={() => handleDragStart(job.id)}
                      className="bg-card border border-border rounded-xl p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`w-8 h-8 rounded-lg ${job.logoColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                          {job.logo}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate leading-tight">{job.company}</p>
                          <p className="text-xs text-muted-foreground truncate">{job.role}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-primary mb-2.5">{job.salary}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />{job.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 shrink-0" />Applied {job.date}
                        </div>
                        <div className={cn("flex items-center gap-1.5 text-xs font-medium", src.color)}>
                          {src.icon}{src.label}
                        </div>
                      </div>
                      {job.notes && (
                        <div className="mt-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-2.5 py-1.5">
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">{job.notes}</p>
                        </div>
                      )}
                      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                        <button id={`notes-${job.id}`} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                          <StickyNote className="w-3 h-3" /> Notes
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="text-[11px] text-primary hover:underline font-medium">View</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {colJobs.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-1.5 text-center">
                    <p className="text-xs text-muted-foreground">Drop cards here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
