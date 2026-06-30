"use client"

import { useEffect, useState, useMemo } from "react"
import { getTransactions } from "@/app/actions/transaction"
import { getCategories } from "@/app/actions/category"
import { syncRecurringTransactions } from "@/app/actions/recurring"
import Link from "next/link"
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { DateFilterPopover } from "@/components/dashboard/date-filter-popover"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AnimeFadeUp } from "@/components/animations/fade-up"
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  Wallet, 
  TrendingUp, 
  ArrowDown, 
  ArrowUp, 
  ShoppingCart, 
  Briefcase,
  Calendar,
  ChevronDown,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TransactionForm } from "@/components/transactions/transaction-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      // Sync recurring transactions silently in the background
      await syncRecurringTransactions().catch(console.error)
      
      const [t, c] = await Promise.all([getTransactions(), getCategories()])
      setTransactions(t)
      setCategories(c)
    }
    loadData()
  }, [])

  const availableYears = useMemo(() => {
    const yearsMap = new Map<string, string[]>();
    transactions.forEach(t => {
      const d = new Date(t.date);
      const year = d.getFullYear().toString();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const val = `${year}-${month}`;
      
      if (!yearsMap.has(year)) {
        yearsMap.set(year, []);
      }
      if (!yearsMap.get(year)!.includes(val)) {
        yearsMap.get(year)!.push(val);
      }
    });
    
    const sortedYears = Array.from(yearsMap.keys()).sort().reverse();
    
    return sortedYears.map(year => {
      const months = yearsMap.get(year)!.sort().reverse();
      return { year, months };
    });
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      if (filter === "all") return true;
      const tDate = new Date(t.date);
      if (filter === "7days") {
        const diffTime = Math.abs(now.getTime() - tDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 7;
      }
      if (filter === "thismonth") {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      // "YYYY-MM"
      const [year, month] = filter.split('-');
      return tDate.getFullYear() === parseInt(year) && tDate.getMonth() + 1 === parseInt(month);
    });
  }, [transactions, filter])

  const { totalIncome, totalExpense, totalBalance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });
    return { totalIncome: inc, totalExpense: exp, totalBalance: inc - exp };
  }, [filteredTransactions])

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories])

  const chartData = useMemo(() => {
    const dailyDataMap = filteredTransactions.reduce((acc, t) => {
      const dateStr = new Date(t.date).toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = { date: dateStr, income: 0, expense: 0 };
      if (t.type === 'income') acc[dateStr].income += t.amount / 100;
      if (t.type === 'expense') acc[dateStr].expense += t.amount / 100;
      return acc;
    }, {} as Record<string, any>);
    
    const sortedDates = Object.keys(dailyDataMap).sort();
    return sortedDates.map(date => dailyDataMap[date]);
  }, [filteredTransactions])

  const recentTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [filteredTransactions])

  const formatFilterName = (f: string) => {
    if (f === "all") return "All Time"
    if (f === "7days") return "Last 7 Days"
    if (f === "thismonth") return "This Month"
    const [year, month] = f.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="p-6 md:p-8 w-full">
      <AnimeFadeUp delay={0} stagger={100}>
        {/* Header area for Desktop */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2 hover:bg-secondary-soft p-2 rounded-lg transition-colors text-secondary-text" />
            <h1 className="text-3xl font-extrabold text-primary-text tracking-tight">Overview</h1>
            
            <DateFilterPopover 
              filter={filter} 
              setFilter={setFilter} 
              availableYears={availableYears} 
            />
          </div>
          <div className="flex items-center gap-4">
            <button id="tour-new-transaction" onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground shadow-button h-10 px-4 rounded-full text-sm font-semibold flex justify-center items-center gap-2 hover:opacity-90 transition-colors focus:outline-none">
              <Plus className="w-4 h-4" /> New
            </button>
            <button className="bg-bg-white border border-stroke shadow-button rounded-full p-2.5 text-secondary-text hover:text-primary-text transition-colors flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </button>
            <button className="bg-bg-white border border-stroke shadow-button rounded-full p-2.5 text-secondary-text hover:text-primary-text transition-colors flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full overflow-hidden ml-2 flex items-center justify-center bg-bg-primary text-primary-foreground shadow-button">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div id="tour-sidebar-trigger-mobile">
                <SidebarTrigger className="-ml-2 hover:bg-secondary-soft p-2 rounded-lg transition-colors text-secondary-text" />
              </div>
              <h1 className="text-2xl font-extrabold text-primary-text">Overview</h1>
            </div>
            <button id="tour-new-transaction-mobile" onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground shadow-button h-9 px-3 rounded-full text-xs font-semibold flex justify-center items-center gap-1 hover:opacity-90 transition-colors focus:outline-none">
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
          <DateFilterPopover 
            filter={filter} 
            setFilter={setFilter} 
            availableYears={availableYears} 
          />
        </div>
      </AnimeFadeUp>

      <AnimeFadeUp delay={300} stagger={150} id="tour-summary-cards" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Balance */}
        <div className="bg-card border border-stroke shadow-button rounded-2xl p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-secondary-text">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Balance</span>
            <div className="p-2 bg-secondary rounded-full">
              <Wallet className="w-5 h-5 text-bg-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-bg-primary mt-2">₹{(totalBalance / 100).toFixed(2)}</div>
          <div className="text-sm text-secondary-text flex items-center gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-badge-active-text" />
            <span className="text-badge-active-text font-semibold">+Live</span> status
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-card border border-stroke shadow-button rounded-2xl p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-secondary-text">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Income</span>
            <div className="p-2 bg-secondary rounded-full">
              <ArrowDown className="w-5 h-5 text-bg-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-primary-text mt-2">₹{(totalIncome / 100).toFixed(2)}</div>
          <div className="text-sm text-secondary-text mt-1">
            {formatFilterName(filter)}
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-card border border-stroke shadow-button rounded-2xl p-6 flex flex-col gap-2">
          <div className="flex justify-between items-center text-secondary-text">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expense</span>
            <div className="p-2 bg-secondary rounded-full">
              <ArrowUp className="w-5 h-5 text-bg-primary" />
            </div>
          </div>
          <div className="text-3xl font-bold text-primary-text mt-2">₹{(totalExpense / 100).toFixed(2)}</div>
          <div className="text-sm text-secondary-text mt-1">
            {formatFilterName(filter)}
          </div>
        </div>
      </AnimeFadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnimeFadeUp delay={600} className="lg:col-span-2" id="tour-analytics">
          <AnalyticsCharts chartData={chartData} totalBalance={totalBalance} />
        </AnimeFadeUp>
        
        <AnimeFadeUp delay={700} className="lg:col-span-1">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-primary-text">Recent</h3>
              <Link href="/transactions" className="text-xs font-semibold text-bg-primary hover:underline uppercase tracking-wider">View All</Link>
            </div>
            
            {recentTransactions.length > 0 ? recentTransactions.map(t => {
              const categoryName = t.categoryId ? categoryMap.get(t.categoryId) || 'Other' : 'Uncategorized';
              const isExpense = t.type === 'expense';
              return (
                <div key={t.id} className="bg-card border border-stroke shadow-button rounded-2xl p-4 flex justify-between items-center transition-colors hover:bg-secondary-soft">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-bg-primary">
                      {isExpense ? <ShoppingCart className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary-text">{categoryName}</div>
                      <div className="text-xs text-secondary-text">
                        {new Date(t.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                    <span className={`font-bold ${isExpense ? 'text-primary-text' : 'text-badge-active-text'}`}>
                      {isExpense ? '-' : '+'}₹{(t.amount / 100).toFixed(2)}
                    </span>
                </div>
              )
            }) : (
              <div className="bg-secondary-soft rounded-2xl p-6 text-center text-secondary-text border border-stroke border-dashed">
                No recent transactions.
              </div>
            )}
          </div>
        </AnimeFadeUp>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-card border-stroke p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-8 py-6 border-b border-stroke bg-card">
            <DialogTitle className="text-2xl font-bold text-primary-text">Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="p-8 max-h-[80vh] overflow-y-auto">
            <TransactionForm 
              categories={categories} 
              onSuccess={() => {
                setIsDialogOpen(false);
                getTransactions().then(setTransactions);
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
