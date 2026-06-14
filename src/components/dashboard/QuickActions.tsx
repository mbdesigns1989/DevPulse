import { useNavigate } from "react-router-dom"
import { ListTodo, Settings as SettingsIcon, LayoutDashboard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"

export function QuickActions() {
  const navigate = useNavigate()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <CreateTaskDialog />
          <Button variant="outline" className="h-auto flex-col gap-1 py-3" onClick={() => navigate("/tasks")}>
            <ListTodo className="h-4 w-4" />
            View Tasks
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-1 py-3" onClick={() => navigate("/settings")}>
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-1 py-3" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
