import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Users, Building2, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/role-selection">
          <Button variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-white">Administrator Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard
          icon={Users}
          title="User Management"
          description="Manage user accounts and permissions"
        />
        <DashboardCard
          icon={Building2}
          title="Facility Overview"
          description="Monitor blood banks and hospitals"
        />
        <DashboardCard
          icon={FileText}
          title="Reports"
          description="Generate and view system reports"
        />
        <DashboardCard
          icon={Settings}
          title="System Settings"
          description="Configure global system parameters"
        />
      </div>
    </div>
  )
}

function DashboardCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <Card className="p-4 bg-gray-900 border-gray-800 hover:border-red-600 cursor-pointer transition-colors">
      <div className="flex items-center space-x-4">
        <Icon className="w-8 h-8 text-red-600" />
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </Card>
  )
}

