"use client";

import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2, Eye, FileText, File, Award, Plus, FolderOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-provider";
import { getDocuments, addDocument, deleteDocument } from "@/app/actions";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Doc = {
  id: string;

  name: string;
  type: string;
  category: string;

  size: string;

  fileUrl: string;
  storagePath: string;

  version?: string | null;
  isDefault?: boolean;

  createdAt: Date;
};

const CATEGORIES = [
  { id: "all",    label: "All Files",     icon: FolderOpen },
  { id: "resume", label: "Resumes",       icon: FileText },
  { id: "cover",  label: "Cover Letters", icon: File },
  { id: "cert",   label: "Certificates",  icon: Award },
  { id: "other",  label: "Other",         icon: FileText },
];

const CAT_COLOR: Record<string, string> = {
  resume: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  cover:  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  cert:   "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  other:  "bg-slate-500/10 text-slate-500",
};

const CAT_ICON: Record<string, React.ElementType> = {
  resume: FileText, cover: File, cert: Award, other: FileText,
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getDocuments(user.id);
      setDocuments(data as Doc[]);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Format size
    let sizeStr = "0 KB";
    if (file.size > 1024 * 1024) {
      sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    } else {
      sizeStr = (file.size / 1024).toFixed(0) + " KB";
    }

    // Determine category based on currently selected tab, or fallback
    let category = "other";
    if (activeCategory !== "all") {
      category = activeCategory;
    } else if (file.name.toLowerCase().includes("resume")) {
      category = "resume";
    } else if (file.name.toLowerCase().includes("cover")) {
      category = "cover";
    } else if (file.name.toLowerCase().includes("cert")) {
      category = "cert";
    }

    const typeStr = file.name.split(".").pop()?.toUpperCase() || "PDF";

   try {
  const filePath =
    `${user.id}/${Date.now()}-${file.name}`;

  const { error: uploadError } =
    await supabase.storage
      .from("documents")
      .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } =
    supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

  await addDocument(user.id, {
    name: file.name,

    type: typeStr,

    category,

    size: sizeStr,

    fileUrl: publicUrlData.publicUrl,

    storagePath: filePath,

    version:
      category === "resume"
        ? "v1.0"
        : undefined,

    isDefault:
      category === "resume" &&
      !documents.some(
        d =>
          d.category === "resume" &&
          d.isDefault
      ),
  });

  fetchDocs();
} catch (err) {
  console.error(
    "Error uploading document:",
    err
  );
}
  };

 const handleDelete = async (
  id: string
) => {
  if (!user) return;

  try {
    const doc =
      documents.find(
        d => d.id === id
      );

    if (doc?.storagePath) {
      await supabase.storage
        .from("documents")
        .remove([
          doc.storagePath
        ]);
    }

    await deleteDocument(
      user.id,
      id
    );

    setDocuments(prev =>
      prev.filter(
        d => d.id !== id
      )
    );
  } catch (err) {
    console.error(
      "Error deleting document:",
      err
    );
  }
};

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const filtered = activeCategory === "all" ? documents : documents.filter((d) => d.category === activeCategory);

  return (
    <AppLayout title="Resume & Documents" subtitle="Manage all your career documents in one place">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            id={`doc-cat-${cat.id}`}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150",
              activeCategory === cat.id
                ? "gradient-brand text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
            <span className={cn("ml-0.5 px-1.5 rounded-full text-[10px] font-semibold",
              activeCategory === cat.id ? "bg-white/20 text-white" : "bg-background text-muted-foreground"
            )}>
              {cat.id === "all" ? documents.length : documents.filter((d) => d.category === cat.id).length}
            </span>
          </button>
        ))}
        <Button
          id="upload-doc-btn"
          size="sm"
          onClick={triggerUpload}
          className="ml-auto h-9 gap-2 gradient-brand text-white border-none rounded-xl text-xs"
        >
          <Upload className="w-3.5 h-3.5" /> Upload Document
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        /* Document Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Upload placeholder */}
          <button
            id="upload-new-btn"
            onClick={triggerUpload}
            className="border-2 border-dashed border-border/60 rounded-2xl p-6 flex flex-col items-center gap-2 text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground">Upload New</p>
            <p className="text-[10px] text-muted-foreground">PDF, DOCX, PNG</p>
          </button>

          {filtered.map((doc) => {
            const Icon = CAT_ICON[doc.category] || FileText;
            return (
              <div
                key={doc.id}
                id={doc.id}
                className="bg-card border border-border/60 rounded-2xl p-4 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 group flex flex-col gap-3"
              >
                {/* Icon + name */}
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", CAT_COLOR[doc.category] || "bg-slate-500/10 text-slate-500")}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground leading-tight truncate" title={doc.name}>{doc.name}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 border-0 bg-muted text-muted-foreground">{doc.type}</Badge>
                      {doc.version && (
                        <Badge variant="secondary" className={cn("text-[9px] h-4 px-1.5 border-0", CAT_COLOR[doc.category] || "bg-slate-500/10")}>{doc.version}</Badge>
                      )}
                      {doc.isDefault && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 border-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Default</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="text-[10px] text-muted-foreground space-y-0.5">
                  <p>{doc.size} · Updated {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  <button
  id={`preview-${doc.id}`}
  onClick={() =>
    window.open(doc.fileUrl, "_blank")
  }
  className="flex-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors py-1 rounded-lg hover:bg-muted"
>
  <Eye className="w-3 h-3" />
  Preview
</button>
                 <a
  id={`download-${doc.id}`}
  href={doc.fileUrl}
  target="_blank"
  rel="noopener noreferrer"
  download
  className="flex-1 flex items-center justify-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors py-1 rounded-lg hover:bg-primary/10"
>
  <Download className="w-3 h-3" />
  Download
</a>
                  <button
                    id={`delete-${doc.id}`}
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
