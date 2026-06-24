"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Wrench } from "lucide-react"

export function DesktopAddButton() {
  const pathname = usePathname()
  
  // Show only on dashboard
  if (pathname !== '/dashboard') return null

  return (
    <div className="hidden sm:flex sm:items-center z-10">
      <Link href="?action=create-repair" className="btn-liquid-primary px-5 py-2.5 rounded-full text-sm font-semibold flex items-center">
        <Wrench className="w-4 h-4 mr-2" /> แจ้งงานซ่อม
      </Link>
    </div>
  )
}

export function MobileAddButton() {
  const pathname = usePathname()
  
  // Show only on dashboard
  if (pathname !== '/dashboard') return null

  return (
    <Link href="?action=create-repair" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
      <Wrench className="w-5 h-5" />
    </Link>
  )
}

export function MobileFabButton() {
  const pathname = usePathname()
  
  // Show only on dashboard
  if (pathname !== '/dashboard') return null

  return (
    <div className="sm:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <Link href="?action=create-repair" scroll={false}>
        <div className="btn-liquid-fab w-14 h-14 rounded-full flex items-center justify-center">
          <Wrench className="w-6 h-6" />
        </div>
      </Link>
    </div>
  )
}
