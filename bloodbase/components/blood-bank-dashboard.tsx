import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Droplet, Users, AlertTriangle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function BloodBankDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/role-selection">
          <Button variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-white">Blood Bank Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard
          icon={Droplet}
          title="Blood Inventory"
          value="1,250 units"
          description="Current blood stock"
        />
        <DashboardCard
          icon={Users}
          title="Donors Today"
          value="15"
          description="Scheduled donations"
        />
        <DashboardCard
          icon={AlertTriangle}
          title="Critical Shortage"
          value="O-"
          description="Urgent need"
        />
        <DashboardCard
          icon={TrendingUp}
          title="Donation Trend"
          value="+5%"
          description="This week vs last week"
        />
      </div>
    </div>
  )
}

function DashboardCard({ icon: Icon, title, value, description }: { icon: any; title: string; value: string; description: string }) {
  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex items-center space-x-4">
        <Icon className="w-8 h-8 text-red-600" />
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-2xl font-bold text-red-500">{value}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </Card>
  )
}

