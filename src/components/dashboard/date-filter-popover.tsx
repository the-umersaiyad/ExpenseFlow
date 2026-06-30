"use client"

import * as React from "react"
import { Calendar, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateFilterPopoverProps {
  filter: string
  setFilter: (val: string) => void
  availableYears: { year: string, months: string[] }[]
}

export function DateFilterPopover({ filter, setFilter, availableYears }: DateFilterPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const currentYear = new Date().getFullYear().toString()
  const [selectedYear, setSelectedYear] = React.useState<string>(
    availableYears.length > 0 ? availableYears[0].year : currentYear
  )

  const formatFilterName = (f: string) => {
    if (f === "all") return "All Time"
    if (f === "7days") return "Last 7 Days"
    if (f === "thismonth") return "This Month"
    const [year, month] = f.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const allMonths = [
    "01", "02", "03", "04", "05", "06", 
    "07", "08", "09", "10", "11", "12"
  ];
  
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleSelect = (val: string) => {
    setFilter(val)
    setOpen(false)
  }

  const activeYearGroup = availableYears.find(y => y.year === selectedYear)
  const activeMonths = activeYearGroup ? activeYearGroup.months : []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex bg-bg-white border border-stroke shadow-button h-10 px-4 rounded-full text-sm font-semibold text-secondary-text items-center justify-center gap-2 whitespace-nowrap hover:bg-secondary-soft transition-colors focus:outline-none w-full md:w-auto">
        <Calendar className="w-4 h-4" />
        {formatFilterName(filter)}
        <ChevronDown className="w-4 h-4 ml-1" />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-card border-stroke shadow-button rounded-2xl" align="start">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-stroke pb-4">
            <Button 
              variant="ghost" 
              onClick={() => handleSelect("all")}
              className={cn("justify-start font-medium h-9 px-3 rounded-lg", filter === "all" ? "bg-secondary-soft text-primary-text" : "text-secondary-text")}
            >
              All Time
              {filter === "all" && <Check className="w-4 h-4 ml-auto" />}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => handleSelect("7days")}
              className={cn("justify-start font-medium h-9 px-3 rounded-lg", filter === "7days" ? "bg-secondary-soft text-primary-text" : "text-secondary-text")}
            >
              Last 7 Days
              {filter === "7days" && <Check className="w-4 h-4 ml-auto" />}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => handleSelect("thismonth")}
              className={cn("justify-start font-medium h-9 px-3 rounded-lg", filter === "thismonth" ? "bg-secondary-soft text-primary-text" : "text-secondary-text")}
            >
              This Month
              {filter === "thismonth" && <Check className="w-4 h-4 ml-auto" />}
            </Button>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-primary-text">Select Month</span>
              {availableYears.length > 0 && (
                <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val || String(new Date().getFullYear()))}>
                  <SelectTrigger className="w-[100px] h-8 text-xs font-semibold bg-bg-white border-stroke shadow-button rounded-full px-3 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-stroke shadow-button rounded-xl p-1">
                    {availableYears.map(y => (
                      <SelectItem 
                        key={y.year} 
                        value={y.year} 
                        className="font-semibold cursor-pointer focus:bg-secondary-soft focus:text-primary-text rounded-lg py-2"
                      >
                        {y.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {allMonths.map((m, i) => {
                const val = `${selectedYear}-${m}`;
                const hasData = activeMonths.includes(val);
                const isSelected = filter === val;
                
                return (
                  <Button
                    key={m}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "h-9 text-xs font-bold shadow-button transition-colors rounded-lg",
                      !hasData && !isSelected && "opacity-40 hover:opacity-100 bg-bg-white border-dashed",
                      isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-bg-white border-stroke text-secondary-text hover:bg-secondary-soft hover:text-primary-text"
                    )}
                    onClick={() => handleSelect(val)}
                  >
                    {monthNames[i]}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
