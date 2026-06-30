# 💸 ExpenseFlow

**Live Demo:** [https://expense-floww.vercel.app/](https://expense-floww.vercel.app/)

ExpenseFlow is a modern, beautifully designed personal finance tracker built with Next.js. It helps you track your income, expenses, set category budgets, and manage recurring transactions seamlessly with a sleek, animated UI.

## ✨ Features

- **Dashboard & Analytics**: Visualize your cash flow and expense breakdown with interactive charts.
- **Transactions Management**: Add, edit, and categorize your income and expenses.
- **Category Budgets**: Create custom categories with emoji icons and track your spending against monthly budget limits.
- **Recurring Transactions**: Passive sync engine that automatically generates your recurring expenses and incomes without needing a complex background worker.
- **Interactive App Tour**: Built-in guided tour using `driver.js` to onboard new users.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL (via Supabase/Neon)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **UI & Styling**:
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Shadcn UI](https://ui.shadcn.com/) (Base UI)
  - Custom animations with `tw-animate-css` and `animejs`
- **Charts**: [Recharts](https://recharts.org/)
- **State & Forms**: `react-hook-form` + `zod`
- **Authentication**: Custom JWT based authentication (`jsonwebtoken`, `bcryptjs`)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Step 1: Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/expenseflow.git
cd expenseflow

# Install dependencies (uses pnpm, npm, or yarn)
pnpm install
```

### Step 2: Environment Variables

You need to set up your environment variables for the database connection and JWT authentication.

1. Create a `.env.local` file (or just `.env`) in the root of the project:

   ```bash
   touch .env.local
   ```

2. Add the following keys to your `.env.local` file:

   ```env
   # PostgreSQL Connection String (e.g. from Supabase, Neon, or local Postgres)
   DATABASE_URL="postgresql://user:password@host:port/dbname"

   # Secret key for JWT Authentication
   JWT_SECRET="generate-a-strong-secret-key-here"
   ```

### Step 3: Database Setup

Push the Drizzle ORM schema to your PostgreSQL database:

```bash
npx drizzle-kit push
# OR if you have migrations to run manually:
# npx tsx src/db/migrate.ts
```

### Step 4: Run the Development Server

```bash
pnpm dev
# or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app. Create a new account and enjoy tracking your expenses!

## 📝 License

This project is licensed under the MIT License.