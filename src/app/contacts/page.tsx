"use client";

import { AppLayout } from "@/components/app-layout";
import { AppModal } from "@/components/app-modal";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Upload, Link2, Mail, Phone, Tag, ChevronRight, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { getContacts, addContact, deleteContact } from "@/app/actions";

const ADD_CONTACT_FIELDS = [
  { id: "name",          label: "Full Name",       placeholder: "e.g. Sarah Chen",      required: true,  half: true },
  { id: "company",       label: "Company",         placeholder: "e.g. Google",          required: true,  half: true },
  { id: "role",          label: "Job Title",       placeholder: "e.g. Technical Recruiter", required: true, half: true },
  { id: "email",         label: "Email Address",   placeholder: "e.g. s.chen@google.com",               half: true },
  { id: "linkedin",      label: "LinkedIn Profile",placeholder: "e.g. sarahchen (omit url)",            half: true },
  { id: "status",        label: "Relationship Status", type: "select" as const, placeholder: "Select Status", half: true,
    options: [
      { value: "active", label: "Active" },
      { value: "warm",   label: "Warm" },
      { value: "cold",   label: "Cold" },
    ],
  },
  { id: "nextFollowUp",  label: "Next Follow-Up Date", type: "date" as const, placeholder: "Select Date",    half: false },
  { id: "tags",          label: "Tags (comma-separated)", placeholder: "e.g. recruiter, engineering, frontend", half: false },
];

type Contact = {
  id: string; name: string; company: string; role: string; email: string;
  linkedin: string; lastContacted: string; status: string; nextFollowUp: string;
  tags: string[]; initials: string; color: string;
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warm:   "bg-amber-500/10  text-amber-600  dark:text-amber-400",
  cold:   "bg-slate-500/10  text-slate-500  dark:text-slate-400",
};

export default function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const fetchContacts = async () => {
    if (!user) return;
    try {
      const data = await getContacts(user.id);
      setContacts(data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddContact = async (data: Record<string, string>) => {
    if (!user) return;
    const avatarColors = ["bg-blue-500", "bg-purple-500", "bg-rose-500", "bg-orange-500", "bg-emerald-500", "bg-blue-600", "bg-gray-600"];
    const randColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const initials = data.name ? data.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "C";

    const tagsArray = data.tags ? data.tags.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t) : ["recruiter"];

    try {
      await addContact(user.id, {
        name: data.name || "Unnamed Contact",
        company: data.company || "Company",
        role: data.role || "HR",
        email: data.email || "—",
        linkedin: data.linkedin || "—",
        lastContacted: "Just added",
        status: data.status || "active",
        nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
        tags: tagsArray,
        initials,
        color: randColor,
      });
      fetchContacts();
    } catch (err) {
      console.error("Error adding contact:", err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!user) return;
    try {
      await deleteContact(user.id, id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  const triggerCSVUpload = () => {
    csvInputRef.current?.click();
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/);
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const avatarColors = ["bg-blue-500", "bg-purple-500", "bg-rose-500", "bg-orange-500", "bg-emerald-500", "bg-blue-600", "bg-gray-600"];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        if (!row.name && !row.company) continue;

        const name = row.name || "Unnamed Contact";
        const company = row.company || "Company";
        const role = row.role || "HR";
        const email = row.email || "—";
        const linkedin = row.linkedin || "—";
        const status = row.status || "active";
        const nextFollowUp = row.nextfollowup || row.next_followup || "—";

        const randColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
        const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "C";

        try {
          await addContact(user.id, {
            name,
            company,
            role,
            email,
            linkedin,
            lastContacted: "Imported",
            status,
            nextFollowUp,
            tags: ["imported"],
            initials,
            color: randColor,
          });
        } catch (err) {
          console.error("Error importing row:", err);
        }
      }
      fetchContacts();
      if (csvInputRef.current) csvInputRef.current.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <AppLayout title="HR Contacts" subtitle="Your professional network and recruiter CRM">
      <input
        type="file"
        ref={csvInputRef}
        onChange={handleImportCSV}
        className="hidden"
        accept=".csv"
      />
      <AppModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add HR / Referral Contact"
        fields={ADD_CONTACT_FIELDS}
        submitLabel="Add Contact"
        onSubmit={handleAddContact}
      />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input id="contact-search" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 rounded-xl bg-muted border-transparent text-sm" />
        </div>
        <Button variant="outline" size="sm" id="import-csv-btn" onClick={triggerCSVUpload} className="h-9 gap-2 rounded-xl text-xs">
          <Upload className="w-3.5 h-3.5" /> Import CSV
        </Button>
        <Button
          size="sm"
          id="add-contact-btn"
          onClick={() => setModalOpen(true)}
          className="h-9 gap-2 gradient-brand text-white border-none rounded-xl text-xs hover:opacity-90"
        >
          <Plus className="w-3.5 h-3.5" /> Add Contact
        </Button>
      </div>

      {/* FIX: Wrap table in overflow-x-auto so it scrolls horizontally on smaller screens instead of breaking layout */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table Head */}
          <div className="grid grid-cols-[minmax(160px,2fr)_minmax(100px,1.5fr)_minmax(180px,2fr)_minmax(120px,1.5fr)_minmax(80px,1fr)_minmax(120px,1.5fr)_60px] gap-4 px-5 py-3 border-b border-border/60 bg-muted/30 min-w-[700px]">
            {["Name", "Company", "Email / LinkedIn", "Last Contact", "Status", "Next Follow-Up", "Actions"].map((h) => (
              <span key={h} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/40">
            {filtered.map((c) => (
              <div
                key={c.id}
                id={c.id}
                className="grid grid-cols-[minmax(160px,2fr)_minmax(100px,1.5fr)_minmax(180px,2fr)_minmax(120px,1.5fr)_minmax(80px,1fr)_minmax(120px,1.5fr)_60px] gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors items-center group min-w-[700px]"
              >
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={`${c.color} text-white text-xs font-semibold`}>{c.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.role}</p>
                  </div>
                </div>

                {/* Company */}
                <p className="text-sm text-foreground font-medium truncate">{c.company}</p>

                {/* Email / LinkedIn */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-500">
                    <Link2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">/in/{c.linkedin}</span>
                  </div>
                </div>

                {/* Last Contact */}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3 shrink-0" />
                  {c.lastContacted}
                </div>

                {/* Status */}
                <Badge variant="secondary" className={cn("text-[10px] h-5 px-2 border-0 w-fit capitalize", STATUS_STYLE[c.status])}>
                  {c.status}
                </Badge>

                {/* Next Follow-Up */}
                <div className="flex items-center gap-1.5 text-[11px] text-foreground font-medium">
                  <span>{c.nextFollowUp}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button id={`contact-view-${c.id}`} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tags legend */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Popular tags:</span>
        {["recruiter", "tech-lead", "referral", "interviewer", "manager", "frontend", "fintech"].map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-2 bg-primary/10 text-primary border-0 cursor-pointer hover:bg-primary/20 transition-colors">
            {tag}
          </Badge>
        ))}
      </div>
    </AppLayout>
  );
}
