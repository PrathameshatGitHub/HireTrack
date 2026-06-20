"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FieldDef {
  id: string;
  label: string;
  type?: "text" | "select" | "textarea" | "date";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  half?: boolean;
}

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldDef[];
  submitLabel?: string;
  onSubmit?: (data: Record<string, string>) => void;
}

export function AppModal({ open, onClose, title, fields, submitLabel = "Save", onSubmit }: AppModalProps) {
  // FIX: Use controlled state for all fields so Select values are captured correctly.
  // Previously, shadcn Select doesn't integrate with native FormData, so select values were always empty.
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.id, ""]))
  );

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
    // Reset form state on submit
    setValues(Object.fromEntries(fields.map((f) => [f.id, ""])));
    onClose();
  };

  const handleClose = () => {
    setValues(Object.fromEntries(fields.map((f) => [f.id, ""])));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg rounded-2xl border border-border bg-card shadow-xl p-0 overflow-hidden animate-modal-in">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">{title}</DialogTitle>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 grid grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.id} className={cn(field.half ? "col-span-1" : "col-span-2")}>
                <label htmlFor={field.id} className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>

                {field.type === "select" ? (
                  <Select
                    value={values[field.id]}
                    onValueChange={(val) => handleChange(field.id, val as string)}
                  >
                    <SelectTrigger id={field.id} className="h-9 rounded-xl text-sm bg-muted border-transparent focus:bg-background">
                      <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border">
                      {field.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="text-sm rounded-lg">
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.id}
                    value={values[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="rounded-xl text-sm bg-muted border-transparent focus:bg-background resize-none"
                  />
                ) : (
                  <Input
                    id={field.id}
                    value={values[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    type={field.type === "date" ? "date" : "text"}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="h-9 rounded-xl text-sm bg-muted border-transparent focus:bg-background"
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="px-6 pb-5 pt-2 flex gap-2 justify-end border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} className="h-9 rounded-xl text-xs px-4">
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-xl text-xs px-5 bg-primary text-primary-foreground hover:bg-primary/90 border-none"
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
