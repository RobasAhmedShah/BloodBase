import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, Clock, CalendarIcon, Map, Apple, Bell, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function DonorDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/role-selection">
          <Button variant="ghost" className="text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-white">Today, BloodChain</h2>
        <span className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-white">4</span>
      </div>
      
      <Calendar className="bg-gray-900 border-gray-800 text-white" />
      
      <div className="space-y-4">
        <DashboardItem icon={Clock} title="Track blood donations" subtitle="Usually completed in 30 MIN" />
        <DashboardItem icon={CalendarIcon} title="Schedule donation" subtitle="Next available slot" />
        <DashboardItem icon={Map} title="Find blood bank nearby" subtitle="Within 5km radius" />
        <DashboardItem icon={Apple} title="Healthy meal options" subtitle="Recommended diet plan" />
        <DashboardItem icon={Bell} title="Set bedtime reminder" subtitle="Usually completed in 10 MIN" />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex justify-around">
          <Home className="text-gray-400" />
          <Clock className="text-gray-400" />
          <CalendarIcon className="text-gray-400" />
        </div>
      </nav>
    </div>
  )
}

function DashboardItem({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <Card className="p-4 bg-gray-900 border-gray-800 hover:border-red-600 cursor-pointer transition-colors">
      <div className="flex items-center space-x-4">
        <Icon className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="text-white">{title}</h3>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>
    </Card>
  )
}

