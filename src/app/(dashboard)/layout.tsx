import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground w-full selection:bg-primary-soft selection:text-primary-text">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen w-full pb-20 md:pb-0">
          <main className="flex-1 overflow-y-auto w-full max-w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
