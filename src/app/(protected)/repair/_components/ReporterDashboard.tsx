import { JobCard } from './JobCard'
import Link from 'next/link'
import { Plus } from 'lucide-react'

type RepairJob = any // using any for simplicity in this type definition, should be properly typed from Prisma

export function ReporterDashboard({ jobs }: { jobs: RepairJob[] }) {
  const activeJobs = jobs.filter(j => j.status !== 'ซ่อมเสร็จ')
  const completedJobs = jobs.filter(j => j.status === 'ซ่อมเสร็จ')

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">รายการแจ้งซ่อมของฉัน</h2>
      </div>

      {activeJobs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">กำลังดำเนินการ (Active)</h3>
          {activeJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {completedJobs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">ประวัติการซ่อม (History)</h3>
          {completedJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {jobs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">คุณยังไม่มีรายการแจ้งซ่อม</p>
        </div>
      )}

      {/* Floating Action Button for mobile */}
      <Link href="?action=create-repair" scroll={false} className="fixed bottom-6 right-6 w-14 h-14 btn-liquid-fab rounded-full flex items-center justify-center z-50">
        <Plus className="w-8 h-8" />
      </Link>
    </div>
  )
}
