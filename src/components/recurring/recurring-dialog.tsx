"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { RecurringForm } from "./recurring-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function RecurringDialog({ trigger, initialData, categories }: { 
  trigger?: React.ReactNode, 
  initialData?: any,
  categories: any[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditing = !!initialData

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger className="bg-primary text-primary-foreground shadow-button px-6 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-colors focus:outline-none">
          <Plus className="w-5 h-5" /> {isEditing ? 'Edit' : 'Create'}
        </DialogTrigger>
      )}
      <DialogContent className="w-[90vw] sm:w-[400px] !max-w-[400px] bg-card border-stroke p-0 gap-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-8 py-6 border-b border-stroke bg-card">
          <DialogTitle className="text-2xl font-bold text-primary-text">
            {isEditing ? 'Edit Recurring' : 'New Recurring'}
          </DialogTitle>
        </DialogHeader>
        <div className="p-8">
          <RecurringForm 
            categories={categories}
            initialData={initialData} 
            onSuccess={() => setIsOpen(false)}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
