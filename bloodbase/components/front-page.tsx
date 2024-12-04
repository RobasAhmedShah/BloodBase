import { Button } from "@/components/ui/button"
import { BloodCellAnimation } from "./blood-cell-animation"
import Link from "next/link"

export const FrontPage = () => (
  <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
    <BloodCellAnimation />
    <div className="z-10 text-center space-y-8">
      <h1 className="text-5xl font-bold text-white mb-4">Welcome to BloodChain</h1>
      <p className="text-xl text-gray-300 mb-8">Connecting donors, saving lives</p>
      <Link href="/role-selection">
        <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300">
          Get Started
        </Button>
      </Link>
    </div>
  </div>
)

