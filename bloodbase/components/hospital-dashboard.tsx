import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Droplet, Truck, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export function HospitalDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/role-selection">
          <Button variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-white">Hospital Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DashboardCard
          icon={Droplet}
          title="Blood Inventory"
          value="500 units"
          description="Current hospital stock"
        />
        <DashboardCard
          icon={Truck}
          title="Incoming Shipments"
          value="3"
          description="Expected today"
        />
        <DashboardCard
          icon={Calendar}
          title="Scheduled Procedures"
          value="12"
          description="Requiring blood products"
        />
        <DashboardCard
          icon={AlertCircle}
          title="Critical Requests"
          value="2"
          description="Urgent blood needs"
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

