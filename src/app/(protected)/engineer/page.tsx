import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import EngineerClient from './EngineerClient'
import JobDetailsModalWrapper from '../dashboard/_components/JobDetailsModalWrapper'
import JobDetailsCard from '../dashboard/_components/JobDetailsCard'

export default async function EngineerPage({ searchParams }: { searchParams: Promise<{ viewJob?: string }> }) {
  const resolvedParams = await searchParams
  const viewJobId = resolvedParams.viewJob

  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value
  
  if (!sessionId) {
    redirect('/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionId }
  })

  if (!dbUser || !['technician', 'engineer', 'admin'].includes(dbUser.role)) {
    redirect('/dashboard')
  }

  // Common select for jobs
  const jobSelect = {
    id: true,
    jobId: true,
    machine: true,
    dept: true,
    detail: true,
    status: true,
    side: true,
    opType: true,
    imgBefore: true,
    createdAt: true,
    technicianId: true,
    technician: { select: { fullname: true } },
    requester: { select: { fullname: true, dept: true } }
  }

  // Fetch all jobs for engineers to see
  const allJobs = await prisma.repairJob.findMany({
    orderBy: { createdAt: 'desc' },
    select: jobSelect
  })

  // Fetch specific job details if viewJob query param is present
  let viewJobData = null
  if (viewJobId) {
    viewJobData = await prisma.repairJob.findUnique({
      where: { id: viewJobId },
      include: {
        requester: true,
        technician: true,
        qcBy: true,
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-10 sm:hidden">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">กระดานงานช่าง</h1>
        <p className="text-sm text-gray-500">ทีมซ่อมบำรุง</p>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="hidden sm:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">กระดานงานช่าง (Engineer Board)</h1>
          <p className="text-gray-500 mt-1">จัดการงานซ่อมและอัปเดตสถานะการดำเนินงาน</p>
        </div>

        <EngineerClient jobs={allJobs} currentUser={dbUser} />

        {/* Job Details Modal */}
        {viewJobData && (
          <JobDetailsModalWrapper isOpen={!!viewJobId}>
            <JobDetailsCard job={viewJobData} dbUser={dbUser} isModal={true} basePath="/engineer" />
          </JobDetailsModalWrapper>
        )}
      </main>
    </div>
  )
}
