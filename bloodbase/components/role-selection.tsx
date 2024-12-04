import { Heart, Building2, Hospital, Shield, UserCircle, Users } from 'lucide-react'
import { Card } from "@/components/ui/card"
import Link from 'next/link'

export function RoleSelection() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center text-white">Choose your role in</h2>
      <p className="text-center text-gray-400">Select one to access roles relevant to you</p>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/donor-dashboard">
          <RoleCard icon={Heart} title="Donor" />
        </Link>
        <Link href="/blood-bank-dashboard">
          <RoleCard icon={Hospital} title="Blood Bank" />
        </Link>
        <Link href="/admin-dashboard">
          <RoleCard icon={Building2} title="Administrator" />
        </Link>
        <Link href="/hospital-dashboard">
          <RoleCard icon={Shield} title="Hospital" />
        </Link>
        <Link href="/medical-dashboard">
          <RoleCard icon={UserCircle} title="Medical" />
        </Link>
        <Link href="/researcher-dashboard">
          <RoleCard icon={Users} title="Researcher" />
        </Link>
      </div>
    </div>
  )
}

function RoleCard({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <Card className="p-4 flex flex-col items-center justify-center space-y-2 bg-gray-900 border-gray-800 hover:border-red-600 cursor-pointer transition-colors">
      <Icon className="w-8 h-8 text-red-600" />
      <span className="text-sm text-gray-300">{title}</span>
    </Card>
  )
}

