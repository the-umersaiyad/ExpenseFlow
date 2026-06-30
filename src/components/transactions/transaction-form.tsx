"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createTransaction, updateTransaction } from "@/app/actions/transaction"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string(),
  notes: z.string().optional(),
})

interface TransactionFormProps {
  categories: any[]
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransactionForm({ categories, initialData, onSuccess, onCancel }: TransactionFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "expense",
      amount: initialData ? (initialData.amount / 100).toFixed(2) : "",
      categoryId: initialData?.categoryId?.toString() || "",
      date: initialData ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: initialData?.notes || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const amountInCents = Math.round(parseFloat(values.amount) * 100)
      if (isNaN(amountInCents) || amountInCents <= 0) {
        form.setError("amount", { message: "Invalid amount" })
        return
      }

      if (isEditing) {
        await updateTransaction(initialData.id, {
          type: values.type,
          amount: amountInCents,
          categoryId: parseInt(values.categoryId),
          date: new Date(values.date),
          notes: values.notes,
        })
        toast.success("Transaction updated successfully!")
      } else {
        await createTransaction({
          type: values.type,
          amount: amountInCents,
          categoryId: parseInt(values.categoryId),
          date: new Date(values.date),
          notes: values.notes,
        })
        toast.success("Transaction saved successfully!")
      }
      
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error(isEditing ? "Failed to update transaction" : "Failed to save transaction")
    }
  }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const currentType = watch("type");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      {/* Type Selector */}
      <div className="flex gap-2 mb-6 bg-secondary-soft p-1.5 rounded-full border border-stroke">
        <button 
          type="button"
          onClick={() => setValue("type", "expense")}
          className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-center transition-all ${
            currentType === "expense" 
            ? "bg-primary shadow-button text-primary-foreground border border-transparent" 
            : "text-secondary-text hover:text-primary-text hover:bg-white/50"
          }`}
        >
          Expense
        </button>
        <button 
          type="button"
          onClick={() => setValue("type", "income")}
          className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-center transition-all ${
            currentType === "income" 
            ? "bg-primary shadow-button text-primary-foreground border border-transparent" 
            : "text-secondary-text hover:text-primary-text hover:bg-white/50"
          }`}
        >
          Income
        </button>
      </div>

      {/* Amount */}
      <div className="mb-6">
        <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Amount</label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-xl font-bold text-primary-text">₹</span>
          <input 
            {...register("amount")}
            type="number"
            step="0.01"
            className="w-full h-14 bg-bg-white border border-stroke shadow-button rounded-xl pl-9 pr-4 text-lg font-bold text-primary-text placeholder:text-stroke focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all" 
            placeholder="0.00" 
          />
        </div>
        {errors.amount && <p className="text-badge-pending-text text-xs mt-1.5 font-medium">{errors.amount.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Category</label>
          <Select 
            onValueChange={(val) => setValue("categoryId", val || "")} 
            defaultValue={watch("categoryId")}
          >
            <SelectTrigger className="!w-full !h-12 bg-bg-white border border-stroke shadow-button rounded-xl px-4 text-sm font-medium text-primary-text focus:ring-2 focus:ring-primary-soft">
              <span data-slot="select-value" className="flex flex-1 text-left">
                {watch("categoryId") ? (
                  <span className="flex items-center gap-2">
                    {categories.find(c => c.id.toString() === watch("categoryId"))?.icon || '🏷️'} 
                    {categories.find(c => c.id.toString() === watch("categoryId"))?.name || "Unknown"}
                  </span>
                ) : (
                  <span className="text-stroke">Select a category</span>
                )}
              </span>
            </SelectTrigger>
            <SelectContent className="bg-bg-white border-stroke shadow-button rounded-xl overflow-hidden p-1">
              {categories.map(c => (
                <SelectItem 
                  key={c.id} 
                  value={c.id.toString()}
                  className="rounded-lg py-2.5 px-3 text-sm font-medium text-primary-text hover:bg-secondary-soft focus:bg-secondary-soft cursor-pointer transition-colors"
                >
                  {c.icon || '🏷️'} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-badge-pending-text text-xs mt-1.5 font-medium">{errors.categoryId.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Date</label>
          <Popover>
            <PopoverTrigger className="w-full h-12 bg-bg-white border border-stroke shadow-button rounded-xl px-4 flex items-center justify-between text-sm font-medium text-primary-text focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all">
              <span>
                {watch("date") ? new Date(watch("date")).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Select a date"}
              </span>
              <CalendarIcon className="w-4 h-4 text-secondary-text" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={watch("date") ? new Date(watch("date")) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setValue("date", new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-badge-pending-text text-xs mt-1.5 font-medium">{errors.date.message}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Notes (Optional)</label>
        <textarea 
          {...register("notes")}
          className="w-full bg-bg-white border border-stroke shadow-button rounded-xl p-4 text-sm font-medium text-primary-text placeholder:text-stroke min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all" 
          placeholder="Add details about this transaction..."
        ></textarea>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onCancel && (
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit"
          className="flex-[2] h-12 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-button hover:opacity-90 transition-opacity"
        >
          Save Transaction
        </Button>
      </div>
    </form>
  )
}
