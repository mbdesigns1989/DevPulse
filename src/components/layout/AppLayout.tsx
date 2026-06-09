import { Outlet } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Topbar } from "./Topbar"

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Topbar title="DevPulse" />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-4">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
