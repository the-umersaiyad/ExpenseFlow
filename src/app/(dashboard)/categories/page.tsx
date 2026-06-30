import { getCategories } from "@/app/actions/category"
import { getTransactions } from "@/app/actions/transaction"
import Link from "next/link"
import { AnimeFadeUp } from "@/components/animations/fade-up"
import { Plus, Pencil } from "lucide-react"
import { CategoryDialog } from "@/components/categories/category-dialog"

import { SidebarTrigger } from "@/components/ui/sidebar"

export default async function CategoriesPage() {
  const [categories, transactions] = await Promise.all([
    getCategories(),
    getTransactions()
  ]);

  const expenses = transactions.filter(t => t.type === 'expense');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return (
    <div className="p-6 md:p-8 w-full">
      <AnimeFadeUp delay={0}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden -ml-2 hover:bg-secondary-soft p-2 rounded-lg transition-colors text-secondary-text" />
            <h1 className="text-3xl font-extrabold text-primary-text tracking-tight">Categories</h1>
          </div>
          <CategoryDialog />
        </div>
      </AnimeFadeUp>

      <AnimeFadeUp delay={100}>
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((c, index) => {
            const currentMonthExpenses = expenses.filter(t => {
              if (t.categoryId !== c.id) return false;
              const date = new Date(t.date);
              return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            });
            const spent = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
            const count = currentMonthExpenses.length;
            const budgetLimit = c.budgetLimit || 50000;
            const progress = Math.min((spent / budgetLimit) * 100, 100);
            const isOverBudget = spent > budgetLimit;

            return (
              <AnimeFadeUp key={c.id} delay={200 + index * 50} className="h-full flex flex-col">
                <div className="bg-card border border-stroke shadow-button rounded-2xl p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary-text">
                      <span className="text-2xl">{c.icon || '🏷️'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CategoryDialog 
                        initialData={{ id: c.id, name: c.name, icon: c.icon, budgetLimit: budgetLimit }}
                        trigger={
                          <button className="text-secondary-text hover:text-primary-text transition-colors p-1.5 rounded-full hover:bg-secondary-soft focus:outline-none" title="Edit Category">
                            <Pencil className="w-4 h-4" />
                          </button>
                        } 
                      />
                      {isOverBudget ? (
                        <span className="bg-badge-pending-bg px-3 py-1 rounded-full text-[10px] font-bold text-badge-pending-text uppercase tracking-wider">
                          Over Budget
                        </span>
                      ) : (
                        <span className="bg-badge-active-bg px-3 py-1 rounded-full text-[10px] font-bold text-badge-active-text uppercase tracking-wider">
                          On Track
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-primary-text mb-1 truncate">{c.name}</h3>
                  <p className="text-sm font-medium text-secondary-text mb-6">{count} {count === 1 ? 'Expense' : 'Expenses'} this month</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className={`text-2xl font-bold ${isOverBudget ? 'text-badge-pending-text' : 'text-primary-text'}`}>
                        ₹{(spent / 100).toFixed(2)}
                      </span>
                      <span className="text-sm font-medium text-secondary-text">/ ₹{(budgetLimit / 100).toFixed(2)}</span>
                    </div>
                    
                    <div className="w-full bg-stroke h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isOverBudget ? 'bg-badge-pending-text' : 'bg-primary'}`} 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </AnimeFadeUp>
            )
          })}
          
          {/* Create New Placeholder */}
          <AnimeFadeUp delay={200 + categories.length * 50} className="h-full flex flex-col">
            <CategoryDialog trigger={
              <button className="w-full flex-1 flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-stroke bg-secondary-soft p-6 cursor-pointer hover:bg-stroke/50 transition-colors group min-h-[220px] focus:outline-none focus:ring-2 focus:ring-primary-soft">
                <div className="w-12 h-12 rounded-full bg-bg-white shadow-button flex items-center justify-center text-secondary-text mb-4 group-hover:text-primary-text transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-primary-text mb-1">Create Category</h3>
                <p className="text-sm font-medium text-secondary-text">Set up a new tracking category</p>
              </button>
            } />
          </AnimeFadeUp>
        </div>
      </AnimeFadeUp>
    </div>
  )
}
