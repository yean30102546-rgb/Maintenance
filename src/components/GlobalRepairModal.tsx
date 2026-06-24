'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import RepairFormDialog from '@/app/(protected)/dashboard/_components/RepairFormDialog'

type Machine = {
  id: string
  name: string
  dept: string | null
}

export default function GlobalRepairModal({ machines, userDept }: { machines: Machine[], userDept?: string | null }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const isOpen = searchParams.get('action') === 'create-repair'
  
  const handleClose = () => {
    // Remove query param without refreshing
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('action')
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
    
    // Also refresh the data in case a repair was added
    router.refresh()
  }

  return <RepairFormDialog isOpen={isOpen} onClose={handleClose} machines={machines} userDept={userDept} />
}
