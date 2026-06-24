"use client"

import { usePathname, useRouter } from "next/navigation"
import { GlassTabs } from "@/components/ui/glass-tabs"
import { LayoutDashboard, Calendar, Settings, Wrench } from "lucide-react"

export function ClientNavMenu({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  // Map pathnames to tab IDs
  let activeTab = 'dashboard'
  if (pathname.startsWith('/engineer')) activeTab = 'engineer'
  if (pathname.startsWith('/pm')) activeTab = 'pm'
  if (pathname.startsWith('/admin')) activeTab = 'admin'

  // Build tabs based on role
  const tabs = []

  if (userRole !== 'technician') {
    tabs.push({ 
      id: 'dashboard', 
      label: 'ภาพรวม',
      icon: <LayoutDashboard className="w-4 h-4" />
    })
  }

  if (userRole === 'technician' || userRole === 'engineer' || userRole === 'admin') {
    tabs.push({
      id: 'engineer',
      label: 'งานช่าง',
      icon: <Wrench className="w-4 h-4" />
    })
  }

  tabs.push({
    id: 'pm', 
    label: 'งาน PM',
    icon: <Calendar className="w-4 h-4" />
  })

  if (userRole === 'admin') {
    tabs.push({
      id: 'admin', 
      label: 'Admin',
      icon: <Settings className="w-4 h-4" />
    })
  }

  return (
    <div className="hidden sm:flex items-center">
      <GlassTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => {
          if (id === 'dashboard') router.push('/dashboard')
          if (id === 'engineer') router.push('/engineer')
          if (id === 'pm') router.push('/pm')
          if (id === 'admin') router.push('/admin')
        }}
        // Keep the glass style but add slight contrast for the white navbar background
        className="p-1 bg-slate-50/50 border border-slate-100 shadow-none"
      />
    </div>
  )
}
