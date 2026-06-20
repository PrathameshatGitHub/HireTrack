"use server";

import { prisma } from "@/lib/db";


// ==========================================
// APPLICATIONS
// ==========================================

export async function getApplications(userId: string) {
  try {
    return await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return [];
  }
}

export async function addApplication(userId: string, data: {
  company: string;
  role: string;
  salary: string;
  location: string;
  source: string;
  column: string;
  notes?: string;
  logo: string;
  logoColor: string;
  date: string;
}) {
  try {
    return await prisma.application.create({
      data: {
        userId,
        company: data.company,
        role: data.role,
        salary: data.salary,
        location: data.location,
        source: data.source,
        column: data.column,
        notes: data.notes || null,
        logo: data.logo,
        logoColor: data.logoColor,
        date: data.date,
      },
    });
  } catch (error) {
    console.error("Error adding application:", error);
    throw new Error("Failed to add application");
  }
}

export async function updateApplicationColumn(userId: string, id: string, column: string) {
  try {
    return await prisma.application.updateMany({
      where: { id, userId },
      data: { column },
    });
  } catch (error) {
    console.error("Error updating application column:", error);
    throw new Error("Failed to update application column");
  }
}

export async function deleteApplication(userId: string, id: string) {
  try {
    return await prisma.application.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    throw new Error("Failed to delete application");
  }
}

// ==========================================
// CONTACTS
// ==========================================

export async function getContacts(userId: string) {
  try {
    return await prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

export async function addContact(userId: string, data: {
  name: string;
  company: string;
  role: string;
  email: string;
  linkedin: string;
  lastContacted: string;
  status: string;
  nextFollowUp: string;
  tags: string[];
  initials: string;
  color: string;
}) {
  try {
    return await prisma.contact.create({
      data: {
        userId,
        name: data.name,
        company: data.company,
        role: data.role,
        email: data.email,
        linkedin: data.linkedin,
        lastContacted: data.lastContacted,
        status: data.status,
        nextFollowUp: data.nextFollowUp,
        tags: data.tags,
        initials: data.initials,
        color: data.color,
      },
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    throw new Error("Failed to add contact");
  }
}

export async function deleteContact(userId: string, id: string) {
  try {
    return await prisma.contact.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw new Error("Failed to delete contact");
  }
}

// ==========================================
// INTERVIEWS & ROUNDS
// ==========================================

export async function getInterviews(userId: string) {
  try {
    return await prisma.interview.findMany({
      where: { userId },
      include: {
        rounds: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
}

export async function addInterview(userId: string, data: {
  company: string;
  role: string;
  salary: string;
  logo: string;
  logoColor: string;
  rounds: {
    name: string;
    type: string;
    date: string;
    status: string;
    notes?: string;
    checklist?: { id: string; label: string; done: boolean }[];
  }[];
}) {
  try {
    return await prisma.interview.create({
      data: {
        userId,
        company: data.company,
        role: data.role,
        salary: data.salary,
        logo: data.logo,
        logoColor: data.logoColor,
        rounds: {
          create: data.rounds.map((r) => ({
            name: r.name,
            type: r.type,
            date: r.date,
            status: r.status,
            notes: r.notes || null,
            checklist: r.checklist ?? [],
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error adding interview:", error);
    throw new Error("Failed to add interview");
  }
}

export async function updateRoundChecklist(userId: string, roundId: string, checklistJson: any) {
  try {
    return await prisma.interviewRound.update({
      where: { id: roundId },
      data: {
        checklist: checklistJson,
      },
    });
  } catch (error) {
    console.error("Error updating round checklist:", error);
    throw new Error("Failed to update round checklist");
  }
}

export async function addInterviewRound(userId: string, interviewId: string, data: {
  name: string;
  type: string;
  date: string;
  status: string;
  notes?: string;
  checklist?: { id: string; label: string; done: boolean }[];
}) {
  try {
    return await prisma.interviewRound.create({
      data: {
        interviewId,
        name: data.name,
        type: data.type,
        date: data.date,
        status: data.status,
        notes: data.notes || null,
        checklist: data.checklist || [],
      },
    });
  } catch (error) {
    console.error("Error adding interview round:", error);
    throw new Error("Failed to add interview round");
  }
}

// ==========================================
// TASKS & GOALS
// ==========================================

export async function getTasks(userId: string) {
  try {
    return await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export async function addTask(userId: string, data: {
  label: string;
  done: boolean;
  priority: string;
  category: string;
}) {
  try {
    return await prisma.task.create({
      data: {
        userId,
        label: data.label,
        done: data.done,
        priority: data.priority,
        category: data.category,
      },
    });
  } catch (error) {
    console.error("Error adding task:", error);
    throw new Error("Failed to add task");
  }
}

export async function toggleTask(userId: string, id: string, done: boolean) {
  try {
    return await prisma.task.updateMany({
      where: { id, userId },
      data: { done },
    });
  } catch (error) {
    console.error("Error toggling task:", error);
    throw new Error("Failed to toggle task");
  }
}

export async function deleteTask(userId: string, id: string) {
  try {
    return await prisma.task.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
}

export async function getGoals(userId: string) {
  try {
    return await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return [];
  }
}

export async function addGoal(userId: string, data: {
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  try {
    return await prisma.goal.create({
      data: {
        userId,
        label: data.label,
        current: data.current,
        target: data.target,
        color: data.color,
      },
    });
  } catch (error) {
    console.error("Error adding goal:", error);
    throw new Error("Failed to add goal");
  }
}

export async function updateGoalProgress(userId: string, id: string, current: number) {
  try {
    return await prisma.goal.updateMany({
      where: { id, userId },
      data: { current },
    });
  } catch (error) {
    console.error("Error updating goal progress:", error);
    throw new Error("Failed to update goal progress");
  }
}

// ==========================================
// DOCUMENTS
// ==========================================

export async function getDocuments(userId: string) {
  try {
    return await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function addDocument(userId: string, data: {
  name: string;
  type: string;
  category: string;
  size: string;

  fileUrl: string;
  storagePath: string;

  version?: string;
  isDefault?: boolean;
}) {
  try {
    return await prisma.document.create({
      data: {
        userId,

        name: data.name,
        type: data.type,
        category: data.category,

        size: data.size,

        fileUrl: data.fileUrl,
        storagePath: data.storagePath,

        version: data.version || null,
        isDefault: data.isDefault ?? false,
      },
    });
  } catch (error) {
    console.error("Error adding document:", error);
    throw new Error("Failed to add document");
  }
}
export async function deleteDocument(userId: string, id: string) {
  try {
    return await prisma.document.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    throw new Error("Failed to delete document");
  }
}

// ==========================================
// FOLLOW-UPS
// ==========================================

export async function getFollowUps(userId: string) {
  try {
    return await prisma.followUp.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching followups:", error);
    return [];
  }
}

export async function addFollowUp(userId: string, data: {
  company: string;
  contact: string;
  type: string;
  date: string;
  time: string;
  status: string;
  logo: string;
  logoColor: string;
  priority: string;
}) {
  try {
    return await prisma.followUp.create({
      data: {
        userId,
        company: data.company,
        contact: data.contact,
        type: data.type,
        date: data.date,
        time: data.time,
        status: data.status,
        logo: data.logo,
        logoColor: data.logoColor,
        priority: data.priority,
      },
    });
  } catch (error) {
    console.error("Error adding followup:", error);
    throw new Error("Failed to add followup");
  }
}

export async function toggleFollowUp(userId: string, id: string, completed: boolean) {
  try {
    return await prisma.followUp.updateMany({
      where: { id, userId },
      data: { completed },
    });
  } catch (error) {
    console.error("Error toggling followup:", error);
    throw new Error("Failed to toggle followup");
  }
}

export async function deleteFollowUp(userId: string, id: string) {
  try {
    return await prisma.followUp.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    console.error("Error deleting followup:", error);
    throw new Error("Failed to delete followup");
  }
}

// ==========================================
// JOURNAL ENTRIES
// ==========================================

export async function getJournalEntries(userId: string) {
  try {
    return await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return [];
  }
}

export async function addJournalEntry(userId: string, data: {
  date: string;
  title: string;
  preview: string;
  mood: string;
  tags: string[];
  starred?: boolean;
}) {
  try {
    return await prisma.journalEntry.create({
      data: {
        userId,
        date: data.date,
        title: data.title,
        preview: data.preview,
        mood: data.mood,
        tags: data.tags,
        starred: data.starred ?? false,
      },
    });
  } catch (error) {
    console.error("Error adding journal entry:", error);
    throw new Error("Failed to add journal entry");
  }
}

export async function toggleJournalEntryStar(userId: string, id: string, starred: boolean) {
  try {
    return await prisma.journalEntry.updateMany({
      where: { id, userId },
      data: { starred },
    });
  } catch (error) {
    console.error("Error toggling journal entry star:", error);
    throw new Error("Failed to toggle journal entry star");
  }
}

export async function deleteJournalEntry(userId: string, id: string) {
  try {
    return await prisma.journalEntry.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw new Error("Failed to delete journal entry");
  }
}

// ==========================================
// REMINDERS
// ==========================================

export async function getReminders(userId: string) {
  try {
    return await prisma.reminder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return [];
  }
}

export async function addReminder(userId: string, data: {
  title: string;
  desc: string;
  time: string;
  date: string;
  type: string;
  priority: string;
}) {
  try {
    return await prisma.reminder.create({
      data: {
        userId,
        title: data.title,
        desc: data.desc,
        time: data.time,
        date: data.date,
        type: data.type,
        priority: data.priority,
        done: false,
      },
    });
  } catch (error) {
    console.error("Error adding reminder:", error);
    throw new Error("Failed to add reminder");
  }
}

export async function toggleReminder(userId: string, id: string, done: boolean) {
  try {
    return await prisma.reminder.updateMany({
      where: { id, userId },
      data: { done },
    });
  } catch (error) {
    console.error("Error toggling reminder:", error);
    throw new Error("Failed to toggle reminder");
  }
}

export async function deleteReminder(userId: string, id: string) {
  try {
    return await prisma.reminder.deleteMany({
      where: { id, userId },
    });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw new Error("Failed to delete reminder");
  }
}

