import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  budgetLimit: integer("budget_limit").default(50000).notNull(), // default $500.00
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(), // stored in cents
  type: text("type").notNull(), // income, expense
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recurringTransactions = pgTable("recurring_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(), // stored in cents
  type: text("type").notNull(), // income, expense
  frequency: text("frequency").notNull(), // daily, monthly
  status: text("status").default("active").notNull(), // active, paused
  startDate: timestamp("start_date").notNull(),
  lastProcessedDate: timestamp("last_processed_date"),
  nextProcessedDate: timestamp("next_processed_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
