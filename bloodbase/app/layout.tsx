import "@/styles/globals.css"
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BloodChain - Blood Donation Platform",
  description: "Connect donors with blood banks and hospitals",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-900 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-white text-2xl font-bold">BloodChain</Link>
            <div className="space-x-4">
              <Link href="/" className="text-white hover:text-red-500">Home</Link>
              <Link href="/role-selection" className="text-white hover:text-red-500">Get Started</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}

