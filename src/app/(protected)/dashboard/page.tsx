import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const mockSessionId = cookieStore.get('mock_session_id')?.value
  
  let authId = mockSessionId

  if (!authId) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/login')
    }
    authId = user.id
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseAuthId: authId }
  })

  if (!dbUser) {
    redirect('/register')
  }

  // Common select for jobs
  const jobSelect = {
    id: true,
    jobId: true,
    machine: true,
    dept: true,
    detail: true,
    status: true,
    createdAt: true,
    technician: { select: { fullname: true } }
  }

  // Fetch jobs for the Reporter
  const myRequestedJobs = await prisma.repairJob.findMany({
    where: { requesterId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    select: jobSelect
  })

  return (
    <div className="min-h-screen bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-white">
      <header className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-gray-100 px-4 py-4 sticky top-0 z-10 sm:hidden">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">ภาพรวม (Overall)</h1>
        <p className="text-sm text-gray-500">สวัสดี, {dbUser.fullname}</p>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="hidden sm:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ภาพรวม (Overall)</h1>
          <p className="text-gray-500 mt-1">ยินดีต้อนรับกลับมา, {dbUser.fullname}</p>
        </div>

        {/* Pass data to Client Component for Framer Motion animations */}
        <DashboardClient jobs={myRequestedJobs} />
      </main>
    </div>
  )
}
