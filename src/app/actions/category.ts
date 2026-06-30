"use server"

import { db } from "@/db";
import { categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return db.select().from(categories).where(eq(categories.userId, user.userId));
}

export async function createCategory(data: { name: string; icon?: string; budgetLimit?: number }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.insert(categories).values({
    userId: user.userId,
    name: data.name,
    icon: data.icon,
    budgetLimit: data.budgetLimit !== undefined ? data.budgetLimit : 50000,
  });

  revalidatePath("/categories");
  revalidatePath("/transactions/new");
}

export async function updateCategory(id: number, data: { name: string; icon?: string; budgetLimit?: number }) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await db.update(categories)
    .set({
      name: data.name,
      icon: data.icon,
      budgetLimit: data.budgetLimit !== undefined ? data.budgetLimit : 50000,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id));

  revalidatePath("/categories");
}
