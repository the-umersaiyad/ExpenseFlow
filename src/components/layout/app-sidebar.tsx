"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Receipt, 
  Layers, 
  Wallet, 
  BarChart, 
  HelpCircle, 
  LogOut,
  Repeat
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/transactions", icon: Receipt },
  { name: "Categories", href: "/categories", icon: Layers },
  { name: "Recurring", href: "/recurring", icon: Repeat },
]

import { startTour } from "@/components/ui/app-tour"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      className="shadow-sidebar border-0! *:data-[sidebar=sidebar]:p-4 group-data-[state=collapsed]:*:data-[sidebar=sidebar]:p-2 bg-card"
    >
      <SidebarHeader>
        <Link 
          href="/dashboard" 
          className={cn(
            "flex items-center h-12 w-full overflow-hidden transition-all",
            isCollapsed ? "justify-center" : "justify-start gap-2"
          )}
          onClick={() => setOpenMobile(false)}
        >
          <div className="w-8 h-8 rounded bg-bg-primary text-bg-white flex items-center justify-center shrink-0 font-extrabold shadow-button">
            E
          </div>
          {!isCollapsed && (
            <span className="text-xl font-extrabold text-bg-primary tracking-tight whitespace-nowrap">
              ExpenseFlow
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="mt-6">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5" id="tour-sidebar">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        "rounded-full py-2.5 px-4 h-11 text-sm w-full",
                        isActive
                          ? "bg-secondary! text-bg-primary font-semibold! hover:bg-secondary! hover:text-bg-primary!"
                          : "font-medium! text-secondary-text hover:text-primary-text hover:bg-secondary-soft!",
                      )}
                    >
                      <Link 
                        href={item.href} 
                        className="flex items-center gap-3 w-full h-full"
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon className="size-5! shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Help"
              onClick={() => {
                setOpenMobile(false);
                startTour();
              }}
              className="rounded-full py-2.5 px-4 h-11 text-sm font-medium! text-secondary-text hover:text-primary-text hover:bg-secondary-soft! cursor-pointer"
            >
              <HelpCircle className="size-5! shrink-0" />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="rounded-full py-2.5 px-4 h-11 text-sm font-medium! text-badge-pending-text hover:bg-badge-pending-bg cursor-pointer"
              onClick={() => setShowSignOutDialog(true)}
            >
              <LogOut className="size-5! shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="bg-card border-stroke shadow-button rounded-2xl w-[90vw] sm:w-[400px] !max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-primary-text">
              Log out
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-secondary-text mt-2">
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowSignOutDialog(false)}
              className="bg-bg-white border-stroke text-secondary-text hover:text-primary-text hover:bg-secondary-soft shadow-button py-2.5 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-badge-pending-bg hover:bg-badge-pending-bg text-badge-pending-text hover:opacity-80 shadow-button py-2.5 rounded-xl font-bold"
            >
              Log out
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
