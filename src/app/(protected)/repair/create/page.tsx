import { prisma } from '@/lib/prisma'
import CreateRepairForm from './create-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CreateRepairPage() {
  // Fetch active machines from database
  const machines = await prisma.machine.findMany({
    where: { status: 'active' },
    select: { id: true, name: true, dept: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="pb-12">
      {/* Mobile Sticky Header */}
      <header className="sm:hidden bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 py-4 sticky top-0 z-20 flex items-center">
        <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">แจ้งซ่อมใหม่</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Desktop Header Title */}
        <div className="hidden sm:flex items-center mb-8">
          <Link href="/dashboard" className="mr-4 p-2 bg-white rounded-full shadow-sm hover:shadow-md hover:text-blue-600 text-gray-500 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">สร้างรายการแจ้งซ่อม</h1>
            <p className="text-gray-500 mt-1">กรอกข้อมูลเพื่อแจ้งซ่อมเครื่องจักรหรืออุปกรณ์</p>
          </div>
        </div>

        {/* Premium Form Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white p-6 sm:p-10 relative overflow-hidden">
          {/* Subtle glow effect behind form */}
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <CreateRepairForm machines={machines} />
          </div>
        </div>
      </main>
    </div>
  )
}
