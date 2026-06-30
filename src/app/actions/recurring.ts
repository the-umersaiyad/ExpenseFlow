"use server"

import { db } from "@/db";
import { recurringTransactions, transactions } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { eq, desc, and, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRecurringTransactions() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return db.select().from(recurringTransactions).where(eq(recurringTransactions.userId, user.userId)).orderBy(desc(recurringTransactions.createdAt));
}

export async function createRecurringTransaction(data: { categoryId: number; amount: number; type: string; frequency: string; startDate: Date; notes?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.insert(recurringTransactions).values({
    userId: user.userId,
    ...data,
    nextProcessedDate: data.startDate,
  });

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
}

export async function updateRecurringTransaction(id: number, data: { categoryId: number; amount: number; type: string; frequency: string; startDate: Date; notes?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.update(recurringTransactions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(recurringTransactions.id, id));

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
}

export async function toggleRecurringTransactionStatus(id: number, status: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.update(recurringTransactions)
    .set({ status, updatedAt: new Date() })
    .where(eq(recurringTransactions.id, id));

  revalidatePath("/recurring");
}

export async function deleteRecurringTransaction(id: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.delete(recurringTransactions).where(eq(recurringTransactions.id, id));

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
}

export async function syncRecurringTransactions() {
  const user = await getCurrentUser();
  if (!user) return; // Silent fail if not logged in

  const now = new Date();
  
  // Find all active recurring transactions that are due
  const dueTransactions = await db.select()
    .from(recurringTransactions)
    .where(
      and(
        eq(recurringTransactions.userId, user.userId),
        eq(recurringTransactions.status, "active"),
        lte(recurringTransactions.nextProcessedDate, now)
      )
    );

  if (dueTransactions.length === 0) return;

  for (const rt of dueTransactions) {
    let currentProcessDate = new Date(rt.nextProcessedDate);
    
    // Loop to catch up if we missed multiple periods
    while (currentProcessDate <= now) {
      // 1. Insert actual transaction
      await db.insert(transactions).values({
        userId: rt.userId,
        categoryId: rt.categoryId,
        amount: rt.amount,
        type: rt.type,
        date: new Date(currentProcessDate), // Use the date it was supposed to run
        notes: rt.notes ? `${rt.notes} (Auto-generated)` : "Auto-generated recurring transaction",
      });

      // 2. Calculate next process date
      if (rt.frequency === "daily") {
        currentProcessDate.setDate(currentProcessDate.getDate() + 1);
      } else if (rt.frequency === "monthly") {
        currentProcessDate.setMonth(currentProcessDate.getMonth() + 1);
      } else {
        // Fallback for safety to prevent infinite loops if frequency is weird
        currentProcessDate.setDate(currentProcessDate.getDate() + 1);
      }
    }

    // 3. Update the recurring transaction's dates
    await db.update(recurringTransactions)
      .set({
        lastProcessedDate: now,
        nextProcessedDate: currentProcessDate,
        updatedAt: now,
      })
      .where(eq(recurringTransactions.id, rt.id));
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
