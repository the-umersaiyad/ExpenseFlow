"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createRecurringTransaction, updateRecurringTransaction } from "@/app/actions/recurring"
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
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required"),
  categoryId: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "monthly"]),
  startDate: z.string(),
  notes: z.string().optional(),
})

interface RecurringFormProps {
  categories: any[]
  initialData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function RecurringForm({ categories, initialData, onSuccess, onCancel }: RecurringFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialData?.type || "expense",
      amount: initialData ? (initialData.amount / 100).toFixed(2) : "",
      categoryId: initialData?.categoryId?.toString() || "",
      frequency: initialData?.frequency || "monthly",
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString() : new Date().toISOString(),
      notes: initialData?.notes || "",
    },
  })

  const { formState: { isSubmitting }, handleSubmit, register, setValue, watch } = form
  const currentType = watch("type")
  const startDate = watch("startDate")

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = {
        type: values.type,
        amount: Math.round(parseFloat(values.amount) * 100), // convert to cents
        categoryId: parseInt(values.categoryId),
        frequency: values.frequency,
        startDate: new Date(values.startDate),
        notes: values.notes,
      }

      if (isEditing) {
        await updateRecurringTransaction(initialData.id, data)
        toast.success("Recurring transaction updated")
      } else {
        await createRecurringTransaction(data)
        toast.success("Recurring transaction created")
      }
      
      onSuccess?.()
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    }
  }

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

      <div className="mb-6">
        <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Amount</label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-xl font-bold text-primary-text">₹</span>
          <input 
            {...register("amount")}
            type="number" 
            step="0.01"
            placeholder="0.00"
            className="w-full bg-bg-white border border-stroke rounded-xl pl-10 pr-4 py-3 text-lg font-bold text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary transition-all shadow-button"
          />
        </div>
        {form.formState.errors.amount && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Category</label>
        <Select 
          onValueChange={(value) => setValue("categoryId", value)} 
          defaultValue={form.getValues("categoryId")}
        >
          <SelectTrigger className="w-full bg-bg-white border border-stroke rounded-xl px-4 py-6 text-sm font-semibold text-primary-text focus:ring-2 focus:ring-primary-soft focus:border-primary transition-all shadow-button">
            <span data-slot="select-value" className="flex flex-1 text-left">
              {watch("categoryId") ? (
                <span className="flex items-center gap-2">
                  {categories.find(c => c.id.toString() === watch("categoryId"))?.icon || '🏷️'} 
                  {categories.find(c => c.id.toString() === watch("categoryId"))?.name || "Unknown"}
                </span>
              ) : (
                <span className="text-secondary-text">Select a category</span>
              )}
            </span>
          </SelectTrigger>
          <SelectContent className="bg-bg-white border-stroke rounded-xl shadow-header">
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()} className="focus:bg-secondary-soft focus:text-primary-text cursor-pointer rounded-lg my-0.5 font-medium py-2.5 px-3 text-sm">
                <span className="mr-2">{c.icon || '🏷️'}</span> {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.categoryId && (
          <p className="text-red-500 text-xs mt-1">{form.formState.errors.categoryId.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Frequency</label>
        <Select 
          onValueChange={(value: "daily" | "monthly") => setValue("frequency", value)} 
          defaultValue={form.getValues("frequency")}
        >
          <SelectTrigger className="w-full bg-bg-white border border-stroke rounded-xl px-4 py-6 text-sm font-semibold text-primary-text focus:ring-2 focus:ring-primary-soft focus:border-primary transition-all shadow-button">
            <span data-slot="select-value" className="flex flex-1 text-left">
              {watch("frequency") ? (
                <span className="capitalize">{watch("frequency")}</span>
              ) : (
                <span className="text-secondary-text">Select frequency</span>
              )}
            </span>
          </SelectTrigger>
          <SelectContent className="bg-bg-white border-stroke rounded-xl shadow-header">
            <SelectItem value="daily" className="focus:bg-secondary-soft focus:text-primary-text cursor-pointer rounded-lg my-0.5 font-medium">Daily</SelectItem>
            <SelectItem value="monthly" className="focus:bg-secondary-soft focus:text-primary-text cursor-pointer rounded-lg my-0.5 font-medium">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Start Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full bg-bg-white border border-stroke rounded-xl px-4 py-6 text-sm font-semibold text-primary-text hover:bg-secondary-soft focus:ring-2 focus:ring-primary-soft focus:border-primary transition-all shadow-button justify-start text-left",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(new Date(startDate), "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-bg-white border-stroke rounded-2xl shadow-header" align="start">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) => date && setValue("startDate", date.toISOString())}
              initialFocus
              className="p-3"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-8">
        <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Notes (Optional)</label>
        <input 
          {...register("notes")}
          type="text" 
          placeholder="E.g., Netflix Subscription"
          className="w-full bg-bg-white border border-stroke rounded-xl px-4 py-3 text-sm font-medium text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary transition-all shadow-button"
        />
      </div>

      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 bg-bg-white border-stroke text-secondary-text hover:text-primary-text hover:bg-secondary-soft shadow-button py-6 rounded-xl font-bold uppercase tracking-wider text-xs"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-primary text-primary-foreground hover:opacity-90 shadow-button py-6 rounded-xl font-bold uppercase tracking-wider text-xs"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Recurring"}
        </Button>
      </div>
    </form>
  )
}
