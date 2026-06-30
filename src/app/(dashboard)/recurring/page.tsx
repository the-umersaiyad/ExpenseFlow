import { getRecurringTransactions, toggleRecurringTransactionStatus, deleteRecurringTransaction } from "@/app/actions/recurring"
import { getCategories } from "@/app/actions/category"
import { AnimeFadeUp } from "@/components/animations/fade-up"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { RecurringDialog } from "@/components/recurring/recurring-dialog"
import { 
  Play, 
  Pause, 
  Trash2, 
  Pencil,
  Repeat,
  Calendar,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { ActionDialog } from "@/components/ui/action-dialog"

export default async function RecurringPage() {
  const [recurringTransactions, categories] = await Promise.all([
    getRecurringTransactions(),
    getCategories()
  ])

  const categoryMap = new Map(categories.map(c => [c.id, c]))

  return (
    <div className="p-6 md:p-8 w-full">
      <AnimeFadeUp delay={0}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden -ml-2 hover:bg-secondary-soft p-2 rounded-lg transition-colors text-secondary-text" />
            <div>
              <h1 className="text-3xl font-extrabold text-primary-text tracking-tight">Recurring</h1>
              <div className="text-sm text-secondary-text mt-1 flex items-center gap-2 font-medium">
                <Repeat className="w-4 h-4" /> Automate your finances
              </div>
            </div>
          </div>
          <RecurringDialog categories={categories} />
        </div>
      </AnimeFadeUp>

      <AnimeFadeUp delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringTransactions.map((rt, index) => {
            const category = rt.categoryId ? categoryMap.get(rt.categoryId) : null
            const isExpense = rt.type === "expense"
            const isActive = rt.status === "active"

            return (
              <AnimeFadeUp key={rt.id} delay={200 + index * 50} className="h-full">
                <div className={`bg-card border border-stroke shadow-button rounded-2xl p-6 flex flex-col h-full transition-opacity ${!isActive ? 'opacity-70 grayscale-[20%]' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary-text text-xl">
                        {category?.icon || '🏷️'}
                      </div>
                      <div>
                        <h3 className="font-bold text-primary-text">{rt.notes || category?.name || "Recurring"}</h3>
                        <div className="text-xs font-semibold text-secondary-text uppercase tracking-wider mt-1 flex items-center gap-1">
                          <Repeat className="w-3 h-3" /> {rt.frequency}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <RecurringDialog 
                        categories={categories}
                        initialData={rt}
                        trigger={
                          <button className="text-secondary-text hover:text-primary-text transition-colors p-1.5 rounded-full hover:bg-secondary-soft focus:outline-none" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                        }
                      />
                      
                      {/* We'll use a form to trigger the server action to toggle status */}
                      <form action={async () => {
                        "use server"
                        await toggleRecurringTransactionStatus(rt.id, isActive ? "paused" : "active")
                      }}>
                        <button type="submit" className="text-secondary-text hover:text-primary-text transition-colors p-1.5 rounded-full hover:bg-secondary-soft focus:outline-none" title={isActive ? "Pause" : "Resume"}>
                          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      </form>

                      {/* Delete form */}
                      <form action={async () => {
                        "use server"
                        await deleteRecurringTransaction(rt.id)
                      }}>
                        <button type="submit" className="text-badge-pending-text hover:bg-badge-pending-bg transition-colors p-1.5 rounded-full focus:outline-none" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className={`text-2xl font-bold mb-4 ${isExpense ? 'text-primary-text' : 'text-badge-active-text'}`}>
                      {isExpense ? '-' : '+'}₹{(rt.amount / 100).toFixed(2)}
                    </div>
                    
                    <div className="flex justify-between items-center bg-secondary-soft p-3 rounded-xl border border-stroke">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">Next Run</span>
                        <span className="text-xs font-semibold text-primary-text flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {format(new Date(rt.nextProcessedDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      
                      {isActive ? (
                        <span className="bg-badge-active-bg text-badge-active-text px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="bg-badge-pending-bg text-badge-pending-text px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">Paused</span>
                      )}
                    </div>
                  </div>
                </div>
              </AnimeFadeUp>
            )
          })}
          
          {/* Empty State or Create New Placeholder */}
          {recurringTransactions.length === 0 && (
            <AnimeFadeUp delay={200} className="md:col-span-2 lg:col-span-3 w-full">
              <div className="w-full bg-card border-2 border-dashed border-stroke rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary-soft flex items-center justify-center text-secondary-text mb-4">
                  <Repeat className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-primary-text mb-2">No recurring transactions yet</h3>
                <p className="text-secondary-text mb-6">
                  Set up your subscriptions, salary, and daily expenses to have them automatically added to your transactions list.
                </p>
                <RecurringDialog categories={categories} />
              </div>
            </AnimeFadeUp>
          )}
        </div>
      </AnimeFadeUp>
    </div>
  )
}
