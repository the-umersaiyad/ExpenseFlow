"use server"

import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTransactions() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return db.select().from(transactions).where(eq(transactions.userId, user.userId)).orderBy(desc(transactions.date));
}

export async function createTransaction(data: { categoryId: number; amount: number; type: string; date: Date; notes?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.insert(transactions).values({
    userId: user.userId,
    ...data
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function updateTransaction(id: number, data: { categoryId: number; amount: number; type: string; date: Date; notes?: string }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(transactions.id, id));

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function deleteTransaction(id: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.delete(transactions).where(eq(transactions.id, id));

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
