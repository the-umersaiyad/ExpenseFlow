"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createCategory, updateCategory } from "@/app/actions/category"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const PREDEFINED_EMOJIS = [
  "🏷️", "🛒", "🍔", "☕", "🚗", "✈️", "🏠", "💡", "📱", "💻", 
  "🏥", "💊", "👕", "🎁", "📚", "🎮", "🍿", "🎵", "💰", "💳",
  "📈", "🎓", "🐶", "🔧", "⛽", "🚲", "🚌", "💇", "💍", "💪",
  "👶", "🍷", "🍕", "🎬", "🎨", "⚽", "🎾", "⛳", "🎣", "🎿"
]

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().optional(),
  budgetLimit: z.number().min(0, "Budget cannot be negative").default(500),
})

interface CategoryFormProps {
  initialData?: {
    id: number
    name: string
    icon?: string | null
    budgetLimit: number
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      icon: initialData?.icon || "🏷️",
      budgetLimit: initialData ? initialData.budgetLimit / 100 : 500,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditing && initialData) {
        await updateCategory(initialData.id, {
          name: values.name,
          icon: values.icon,
          budgetLimit: Math.round(values.budgetLimit * 100),
        })
        toast.success("Category updated successfully!")
      } else {
        await createCategory({
          name: values.name,
          icon: values.icon,
          budgetLimit: Math.round(values.budgetLimit * 100),
        })
        toast.success("Category created successfully!")
      }
      
      router.refresh()
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error(isEditing ? "Failed to update category" : "Failed to create category")
    }
  }

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex gap-4 mb-6">
        <div className="w-28 shrink-0">
          <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Icon</label>
          <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <PopoverTrigger 
              className="w-full h-14 bg-bg-white border border-stroke shadow-button rounded-xl flex items-center justify-center text-2xl focus:outline-none focus:ring-2 focus:ring-primary-soft hover:bg-secondary-soft transition-all"
            >
              {watch("icon") || "🏷️"}
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-3 bg-bg-white border-stroke shadow-header rounded-2xl" align="start">
              <div className="mb-2 px-1 text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                Select an Icon
              </div>
              <div className="grid grid-cols-6 gap-1">
                {PREDEFINED_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setValue("icon", emoji, { shouldValidate: true, shouldDirty: true });
                      setIsEmojiPickerOpen(false);
                    }}
                    className={`text-2xl h-10 w-10 flex items-center justify-center rounded-lg transition-colors hover:bg-secondary-soft focus:bg-secondary-soft focus:outline-none ${watch("icon") === emoji ? 'bg-primary-soft ring-1 ring-primary' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {errors.icon && <p className="text-badge-pending-text text-xs mt-1.5 font-medium">{errors.icon.message}</p>}
        </div>

        <div className="flex-1">
          <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Category Name</label>
          <input 
            {...register("name")}
            type="text"
            className="w-full h-14 bg-bg-white border border-stroke shadow-button rounded-xl px-4 text-sm font-medium text-primary-text placeholder:text-stroke focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all" 
            placeholder="e.g. Groceries" 
          />
          {errors.name && <p className="text-badge-pending-text text-xs mt-1.5 font-medium">{errors.name.message}</p>}
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider mb-2">Monthly Budget Limit (₹)</label>
        <div className="relative flex items-center">
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 text-secondary-text font-bold">
            ₹
          </div>
          <input 
            {...register("budgetLimit", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className="w-full h-14 bg-bg-white border border-stroke shadow-button rounded-xl pl-8 pr-4 text-sm font-medium text-primary-text placeholder:text-stroke focus:outline-none focus:ring-2 focus:ring-primary-soft transition-all" 
            placeholder="500.00" 
          />
        </div>
        {errors.budgetLimit && <p className="text-badge-pending-text text-xs mt-1.5 font-medium">{errors.budgetLimit.message}</p>}
      </div>

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
          {isEditing ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}
