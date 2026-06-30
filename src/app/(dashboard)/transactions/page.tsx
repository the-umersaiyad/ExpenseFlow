"use client"

import { useEffect, useState, useMemo } from "react"
import { getTransactions, deleteTransaction } from "@/app/actions/transaction"
import { getCategories } from "@/app/actions/category"
import { AnimeFadeUp } from "@/components/animations/fade-up"
import { 
  Calendar, 
  Download, 
  Plus, 
  Search, 
  ChevronDown, 
  Receipt, 
  Wallet, 
  MoreHorizontal 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TransactionForm } from "@/components/transactions/transaction-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)

  const [searchQuery, setSearchQuery] = useState("")
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) setSearchQuery(q);
    }
  }, [])

  const [typeFilter, setTypeFilter] = useState<"All" | "Income" | "Expense">("All")
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories")
  const [dateFilter, setDateFilter] = useState<"All time" | "This month" | "Last 7 days">("All time")

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(id);
      getTransactions().then(setTransactions);
    }
  }

  useEffect(() => {
    async function loadData() {
      const [t, c] = await Promise.all([getTransactions(), getCategories()])
      setTransactions(t)
      setCategories(c)
    }
    loadData()
  }, [])

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, { name: c.name, icon: c.icon }])), [categories])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const catName = t.categoryId ? categoryMap.get(t.categoryId)?.name?.toLowerCase() || "" : "uncategorized";
        const notes = (t.notes || "").toLowerCase();
        if (!catName.includes(q) && !notes.includes(q)) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== "All") {
        if (t.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
      }

      // Category filter
      if (categoryFilter !== "All Categories") {
        const catName = t.categoryId ? categoryMap.get(t.categoryId)?.name || "Uncategorized" : "Uncategorized";
        if (catName !== categoryFilter) return false;
      }

      // Date filter
      if (dateFilter !== "All time") {
        const tDate = new Date(t.date);
        const now = new Date();
        if (dateFilter === "This month") {
          if (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (dateFilter === "Last 7 days") {
          const diffTime = Math.abs(now.getTime() - tDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          if (diffDays > 7) {
            return false;
          }
        }
      }

      return true;
    });
  }, [transactions, categoryMap, searchQuery, typeFilter, categoryFilter, dateFilter])

  const handleExport = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Notes"];
    const csvRows = [headers.join(",")];
    
    for (const t of filteredTransactions) {
      const date = new Date(t.date).toLocaleDateString();
      const type = t.type;
      const catName = t.categoryId ? categoryMap.get(t.categoryId)?.name || "Uncategorized" : "Uncategorized";
      const amount = (t.amount / 100).toFixed(2);
      const notes = t.notes ? `"${t.notes.replace(/"/g, '""')}"` : "";
      
      csvRows.push([date, type, catName, amount, notes].join(","));
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 w-full">
      <AnimeFadeUp delay={0}>
        {/* Header area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden -ml-2 hover:bg-secondary-soft p-2 rounded-lg transition-colors text-secondary-text" />
            <div>
              <h1 className="text-3xl font-extrabold text-primary-text tracking-tight">Transactions</h1>
              <div className="text-sm text-secondary-text mt-1 flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4" />
                <span>All Time</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <Button onClick={handleExport} variant="outline" className="bg-bg-white border-stroke shadow-button h-11 px-6 rounded-full text-sm font-semibold text-secondary-text uppercase tracking-wider flex-1 md:flex-none flex justify-center items-center gap-2 hover:bg-secondary-soft transition-colors">
              <Download className="w-4 h-4" /> Export
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger className="bg-primary text-primary-foreground shadow-button h-11 px-6 rounded-full text-sm font-semibold uppercase tracking-wider flex-1 md:flex-none flex justify-center items-center gap-2 hover:opacity-90 transition-colors focus:outline-none">
                <Plus className="w-5 h-5" /> New
              </DialogTrigger>
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
        </div>
      </AnimeFadeUp>

      {/* Search & Filters */}
      <AnimeFadeUp delay={100} className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="bg-bg-white border border-stroke rounded-full flex items-center px-4 h-10 min-h-10 shrink-0 flex-1">
          <Search className="text-secondary-text w-4 h-4 mr-2" />
          <input 
            className="bg-transparent border-none outline-none text-sm w-full focus:ring-0 text-primary-text placeholder:text-secondary-text h-full" 
            placeholder="Search transactions..." 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 lg:pb-0">
          <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Income" className="text-badge-active-text">Income</SelectItem>
              <SelectItem value="Expense" className="text-badge-pending-text">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(val: any) => setDateFilter(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All time">All time</SelectItem>
              <SelectItem value="This month">This month</SelectItem>
              <SelectItem value="Last 7 days">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AnimeFadeUp>

      {/* Transactions Table */}
      <AnimeFadeUp delay={200}>
        <div className="bg-card border border-stroke shadow-button rounded-2xl overflow-hidden p-6">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center text-secondary-text">
              <Receipt className="w-16 h-16 mb-4 text-stroke" />
              <h3 className="text-xl font-bold mb-2 text-primary-text">No transactions found</h3>
              <p className="text-sm font-medium mb-6">You haven't recorded any income or expenses matching these filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-stroke hover:bg-transparent">
                    <TableHead className="py-4 text-xs font-semibold text-secondary-text uppercase tracking-wider h-auto">Date</TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-secondary-text uppercase tracking-wider h-auto">Description</TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-secondary-text uppercase tracking-wider h-auto">Category</TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-secondary-text uppercase tracking-wider text-right h-auto">Amount</TableHead>
                    <TableHead className="py-4 text-xs font-semibold text-secondary-text uppercase tracking-wider text-center h-auto">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map(t => {
                    const category = t.categoryId ? categoryMap.get(t.categoryId) : { name: 'Uncategorized', icon: '❓' };
                    const isExpense = t.type === 'expense';
                    
                    return (
                      <TableRow key={t.id} className="border-stroke hover:bg-secondary-soft transition-colors group">
                        <TableCell className="py-4 text-sm font-medium text-secondary-text whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary-text shrink-0">
                              <span className="text-lg">{category?.icon || '🏷️'}</span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-primary-text">{t.notes || category?.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="bg-secondary px-3 py-1 rounded-full text-[10px] font-bold text-primary-text uppercase tracking-wider">
                            {category?.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-right text-lg font-bold tabular-nums whitespace-nowrap">
                          <div className={`font-bold ${isExpense ? 'text-primary-text' : 'text-badge-active-text'}`}>
                            {isExpense ? '-' : '+'}₹{(t.amount / 100).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="w-8 h-8 rounded-full inline-flex items-center justify-center text-secondary-text hover:bg-stroke transition-colors focus:outline-none">
                              <MoreHorizontal className="w-5 h-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-stroke shadow-button rounded-xl">
                              <DropdownMenuItem className="cursor-pointer hover:bg-secondary-soft text-sm font-medium" onClick={() => setEditingTransaction(t)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer hover:bg-secondary-soft text-sm font-medium text-badge-pending-text focus:text-badge-pending-text" onClick={() => handleDelete(t.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </AnimeFadeUp>

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-2xl bg-card border-stroke p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-8 py-6 border-b border-stroke bg-card">
            <DialogTitle className="text-2xl font-bold text-primary-text">Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="p-8 max-h-[80vh] overflow-y-auto">
            {editingTransaction && (
              <TransactionForm 
                categories={categories} 
                initialData={editingTransaction}
                onSuccess={() => {
                  setEditingTransaction(null);
                  getTransactions().then(setTransactions);
                }}
                onCancel={() => setEditingTransaction(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
